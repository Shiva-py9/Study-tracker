import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface Task {
  id: string;
  text: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
  userId: string;
}

interface Completion {
  id?: string;
  blockId?: string;
  status: 'Done' | 'Skipped' | 'Partial' | 'Pending';
  notes?: string;
}

interface DailyProgress {
  id: string;
  userId: string;
  date: string;
  completions: Completion[];
  score: number;
}

interface Subject {
  id: string;
  name: string;
  credits?: number;
  goal?: string;
  color: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  type: 'study' | 'routine' | 'college' | 'gym' | 'family';
}

interface PlannerBlock {
  id: string;
  type: string;
  subject: string;
  topic: string;
  time: string;
}

interface PlannerDay {
  day: number;
  date: string;
  blocks: PlannerBlock[];
}

interface AppContextType {
  completions: Record<string, Completion>;
  tasks: Task[];
  customSubjects: Subject[];
  routine: {
    weekday: ScheduleItem[];
    weekend: ScheduleItem[];
  };
  planner: PlannerDay[];
  plannerStartDate: string;
  dailyProgress: DailyProgress[];
  userSettings: {
    name: string;
    examDate: string;
    theme: 'dark' | 'light';
    profilePictureUrl?: string;
    notificationSound?: string;
    reminders?: Array<{ id: string; time: string; msg: string; enabled: boolean }>;
    cgpaData?: {
      pastSgpas: number[];
      targetCgpa: number;
      totalSemesters: number;
    };
  };
  subjectNotes: Record<string, { note?: string; confidence?: number }>;
  toggleCompletion: (id: string, status: 'Done' | 'Skipped' | 'Partial' | 'Pending', date: string) => void;
  updateNotes: (id: string, notes: string, date: string) => void;
  updateSubjectNote: (subjectId: string, topicId: string, note: string) => void;
  updateConfidence: (subjectId: string, topicId: string, confidence: number) => void;
  fetchSubjectNotes: (subjectId: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'userId'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addSubject: (subject: Subject) => void;
  updateSettings: (settings: Partial<AppContextType['userSettings']>) => void;
  uploadProfilePicture: (file: File) => Promise<string>;
  updateRoutine: (type: 'weekday' | 'weekend', items: ScheduleItem[]) => void;
  updatePlanner: (planner: PlannerDay[]) => void;
  setPlannerStartDate: (date: string) => void;
  resetProgress: () => void;
  mergeGuestData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

import { SCHEDULE_DATA } from '../data/schedule';

const DEFAULT_WEEKDAY_SCHEDULE: ScheduleItem[] = [
  { id: 'sb1', time: '06:15–07:20 AM', activity: 'Study Block 1 (DE/OS/TAFL)', type: 'study' as const },
  { id: 'r1', time: '06:00 AM', activity: 'Wake Up & Freshen Up', type: 'routine' as const },
  { id: 'r2', time: '07:20–09:00 AM', activity: 'Get Ready + Breakfast + Commute', type: 'routine' as const },
  { id: 'c1', time: '09:00–05:00 PM', activity: 'College', type: 'college' as const },
  { id: 'r3', time: '05:00–06:00 PM', activity: 'Travel + Rest + Snack', type: 'routine' as const },
  { id: 'sb2', time: '06:00–07:20 PM', activity: 'Study Block 2 (DE/OS/TAFL or JAVA/UHV)', type: 'study' as const },
  { id: 'r4', time: '07:20–07:30 PM', activity: 'Get Ready for Gym', type: 'routine' as const },
  { id: 'g1', time: '07:30–08:50 PM', activity: 'GYM 💪', type: 'gym' as const },
  { id: 'r5', time: '08:50–09:30 PM', activity: 'Post-Gym + Dinner', type: 'routine' as const },
  { id: 'f1', time: '09:30–10:30 PM', activity: 'Family Time ❤️', type: 'family' as const },
  { id: 'sb3', time: '10:30–11:30 PM', activity: 'Study Block 3 (JAVA/UHV/Cyber)', type: 'study' as const },
  { id: 'r6', time: '11:30 PM', activity: 'Sleep', type: 'routine' as const },
].sort((a, b) => {
  // Simple sort by time string for now, could be improved
  return a.time.localeCompare(b.time);
});

const DEFAULT_WEEKEND_SCHEDULE: ScheduleItem[] = [
  { id: 'wsb1', time: '06:15–07:20 AM', activity: 'Study Block 1 (DE/OS/TAFL)', type: 'study' as const },
  { id: 'wr1', time: '06:00 AM', activity: 'Wake Up', type: 'routine' as const },
  { id: 'wr2', time: '07:20–09:00 AM', activity: 'Freshen Up + Breakfast', type: 'routine' as const },
  { id: 'wsb2', time: '09:00–10:30 AM', activity: 'Study Block 2', type: 'study' as const },
  { id: 'wsb3', time: '10:50 AM–12:20 PM', activity: 'Study Block 3', type: 'study' as const },
  { id: 'wr3', time: '12:20–01:30 PM', activity: 'Lunch + Rest', type: 'routine' as const },
  { id: 'wsb4', time: '01:30–03:00 PM', activity: 'Study Block 4 (JAVA/UHV)', type: 'study' as const },
  { id: 'wsb5', time: '03:20–04:50 PM', activity: 'Study Block 5 (JAVA/Cyber)', type: 'study' as const },
  { id: 'wsb6', time: '05:10–06:30 PM', activity: 'Study Block 6 (Weak topics/Review)', type: 'study' as const },
  { id: 'wr4', time: '06:30–07:20 PM', activity: 'Wind Down + Get Ready for Gym', type: 'routine' as const },
  { id: 'wg1', time: '07:30–08:50 PM', activity: 'GYM 💪', type: 'gym' as const },
  { id: 'wr5', time: '08:50–09:30 PM', activity: 'Post-Gym + Dinner', type: 'routine' as const },
  { id: 'wf1', time: '09:30–10:30 PM', activity: 'Family Time ❤️', type: 'family' as const },
  { id: 'wsb7', time: '10:30–11:00 PM', activity: 'Revision Notes', type: 'study' as const },
  { id: 'wr6', time: '11:00 PM', activity: 'Sleep', type: 'routine' as const },
].sort((a, b) => a.time.localeCompare(b.time));

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [completions, setCompletions] = useState<Record<string, Completion>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customSubjects, setCustomSubjects] = useState<Subject[]>([]);
  const [subjectNotes, setSubjectNotes] = useState<Record<string, { note?: string; confidence?: number }>>({});
  const [routine, setRoutine] = useState({
    weekday: DEFAULT_WEEKDAY_SCHEDULE,
    weekend: DEFAULT_WEEKEND_SCHEDULE
  });
  const [planner, setPlanner] = useState<PlannerDay[]>(SCHEDULE_DATA);
  const [plannerStartDate, setPlannerStartDateState] = useState('2026-03-23');
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [userSettings, setUserSettings] = useState({
    name: 'Shiva',
    examDate: '2026-04-15',
    theme: 'dark' as 'dark' | 'light',
    profilePictureUrl: '',
    notificationSound: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    reminders: [
      { id: 'r1', time: '06:15', msg: 'Morning Study Block starts now! Peak brain time. 🧠', enabled: true },
      { id: 'r2', time: '18:00', msg: 'Evening Study Block starts now! Stay focused. 📚', enabled: true },
      { id: 'r3', time: '19:20', msg: 'Gym time in 10 mins! Get ready to crush it. 💪', enabled: true },
      { id: 'r4', time: '21:30', msg: 'Family Time! Non-negotiable rest. ❤️', enabled: true },
      { id: 'r5', time: '22:30', msg: 'Final Study Block starts now! Almost done for the day. 🌙', enabled: true },
    ],
    cgpaData: {
      pastSgpas: [],
      targetCgpa: 8.5,
      totalSemesters: 8
    }
  });

