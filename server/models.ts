import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  avatar: String,
  isOnboardingComplete: { type: Boolean, default: false },
  onboardingData: { type: Object },
  examDate: { type: String, default: '2026-04-15' },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  settings: {
    morningEmail: { type: Boolean, default: true },
    eveningEmail: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: true },
    streakWarning: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' }
  }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

const DailyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  completions: [{
    blockId: String,
    status: { type: String, enum: ['Done', 'Skipped', 'Partial', 'Pending'], default: 'Pending' },
    notes: String
  }],
  score: { type: Number, default: 0 }
}, { timestamps: true });

DailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });
export const DailyProgress = mongoose.model('DailyProgress', DailyProgressSchema);

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  subject: String,
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  dueDate: String,
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export const Task = mongoose.model('Task', TaskSchema);

const SubjectNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: String,
  topicId: String,
  note: String,
  confidence: { type: Number, default: 0 }
}, { timestamps: true });

SubjectNoteSchema.index({ userId: 1, subjectId: 1, topicId: 1 }, { unique: true });
export const SubjectNote = mongoose.model('SubjectNote', SubjectNoteSchema);
