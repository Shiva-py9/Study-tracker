import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import { Resend } from 'resend';
import { format } from 'date-fns';
import { User, DailyProgress, Task, SubjectNote } from './server/models.ts';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  // Middleware to protect API routes
  const authenticate = async (req: any, res: any, next: any) => {
    console.log(`[Auth] Authenticating ${req.method} ${req.path}`);
    let token = req.cookies?.token;

    // Fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log(`[Auth] Using token from Authorization header for ${req.path}`);
    }

    if (!token) {
      console.log(`[Auth] No token found for ${req.path}`);
      return res.status(401).json({ error: 'Unauthorized', details: 'No token provided' });
    }
    if (mongoose.connection.readyState !== 1) {
      console.error(`[Auth] DB not connected during authentication for ${req.path}`);
      return res.status(503).json({ error: 'Database not connected' });
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      console.log(`[Auth] Token decoded for user ID: ${decoded.id}`);
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        console.log(`[Auth] User not found in DB for ID: ${decoded.id}`);
        return res.status(401).json({ error: 'User not found' });
      }
      next();
    } catch (err: any) {
      console.error(`[Auth] JWT verification failed for ${req.path}: ${err.message}`);
      res.status(401).json({ error: 'Unauthorized', details: err.message });
    }
  };

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  mongoose.set('bufferCommands', false); // Disable buffering to prevent hanging on DB calls if not connected
  
  if (MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://'))) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (err: any) {
      console.error('MongoDB connection error:', err.message);
      console.log('Continuing without MongoDB (Guest Mode only)...');
    }
  } else if (MONGODB_URI) {
    console.warn('Invalid MONGODB_URI scheme. Expected "mongodb://" or "mongodb+srv://". Continuing without MongoDB (Guest Mode only)...');
  } else {
    console.warn('MONGODB_URI not found. Continuing without MongoDB (Guest Mode only)...');
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (!resend) {
    console.warn('RESEND_API_KEY not found. Email notifications will be disabled.');
  }

  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite dev
  }));
  app.use(cors({
    origin: (origin, callback) => {
      // Allow any origin that ends with .run.app or is localhost
      if (!origin || origin.endsWith('.run.app') || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to allow all for now to debug
      }
    },
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.get('/api/auth/config-status', (req, res) => {
    const host = req.get('host');
    const protocol = req.protocol;
    const currentUrl = `${protocol}://${host}`;
    const appUrl = process.env.APP_URL || currentUrl;
    
    res.json({
      googleConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      appUrl: appUrl,
      callbackUrl: `${appUrl.replace(/\/$/, '')}/auth/google/callback`
    });
  });

  // Merge Guest Data Endpoint
  app.post("/api/user/merge", authenticate, async (req: any, res) => {
    try {
      const { tasks, completions, onboardingData } = req.body;
      const user = req.user;

      // Merge Onboarding Data if user doesn't have it
      if (!user.isOnboardingComplete && onboardingData) {
        user.onboardingData = onboardingData;
        user.isOnboardingComplete = true;
        user.name = onboardingData.name || user.name;
        user.examDate = onboardingData.examDate || user.examDate;
      }

      // Merge Tasks
      if (tasks && Array.isArray(tasks)) {
        for (const guestTask of tasks) {
          await Task.create({
            ...guestTask,
            userId: user._id,
            _id: undefined // Let MongoDB generate new ID
          });
        }
      }

      // Merge Completions
      if (completions && typeof completions === 'object') {
        for (const [blockId, guestCompletion] of Object.entries(completions)) {
          const { status, notes } = guestCompletion as any;
          // For simplicity, we'll assume today's date for guest completions if not provided
          // In a real app, we'd need the date from the guest data
          const date = format(new Date(), 'yyyy-MM-dd'); 
          
          let progress = await DailyProgress.findOne({ userId: user._id, date });
          if (!progress) {
            progress = new DailyProgress({ userId: user._id, date, completions: [] });
          }
          
          const existing = progress.completions.find((c: any) => c.blockId === blockId);
          if (!existing) {
            progress.completions.push({ blockId, status, notes });
            await progress.save();
          }
        }
      }

      await user.save();
      res.json({ success: true, message: "Data merged successfully" });
    } catch (error) {
      console.error("Merge error:", error);
      res.status(500).json({ error: "Failed to merge data" });
    }
  });

  // Passport Setup
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const googleCallbackUrl = `${appUrl.replace(/\/$/, '')}/auth/google/callback`;

  console.log('--- Google OAuth Configuration ---');
  console.log('Client ID:', googleClientId ? 'Configured' : 'MISSING (using dummy)');
  console.log('Client Secret:', googleClientSecret ? 'Configured' : 'MISSING (using dummy)');
  console.log('App URL:', appUrl);
  console.log('Callback URL:', googleCallbackUrl);
  console.log('----------------------------------');

  if (!googleClientId || !googleClientSecret) {
    console.warn('CRITICAL: Google OAuth credentials are missing. Google Login will fail with 403 or other errors.');
    console.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the Settings menu.');
  }

  passport.use(new GoogleStrategy({
    clientID: googleClientId || 'dummy',
    clientSecret: googleClientSecret || 'dummy',
    callbackURL: googleCallbackUrl,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          name: profile.displayName || profile.emails?.[0].value.split('@')[0] || 'Shiva User',
          avatar: profile.photos?.[0].value,
          isOnboardingComplete: false
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err as Error);
    }
  }));

  // Auth Routes
  app.get('/auth/google', (req, res, next) => {
    console.log('[Auth] Initiating Google OAuth...');
    console.log('[Auth] Protocol:', req.protocol);
    console.log('[Auth] Host:', req.get('host'));
    console.log('[Auth] X-Forwarded-Proto:', req.get('x-forwarded-proto'));
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
  });

  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), (req: any, res) => {
    console.log('[Auth] Google OAuth callback successful for user:', req.user.email);
    const token = jwt.sign({ id: req.user._id.toString() }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    // Append token to hash for frontend to pick up if cookies are blocked
    res.redirect(`/#token=${token}`);
  });

  app.post('/api/auth/signup', async (req, res) => {
    console.log('Signup request received:', req.body.email);
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected during signup');
      return res.status(503).json({ error: 'Database not connected. Please check MONGODB_URI in settings.' });
    }
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        console.log('Missing fields in signup');
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        console.log('User already exists:', email);
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ 
        email, 
        password: hashedPassword, 
        name,
        isOnboardingComplete: false 
      });
      console.log('User created:', user._id);

      const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({ user, token });
    } catch (err: any) {
      console.error('Signup error in backend:', err);
      res.status(500).json({ error: 'Signup failed: ' + err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('[AuthLogin] Attempt for:', email);
    if (mongoose.connection.readyState !== 1) {
      console.error('[AuthLogin] Database not connected during login');
      return res.status(503).json({ error: 'Database not connected. Please check MONGODB_URI in settings.' });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('[AuthLogin] User not found:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      if (!user.password) {
        console.log('[AuthLogin] User has no password (Google user?):', email);
        return res.status(401).json({ error: 'Please use Google login for this account' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('[AuthLogin] Password mismatch for:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
      
      console.log('[AuthLogin] Success for:', email, 'onboardingComplete:', user.isOnboardingComplete);
      res.json({ user, token });
    } catch (err: any) {
      console.error('[AuthLogin] Login error:', err);
      res.status(500).json({ error: 'Login failed: ' + err.message });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    console.log('[AuthMe] Checking session...');
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('[AuthMe] Using token from Authorization header');
    }

    if (!token) {
      console.log('[AuthMe] No token found');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('[AuthMe] User not found for token');
        return res.status(401).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err: any) {
      console.log('[AuthMe] Token invalid:', err.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Progress Routes
  app.get('/api/progress', authenticate, async (req: any, res) => {
    const progress = await DailyProgress.find({ userId: req.user._id });
    res.json(progress);
  });

  app.post('/api/progress', authenticate, async (req: any, res) => {
    const { date, blockId, status, notes } = req.body;
    let progress = await DailyProgress.findOne({ userId: req.user._id, date });
    if (!progress) {
      progress = new DailyProgress({ userId: req.user._id, date, completions: [] });
    }
    const existing = progress.completions.find((c: any) => c.blockId === blockId);
    if (existing) {
      if (status) existing.status = status;
      if (notes !== undefined) existing.notes = notes;
    } else {
      progress.completions.push({ blockId, status: status || 'Pending', notes });
    }
    
    // Calculate score
    const doneCount = progress.completions.filter((c: any) => c.status === 'Done').length;
    // Assuming total blocks per day is variable, but we can pass it or calculate from schedule data
    // For now, simple count
    progress.score = doneCount; 

    await progress.save();
    res.json(progress);
  });

  // Task Routes
  app.get('/api/tasks', authenticate, async (req: any, res) => {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  });

  app.post('/api/tasks', authenticate, async (req: any, res) => {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.json(task);
  });

  app.patch('/api/tasks/:id', authenticate, async (req: any, res) => {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    res.json(task);
  });

  app.delete('/api/tasks/:id', authenticate, async (req: any, res) => {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  });

  // Email Jobs
  cron.schedule('50 5 * * *', async () => {
    if (!resend) return;
    try {
      const users = await User.find({ 'settings.morningEmail': true });
      for (const user of users) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: user.email,
          subject: "🌅 Good Morning Shiva! Today's Battle Plan",
          html: `<p>Hi ${user.name}, here is your schedule for today...</p>`
        });
      }
    } catch (err) {
      console.error('Morning email job failed:', err);
    }
  });

  // Subject Notes Routes
  app.get('/api/subject-notes/:subjectId', authenticate, async (req: any, res) => {
    const notes = await SubjectNote.find({ userId: req.user._id, subjectId: req.params.subjectId });
    res.json(notes);
  });

  app.post('/api/subject-notes', authenticate, async (req: any, res) => {
    const { subjectId, topicId, note, confidence } = req.body;
    const updated = await SubjectNote.findOneAndUpdate(
      { userId: req.user._id, subjectId, topicId },
      { note, confidence },
      { upsert: true, new: true }
    );
    res.json(updated);
  });

  // User Setup Endpoint
  app.post("/api/user/setup", authenticate, async (req: any, res) => {
    console.log('Received onboarding setup request for user:', req.user._id);
    try {
      const { onboardingData } = req.body;
      const userId = req.user._id;

      if (!onboardingData) {
        console.error('No onboarding data provided');
        return res.status(400).json({ error: "Onboarding data is required" });
      }

      console.log('Onboarding data received for:', req.user.email);
      console.log('Onboarding data content:', JSON.stringify(onboardingData).substring(0, 200) + '...');
      
      // Prepare update object
      const update: any = {
        onboardingData,
        isOnboardingComplete: true
      };

      // Ensure name is updated if provided and valid
      if (onboardingData.name && typeof onboardingData.name === 'string' && onboardingData.name.trim()) {
        update.name = onboardingData.name.trim();
      } else if (!req.user.name) {
        // Fallback if user has no name yet
        update.name = req.user.email.split('@')[0] || 'User';
      }
      
      if (onboardingData.examDate) {
        update.examDate = onboardingData.examDate;
      }

      console.log('Attempting to update user in DB with ID:', userId);
      console.log('Update payload:', JSON.stringify(update).substring(0, 200) + '...');

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        console.error('User not found during update:', userId);
        return res.status(404).json({ error: "User not found during update" });
      }

      console.log('Onboarding data saved successfully for:', updatedUser.email);
      res.json({ success: true, message: "Onboarding complete", user: updatedUser });
    } catch (error: any) {
      console.error("Setup error for user " + req.user?._id + ":", error);
      res.status(500).json({ 
        error: "Failed to save onboarding data", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get User Data Endpoint
  app.get("/api/user/me", authenticate, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  // Update User Settings Endpoint
  app.patch("/api/user/settings", authenticate, async (req: any, res) => {
    try {
      const { name, examDate, settings } = req.body;
      const user = req.user;

      if (name) user.name = name;
      if (examDate) user.examDate = examDate;
      if (settings) {
        user.settings = { ...user.settings, ...settings };
      }

      await user.save();
      res.json({ success: true, user });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log('Starting Vite in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log('Vite middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