  // Real-time listeners
  useEffect(() => {
    if (!user) {
      if (isGuest) {
        // Load from local storage for guest
        const savedCompletions = localStorage.getItem('shiva_completions');
        const savedTasks = localStorage.getItem('shiva_tasks');
        const savedSettings = localStorage.getItem('shiva_settings');
        const savedCustomSubjects = localStorage.getItem('shiva_custom_subjects');
        const savedRoutine = localStorage.getItem('shiva_routine');
        const savedPlanner = localStorage.getItem('shiva_planner');
        const savedPlannerStartDate = localStorage.getItem('shiva_planner_start_date');
        const guestOnboardingData = localStorage.getItem('guest_onboarding_data');

        if (guestOnboardingData) {
          const data = JSON.parse(guestOnboardingData);
          setUserSettings({
            name: data.name,
            examDate: data.examDate,
            theme: 'dark'
          });
          if (data.subjects) {
            const mappedSubjects = data.subjects.map((s: any) => ({
              id: s.id,
              name: s.name,
              credits: s.credits,
              goal: s.goal,
              color: `hsl(${Math.random() * 360}, 70%, 60%)`
            }));
            setCustomSubjects(mappedSubjects);
          }
        } else {
          if (savedSettings) setUserSettings(JSON.parse(savedSettings));
          if (savedCustomSubjects) setCustomSubjects(JSON.parse(savedCustomSubjects));
        }

        if (savedCompletions) setCompletions(JSON.parse(savedCompletions));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedRoutine) setRoutine(JSON.parse(savedRoutine));
        if (savedPlanner) setPlanner(JSON.parse(savedPlanner));
        if (savedPlannerStartDate) setPlannerStartDateState(savedPlannerStartDate);
      }
      return;
    }

    console.log('[AppContext] Setting up Firestore listeners for user:', user.uid);

    // 1. Listen to Tasks
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tasks');
    });

    // 2. Listen to Daily Progress
    const progressQuery = query(collection(db, 'dailyProgress'), where('userId', '==', user.uid));
    const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
      const mappedCompletions: Record<string, Completion> = {};
      const progressData: DailyProgress[] = [];
      snapshot.docs.forEach(doc => {
        const day = doc.data() as DailyProgress;
        progressData.push({ ...day, id: doc.id });
        day.completions.forEach(c => {
          mappedCompletions[c.blockId!] = c;
        });
      });
      setCompletions(mappedCompletions);
      setDailyProgress(progressData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'dailyProgress');
    });

    // 3. Listen to Subject Notes
    const notesQuery = query(collection(db, 'subjectNotes'), where('userId', '==', user.uid));
    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const mapped: Record<string, { note?: string; confidence?: number }> = {};
      snapshot.docs.forEach(doc => {
        const n = doc.data();
        mapped[n.topicId] = { note: n.note, confidence: n.confidence };
      });
      setSubjectNotes(prev => ({ ...prev, ...mapped }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'subjectNotes');
    });

    // 4. Listen to Routine
    const routineDocRef = doc(db, 'userRoutines', user.uid);
    const unsubscribeRoutine = onSnapshot(routineDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoutine(snapshot.data() as any);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'userRoutines');
    });

    // 5. Listen to Planner
    const plannerDocRef = doc(db, 'userPlanners', user.uid);
    const unsubscribePlanner = onSnapshot(plannerDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.planner) setPlanner(data.planner);
        if (data.startDate) setPlannerStartDateState(data.startDate);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'userPlanners');
    });

    // Update settings from user object
    if (user) {
      setUserSettings({
        name: user.name || 'Shiva',
        examDate: user.examDate || '2026-04-15',
        theme: user.settings?.theme || 'dark',
        profilePictureUrl: user.profilePictureUrl || '',
        notificationSound: user.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
        reminders: user.reminders || [
          { id: 'r1', time: '06:15', msg: 'Morning Study Block starts now! Peak brain time. 🧠', enabled: true },
          { id: 'r2', time: '18:00', msg: 'Evening Study Block starts now! Stay focused. 📚', enabled: true },
          { id: 'r3', time: '19:20', msg: 'Gym time in 10 mins! Get ready to crush it. 💪', enabled: true },
          { id: 'r4', time: '21:30', msg: 'Family Time! Non-negotiable rest. ❤️', enabled: true },
          { id: 'r5', time: '22:30', msg: 'Final Study Block starts now! Almost done for the day. 🌙', enabled: true },
        ],
        cgpaData: user.cgpaData || {
          pastSgpas: [],
          targetCgpa: 8.5,
          totalSemesters: 8
        }
      });
    }

    return () => {
      unsubscribeTasks();
      unsubscribeProgress();
      unsubscribeNotes();
      unsubscribeRoutine();
      unsubscribePlanner();
    };
  }, [user, isGuest]);

  const fetchSubjectNotes = (subjectId: string) => {
    // Handled by real-time listener for all notes, or we could filter here
  };

  const updateSubjectNote = async (subjectId: string, topicId: string, note: string) => {
    if (user) {
      try {
        const notesQuery = query(
          collection(db, 'subjectNotes'), 
          where('userId', '==', user.uid),
          where('subjectId', '==', subjectId),
          where('topicId', '==', topicId)
        );
        const snapshot = await getDocs(notesQuery);
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'subjectNotes'), {
            userId: user.uid,
            subjectId,
            topicId,
            note,
            confidence: 0
          });
        } else {
          const docRef = doc(db, 'subjectNotes', snapshot.docs[0].id);
          await updateDoc(docRef, { note });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `subjectNotes/${topicId}`);
      }
    } else {
      const updated = { ...subjectNotes[topicId], note };
      setSubjectNotes(prev => ({ ...prev, [topicId]: updated }));
      localStorage.setItem(`shiva_notes_${subjectId}`, JSON.stringify({ ...subjectNotes, [topicId]: updated }));
    }
  };

  const updateConfidence = async (subjectId: string, topicId: string, confidence: number) => {
    if (user) {
      try {
        const notesQuery = query(
          collection(db, 'subjectNotes'), 
          where('userId', '==', user.uid),
          where('subjectId', '==', subjectId),
          where('topicId', '==', topicId)
        );
        const snapshot = await getDocs(notesQuery);
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'subjectNotes'), {
            userId: user.uid,
            subjectId,
            topicId,
            note: '',
            confidence
          });
        } else {
          const docRef = doc(db, 'subjectNotes', snapshot.docs[0].id);
          await updateDoc(docRef, { confidence });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `subjectNotes/${topicId}`);
      }
    } else {
      const updated = { ...subjectNotes[topicId], confidence };
      setSubjectNotes(prev => ({ ...prev, [topicId]: updated }));
      localStorage.setItem(`shiva_confidence_${subjectId}`, JSON.stringify({ ...subjectNotes, [topicId]: updated }));
    }
  };

  const toggleCompletion = async (id: string, status: 'Done' | 'Skipped' | 'Partial' | 'Pending', date: string) => {
    if (user) {
      try {
        const progressQuery = query(
          collection(db, 'dailyProgress'), 
          where('userId', '==', user.uid),
          where('date', '==', date)
        );
        const snapshot = await getDocs(progressQuery);
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'dailyProgress'), {
            userId: user.uid,
            date,
            completions: [{ blockId: id, status, notes: '' }],
            score: status === 'Done' ? 10 : 0
          });
        } else {
          const docRef = doc(db, 'dailyProgress', snapshot.docs[0].id);
          const dayData = snapshot.docs[0].data() as DailyProgress;
          const completions = [...dayData.completions];
          const index = completions.findIndex(c => c.blockId === id);
          
          if (index >= 0) {
            completions[index] = { ...completions[index], status };
          } else {
            completions.push({ blockId: id, status, notes: '' });
          }
          
          await updateDoc(docRef, { completions });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `dailyProgress/${date}`);
      }
    } else {
      const updated = { ...completions[id], id, status };
      const newCompletions = { ...completions, [id]: updated };
      setCompletions(newCompletions);
      localStorage.setItem('shiva_completions', JSON.stringify(newCompletions));
    }
  };

  const updateNotes = async (id: string, notes: string, date: string) => {
    if (user) {
      try {
        const progressQuery = query(
          collection(db, 'dailyProgress'), 
          where('userId', '==', user.uid),
          where('date', '==', date)
        );
        const snapshot = await getDocs(progressQuery);
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'dailyProgress'), {
            userId: user.uid,
            date,
            completions: [{ blockId: id, status: 'Pending', notes }],
            score: 0
          });
        } else {
          const docRef = doc(db, 'dailyProgress', snapshot.docs[0].id);
          const dayData = snapshot.docs[0].data() as DailyProgress;
          const completions = [...dayData.completions];
          const index = completions.findIndex(c => c.blockId === id);
          
          if (index >= 0) {
            completions[index] = { ...completions[index], notes };
          } else {
            completions.push({ blockId: id, status: 'Pending', notes });
          }
          
          await updateDoc(docRef, { completions });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `dailyProgress/${date}`);
      }
    } else {
      const updated = { ...completions[id], id, notes };
      const newCompletions = { ...completions, [id]: updated };
      setCompletions(newCompletions);
      localStorage.setItem('shiva_completions', JSON.stringify(newCompletions));
    }
  };

  const addTask = async (taskData: any) => {
    if (user) {
      try {
        await addDoc(collection(db, 'tasks'), {
          ...taskData,
          userId: user.uid,
          completed: false
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'tasks');
      }
    } else {
      const newTask = { ...taskData, id: Math.random().toString(36).substr(2, 9), completed: false };
      const newTasks = [...tasks, newTask];
      setTasks(newTasks);
      localStorage.setItem('shiva_tasks', JSON.stringify(newTasks));
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (user) {
      try {
        const docRef = doc(db, 'tasks', id);
        await updateDoc(docRef, { completed: !task.completed });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `tasks/${id}`);
      }
    } else {
      const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      setTasks(newTasks);
      localStorage.setItem('shiva_tasks', JSON.stringify(newTasks));
    }
  };

  const deleteTask = async (id: string) => {
    if (user) {
      try {
        const docRef = doc(db, 'tasks', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
      }
    } else {
      const newTasks = tasks.filter(t => t.id !== id);
      setTasks(newTasks);
      localStorage.setItem('shiva_tasks', JSON.stringify(newTasks));
    }
  };

  const addSubject = (subject: Subject) => {
    const newCustomSubjects = [...customSubjects, subject];
    setCustomSubjects(newCustomSubjects);
    if (!user) {
      localStorage.setItem('shiva_custom_subjects', JSON.stringify(newCustomSubjects));
    }
  };

  const updateSettings = async (settings: Partial<AppContextType['userSettings']>) => {
    const newSettings = { ...userSettings, ...settings };
    setUserSettings(newSettings);
    
    if (!user) {
      localStorage.setItem('shiva_settings', JSON.stringify(newSettings));
    } else {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const updateData: any = {};
        if (settings.name) updateData.name = settings.name;
        if (settings.examDate) updateData.examDate = settings.examDate;
        if (settings.theme) updateData.settings = { ...user.settings, theme: settings.theme };
        if (settings.profilePictureUrl !== undefined) updateData.profilePictureUrl = settings.profilePictureUrl;
        if (settings.notificationSound) updateData.notificationSound = settings.notificationSound;
        if (settings.reminders) updateData.reminders = settings.reminders;
        if (settings.cgpaData) updateData.cgpaData = settings.cgpaData;

        await updateDoc(userDocRef, updateData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string> => {
    if (!user) throw new Error('User must be logged in to upload a profile picture');
    
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
    const storageRef = ref(storage, `profile_pictures/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    await updateSettings({ profilePictureUrl: url });
    return url;
  };

  const mergeGuestData = async () => {
    if (!user) return;
    
    const guestTasks = JSON.parse(localStorage.getItem('shiva_tasks') || '[]');
    const guestCompletions = JSON.parse(localStorage.getItem('shiva_completions') || '{}');
    const guestOnboarding = JSON.parse(localStorage.getItem('guest_onboarding_data') || 'null');

    if (guestTasks.length === 0 && Object.keys(guestCompletions).length === 0 && !guestOnboarding) {
      localStorage.removeItem('shiva_guest_mode');
      return;
    }

    try {
      toast.loading('Merging guest data...', { id: 'merge' });
      
      const batch = writeBatch(db);

      // Merge tasks
      guestTasks.forEach((t: any) => {
        const taskRef = doc(collection(db, 'tasks'));
        batch.set(taskRef, {
          text: t.text,
          subject: t.subject,
          priority: t.priority,
          dueDate: t.dueDate,
          completed: t.completed,
          userId: user.uid
        });
      });

      // Merge completions (simplified: just merge into one day or handle properly)
      // For now, let's just merge onboarding data as it's most critical
      if (guestOnboarding) {
        const userRef = doc(db, 'users', user.uid);
        batch.update(userRef, {
          isOnboardingComplete: true,
          onboardingData: guestOnboarding,
          examDate: guestOnboarding.examDate || '2026-04-15'
        });
      }

      await batch.commit();
      
      // Clear guest data
      localStorage.removeItem('shiva_tasks');
      localStorage.removeItem('shiva_completions');
      localStorage.removeItem('guest_onboarding_data');
      localStorage.removeItem('shiva_guest_mode');
      localStorage.removeItem('onboarding_complete');
      
      toast.success('Guest data merged successfully!', { id: 'merge' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch-merge');
    }
  };

  const updateRoutine = async (type: 'weekday' | 'weekend', items: ScheduleItem[]) => {
    const newRoutine = { ...routine, [type]: items };
    setRoutine(newRoutine);
    if (user) {
      try {
        await setDoc(doc(db, 'userRoutines', user.uid), newRoutine);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'userRoutines');
      }
    } else {
      localStorage.setItem('shiva_routine', JSON.stringify(newRoutine));
    }
  };

  const updatePlanner = async (newPlanner: PlannerDay[]) => {
    setPlanner(newPlanner);
    if (user) {
      try {
        await setDoc(doc(db, 'userPlanners', user.uid), { planner: newPlanner, startDate: plannerStartDate }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'userPlanners');
      }
    } else {
      localStorage.setItem('shiva_planner', JSON.stringify(newPlanner));
    }
  };

  const setPlannerStartDate = async (date: string) => {
    setPlannerStartDateState(date);
    if (user) {
      try {
        await setDoc(doc(db, 'userPlanners', user.uid), { startDate: date }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'userPlanners');
      }
    } else {
      localStorage.setItem('shiva_planner_start_date', date);
    }
  };

  const resetProgress = () => {
    setCompletions({});
    setTasks([]);
    setRoutine({ weekday: DEFAULT_WEEKDAY_SCHEDULE, weekend: DEFAULT_WEEKEND_SCHEDULE });
    setPlanner(SCHEDULE_DATA);
    setPlannerStartDateState('2026-03-23');
    localStorage.removeItem('shiva_completions');
    localStorage.removeItem('shiva_tasks');
    localStorage.removeItem('shiva_routine');
    localStorage.removeItem('shiva_planner');
    localStorage.removeItem('shiva_planner_start_date');
    localStorage.removeItem('guest_onboarding_data');
  };

  return (
    <AppContext.Provider value={{
      completions,
      tasks,
      customSubjects,
      subjectNotes,
      routine,
      planner,
      plannerStartDate,
      dailyProgress,
      userSettings,
      toggleCompletion,
      updateNotes,
      updateSubjectNote,
      updateConfidence,
      fetchSubjectNotes,
      addTask,
      toggleTask,
      deleteTask,
      addSubject,
      updateSettings,
      uploadProfilePicture,
      updateRoutine,
      updatePlanner,
      setPlannerStartDate,
      resetProgress,
      mergeGuestData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
