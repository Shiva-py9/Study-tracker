import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Target, 
  GraduationCap, 
  BookOpen, 
  Dumbbell, 
  Zap, 
  Bell, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  User,
  Mail
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, addDays, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Subject {
  id: string;
  name: string;
  credits: number;
  goal: string;
  examDate?: string;
}

interface OnboardingData {
  name: string;
  examType: string;
  customExamType?: string;
  subjects: Subject[];
  examDate: string;
  perSubjectDates: boolean;
  schedule: {
    wakeUp: string;
    hasCollege: boolean;
    collegeHours?: { from: string; to: string; days: string[] };
    hasGym: boolean;
    gymHours?: { from: string; to: string };
    focusTime: string;
    studyHours: number;
  };
  studyStyle: string[];
  notifications: {
    morningEmail: boolean;
    eveningEmail: boolean;
    weeklySummary: boolean;
    streakWarning: boolean;
    examReminders: boolean;
    pushNotifications: boolean;
    email: string;
  };
}

// --- Constants ---
const EXAM_TYPES = [
  { id: 'btech', label: 'B.Tech / B.E. (Engineering)', icon: '🎓' },
  { id: 'bca', label: 'BCA / MCA', icon: '📚' },
  { id: 'mbbs', icon: '🏥', label: 'MBBS / Medical' },
  { id: 'law', icon: '⚖️', label: 'Law (LLB)' },
  { id: 'mba', icon: '📊', label: 'MBA / Management' },
  { id: 'upsc', icon: '🏛️', label: 'UPSC / Government Exam' },
  { id: 'boards', icon: '📝', label: 'Class 10 / 12 Board Exams' },
  { id: 'other', icon: '✏️', label: 'Other' },
];

const BTECH_SUBJECTS = [
  'Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 
  'Mathematics', 'Algorithms', 'Software Engineering', 'Digital Electronics',
  'Theory of Automata', 'Java Programming', 'Python', 'Web Development'
];

const STUDY_STYLES = [
  { id: 'reading', label: 'Reading notes/textbooks', icon: '📖' },
  { id: 'videos', label: 'Watching YouTube videos', icon: '🎥' },
  { id: 'writing', label: 'Writing & making my own notes', icon: '✍️' },
  { id: 'pyqs', label: 'Solving PYQs & past papers', icon: '📝' },
  { id: 'teaching', label: 'Teaching / explaining out loud', icon: '🗣️' },
  { id: 'flashcards', label: 'Flashcards & spaced repetition', icon: '🃏' },
  { id: 'groups', label: 'Study groups', icon: '👥' },
];

const SHIVA_SUBJECTS: Subject[] = [
  { id: 'de', name: 'Digital Electronics', credits: 4, goal: 'TOP / DISTINCTION' },
  { id: 'os', name: 'Operating Systems', credits: 4, goal: 'TOP / DISTINCTION' },
  { id: 'tafl', name: 'TAFL', credits: 4, goal: 'TOP / DISTINCTION' },
  { id: 'java', name: 'JAVA', credits: 3, goal: 'TOP / DISTINCTION' },
  { id: 'uhv', name: 'UHV', credits: 3, goal: 'TOP / DISTINCTION' },
  { id: 'cyber', name: 'Cyber Security', credits: 2, goal: 'TOP / DISTINCTION' },
];

const DEFAULT_DATA: OnboardingData = {
  name: '',
  examType: 'btech',
  subjects: [],
  examDate: format(addDays(new Date(), 21), 'yyyy-MM-dd'),
  perSubjectDates: false,
  schedule: {
    wakeUp: '06:00',
    hasCollege: true,
    collegeHours: { from: '09:00', to: '17:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    hasGym: true,
    gymHours: { from: '19:30', to: '20:50' },
    focusTime: 'Early Morning (5–8 AM)',
    studyHours: 4,
  },
  studyStyle: [],
  notifications: {
    morningEmail: false,
    eveningEmail: false,
    weeklySummary: false,
    streakWarning: false,
    examReminders: false,
    pushNotifications: false,
    email: '',
  },
};

// --- Components ---

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for back
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = 8;

  useEffect(() => {
    if (user?.email === 'srivastavshivang484@gmail.com') {
      setData(prev => ({ 
        ...prev, 
        name: user.name || 'Shiva',
        subjects: SHIVA_SUBJECTS,
        notifications: { ...prev.notifications, email: user.email }
      }));
    } else if (user?.email) {
      setData(prev => ({ 
        ...prev, 
        name: user.name || '',
        notifications: { ...prev.notifications, email: user.email }
      }));
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isCompleting) {
        // Prevent enter if we are in Step1 and name is too short
        if (step === 1 && data.name.length < 2) return;
        nextStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, data, isCompleting]);

  const nextStep = () => {
    if (step === 1 && data.name.length < 2) {
      toast.error('Please enter your name (min 2 characters)');
      return;
    }
    if (step < totalSteps) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    const loadingToast = toast.loading('Saving your battle plan...');
    
    // Safety timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      if (isCompleting) {
        setIsCompleting(false);
        toast.error('Request timed out. Please try again.', { id: loadingToast });
      }
    }, 15000); // 15 seconds timeout

    try {
      console.log('Starting onboarding completion...');
      await completeOnboarding(data);
      console.log('Onboarding completion successful!');
      toast.success('Battle plan saved!', { id: loadingToast });
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error('Handle complete error:', err);
      
      let errorMsg = 'Failed to save onboarding data';
      
      try {
        // Try to parse if it's a JSON error from handleFirestoreError
        const errInfo = JSON.parse(err.message);
        if (errInfo.error) {
          if (errInfo.error.includes('insufficient permissions')) {
            errorMsg = 'Permission denied: Please check security rules.';
          } else {
            errorMsg = errInfo.error;
          }
        }
      } catch (e) {
        // Not a JSON error, use the message directly if it's simple
        errorMsg = err.message || errorMsg;
      }

      toast.error(errorMsg, { id: loadingToast });
      clearTimeout(timeoutId);
    } finally {
      setIsCompleting(false);
    }
  };

  const skipStep = () => {
    if (step === 1) return; // Name is essential
    nextStep();
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[#1a1a24] relative overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
        />
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8">
        {/* Back Button */}
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-widest uppercase">Back</span>
          </button>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full max-w-2xl"
          >
            <div className="bg-[#111118] border border-[#2a2a3a] rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                {renderStep(step, data, setData, nextStep)}
              </div>

              {/* Footer Actions */}
              <div className="mt-12 flex items-center justify-between relative z-10">
                <div className="text-xs font-bold text-gray-600 tracking-widest uppercase">
                  Step {step} of {totalSteps}
                </div>
                
                <div className="flex items-center gap-6">
                  {step > 1 && (
                    <button 
                      onClick={prevStep}
                      className="text-gray-500 hover:text-gray-300 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  {step > 1 && step < totalSteps && (
                    <button 
                      onClick={skipStep}
                      className="text-gray-500 hover:text-gray-300 text-xs font-bold tracking-widest uppercase transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button 
                    onClick={nextStep}
                    disabled={isCompleting}
                    className="h-14 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCompleting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {step === totalSteps ? 'Enter Dashboard' : 'Next'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function renderStep(step: number, data: OnboardingData, setData: React.Dispatch<React.SetStateAction<OnboardingData>>, next: () => void) {
  switch (step) {
    case 1: return <Step1 data={data} setData={setData} next={next} />;
    case 2: return <Step2 data={data} setData={setData} />;
    case 3: return <Step3 data={data} setData={setData} />;
    case 4: return <Step4 data={data} setData={setData} />;
    case 5: return <Step5 data={data} setData={setData} />;
    case 6: return <Step6 data={data} setData={setData} />;
    case 7: return <Step7 data={data} setData={setData} />;
    case 8: return <Step8 data={data} />;
    default: return null;
  }
}

// --- Step Components ---

function Step1({ data, setData, next }: { data: OnboardingData, setData: any, next: any }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">Hey! What should we call you? 👋</h2>
        <p className="text-gray-400">Your name helps us personalize your battle plan.</p>
      </div>
      <div className="relative">
        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
        <input 
          autoFocus
          type="text"
          placeholder="Enter your first name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && next()}
          className="w-full h-20 bg-[#0a0a0f] border-2 border-[#2a2a3a] rounded-3xl pl-16 pr-8 text-2xl font-medium focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-700"
        />
      </div>
    </div>
  );
}

function Step2({ data, setData }: { data: OnboardingData, setData: any }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">What exam are you preparing for? 🎯</h2>
        <p className="text-gray-400">This helps us structure your schedule and suggest subjects.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {EXAM_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setData({ ...data, examType: type.id })}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left group",
              data.examType === type.id 
                ? "bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                : "bg-[#0a0a0f] border-[#2a2a3a] hover:border-gray-600"
            )}
          >
            <span className="text-3xl">{type.icon}</span>
            <span className={cn(
              "font-bold tracking-tight",
              data.examType === type.id ? "text-white" : "text-gray-400 group-hover:text-gray-200"
            )}>{type.label}</span>
          </button>
        ))}
      </div>
      {data.examType === 'other' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <input 
            type="text"
            placeholder="Type your exam name..."
            value={data.customExamType || ''}
            onChange={(e) => setData({ ...data, customExamType: e.target.value })}
            className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl px-6 text-white focus:outline-none focus:border-orange-500 transition-all"
          />
        </motion.div>
      )}
    </div>
  );
}

function Step3({ data, setData }: { data: OnboardingData, setData: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const addSubject = (name: string) => {
    if (data.subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Subject already added');
      return;
    }
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      credits: 3,
      goal: 'SCORE WELL'
    };
    setData({ ...data, subjects: [...data.subjects, newSubject] });
    setSearchTerm('');
  };

  const removeSubject = (id: string) => {
    setData({ ...data, subjects: data.subjects.filter(s => s.id !== id) });
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData({
      ...data,
      subjects: data.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const suggestions = BTECH_SUBJECTS.filter(s => 
    !data.subjects.some(sub => sub.name === s) &&
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">Which subjects are you studying? 📚</h2>
        <p className="text-gray-400">Select from the list or type your own.</p>
      </div>

      <div className="space-y-6">
        {/* Search & Add */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text"
            placeholder="Type a subject name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchTerm && addSubject(searchTerm)}
            className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => addSubject(searchTerm)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>

        {/* Suggestions */}
        {searchTerm && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 5).map(s => (
              <button 
                key={s}
                onClick={() => addSubject(s)}
                className="px-4 py-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-full text-xs font-medium text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        )}

        {/* Selected Subjects */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {data.subjects.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{s.name}</div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-md font-bold uppercase tracking-wider">
                        {s.credits} Credits
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-md font-bold uppercase tracking-wider">
                        {s.goal}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select 
                    value={s.credits}
                    onChange={(e) => updateSubject(s.id, { credits: Number(e.target.value) })}
                    className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-2 py-1 text-[10px] font-bold text-gray-400 focus:outline-none focus:border-orange-500"
                  >
                    {[1,2,3,4].map(c => <option key={c} value={c}>{c} Cr</option>)}
                  </select>
                  <select 
                    value={s.goal}
                    onChange={(e) => updateSubject(s.id, { goal: e.target.value })}
                    className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-2 py-1 text-[10px] font-bold text-gray-400 focus:outline-none focus:border-orange-500"
                  >
                    {['TOP / DISTINCTION', 'SCORE WELL', 'PASS ONLY'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button 
                    onClick={() => removeSubject(s.id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {data.subjects.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-[#2a2a3a] rounded-[32px] text-gray-600">
              No subjects added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step4({ data, setData }: { data: OnboardingData, setData: any }) {
  const daysLeft = differenceInDays(new Date(data.examDate), new Date());

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">When is your exam? ⏰</h2>
        <p className="text-gray-400">We'll count down every second for you.</p>
      </div>

      <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-[32px] p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Main Exam Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
              <input 
                type="date"
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 365), 'yyyy-MM-dd')}
                value={data.examDate}
                onChange={(e) => setData({ ...data, examDate: e.target.value })}
                className="w-full h-16 bg-[#111118] border border-[#2a2a3a] rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>
          <div className="w-full sm:w-48 h-32 bg-orange-500/10 border border-orange-500/20 rounded-[32px] flex flex-col items-center justify-center">
            <div className="text-4xl font-bebas text-orange-500">{daysLeft > 0 ? daysLeft : 0}</div>
            <div className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">Days to go</div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#2a2a3a]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">Per-subject dates?</div>
              <div className="text-xs text-gray-500">Are all subjects on the same date?</div>
            </div>
            <button 
              onClick={() => setData({ ...data, perSubjectDates: !data.perSubjectDates })}
              className={cn(
                "w-14 h-8 rounded-full p-1 transition-all",
                data.perSubjectDates ? "bg-orange-500" : "bg-gray-800"
              )}
            >
              <div className={cn(
                "w-6 h-6 bg-white rounded-full transition-all",
                data.perSubjectDates ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          {data.perSubjectDates && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-3"
            >
              {data.subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-2xl">
                  <span className="text-xs font-bold">{s.name}</span>
                  <input 
                    type="date"
                    value={s.examDate || data.examDate}
                    onChange={(e) => setData({
                      ...data,
                      subjects: data.subjects.map(sub => sub.id === s.id ? { ...sub, examDate: e.target.value } : sub)
                    })}
                    className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg px-3 py-1 text-xs text-gray-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step5({ data, setData }: { data: OnboardingData, setData: any }) {
  const [subStep, setSubStep] = useState(1);

  const updateSchedule = (updates: any) => {
    setData({ ...data, schedule: { ...data.schedule, ...updates } });
  };

  const renderSubStep = () => {
    switch (subStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">What time do you wake up?</h3>
            </div>
            <input 
              type="time"
              value={data.schedule.wakeUp}
              onChange={(e) => updateSchedule({ wakeUp: e.target.value })}
              className="w-full h-20 bg-[#0a0a0f] border-2 border-[#2a2a3a] rounded-3xl px-8 text-4xl font-bebas tracking-widest text-orange-500 focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Do you go to college?</h3>
              </div>
              <button 
                onClick={() => updateSchedule({ hasCollege: !data.schedule.hasCollege })}
                className={cn(
                  "w-14 h-8 rounded-full p-1 transition-all",
                  data.schedule.hasCollege ? "bg-orange-500" : "bg-gray-800"
                )}
              >
                <div className={cn(
                  "w-6 h-6 bg-white rounded-full transition-all",
                  data.schedule.hasCollege ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
            {data.schedule.hasCollege && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">From</label>
                    <input 
                      type="time"
                      value={data.schedule.collegeHours?.from}
                      onChange={(e) => updateSchedule({ collegeHours: { ...data.schedule.collegeHours, from: e.target.value } })}
                      className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl px-4 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">To</label>
                    <input 
                      type="time"
                      value={data.schedule.collegeHours?.to}
                      onChange={(e) => updateSchedule({ collegeHours: { ...data.schedule.collegeHours, to: e.target.value } })}
                      className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl px-4 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        const days = data.schedule.collegeHours?.days || [];
                        const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
                        updateSchedule({ collegeHours: { ...data.schedule.collegeHours, days: newDays } });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        data.schedule.collegeHours?.days.includes(day)
                          ? "bg-orange-500 text-white"
                          : "bg-[#0a0a0f] border border-[#2a2a3a] text-gray-500"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Do you go to the gym?</h3>
              </div>
              <button 
                onClick={() => updateSchedule({ hasGym: !data.schedule.hasGym })}
                className={cn(
                  "w-14 h-8 rounded-full p-1 transition-all",
                  data.schedule.hasGym ? "bg-orange-500" : "bg-gray-800"
                )}
              >
                <div className={cn(
                  "w-6 h-6 bg-white rounded-full transition-all",
                  data.schedule.hasGym ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>
            {data.schedule.hasGym && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">From</label>
                  <input 
                    type="time"
                    value={data.schedule.gymHours?.from}
                    onChange={(e) => updateSchedule({ gymHours: { ...data.schedule.gymHours, from: e.target.value } })}
                    className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl px-4 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">To</label>
                  <input 
                    type="time"
                    value={data.schedule.gymHours?.to}
                    onChange={(e) => updateSchedule({ gymHours: { ...data.schedule.gymHours, to: e.target.value } })}
                    className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl px-4 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </motion.div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">When do you feel most focused?</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['Early Morning (5–8 AM)', 'Late Morning (8–11 AM)', 'Afternoon (12–3 PM)', 'Evening (5–8 PM)', 'Night (9 PM–12 AM)'].map(time => (
                <button
                  key={time}
                  onClick={() => updateSchedule({ focusTime: time })}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left font-bold transition-all",
                    data.schedule.focusTime === time 
                      ? "bg-orange-500/10 border-orange-500 text-white" 
                      : "bg-[#0a0a0f] border-[#2a2a3a] text-gray-500 hover:border-gray-600"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Daily study goal?</h3>
            </div>
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div className="text-6xl font-bebas text-orange-500">{data.schedule.studyHours}</div>
                <div className="text-xl font-bebas text-gray-600 mb-2">HOURS / DAY</div>
              </div>
              <input 
                type="range"
                min="1"
                max="12"
                value={data.schedule.studyHours}
                onChange={(e) => updateSchedule({ studyHours: Number(e.target.value) })}
                className="w-full h-2 bg-[#1a1a24] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <span>1 Hour</span>
                <span>6 Hours</span>
                <span>12 Hours</span>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">Let's build your daily routine 🕐</h2>
        <p className="text-gray-400">Answer a few quick questions to personalize your schedule.</p>
      </div>

      <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-[32px] p-8 min-h-[400px] flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={subStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderSubStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#2a2a3a]">
          <div className="flex gap-2">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={cn(
                "w-2 h-2 rounded-full transition-all",
                subStep === s ? "bg-orange-500 w-6" : "bg-gray-800"
              )} />
            ))}
          </div>
          <div className="flex gap-4">
            {subStep > 1 && (
              <button 
                onClick={() => setSubStep(subStep - 1)}
                className="p-3 bg-[#1a1a24] text-gray-400 rounded-xl hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {subStep < 5 ? (
              <button 
                onClick={() => setSubStep(subStep + 1)}
                className="h-12 px-6 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                <Check className="w-4 h-4" /> Schedule Ready
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step6({ data, setData }: { data: OnboardingData, setData: any }) {
  const toggleStyle = (id: string) => {
    const styles = data.studyStyle;
    const newStyles = styles.includes(id) ? styles.filter(s => s !== id) : [...styles, id];
    setData({ ...data, studyStyle: newStyles });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">How do you study best? 🧠</h2>
        <p className="text-gray-400">Select all that apply to customize your study blocks.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STUDY_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => toggleStyle(style.id)}
            className={cn(
              "p-6 rounded-3xl border-2 transition-all flex items-center gap-4 text-left group",
              data.studyStyle.includes(style.id) 
                ? "bg-orange-500/10 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                : "bg-[#0a0a0f] border-[#2a2a3a] hover:border-gray-600"
            )}
          >
            <span className="text-3xl">{style.icon}</span>
            <span className={cn(
              "font-bold tracking-tight",
              data.studyStyle.includes(style.id) ? "text-white" : "text-gray-400 group-hover:text-gray-200"
            )}>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step7({ data, setData }: { data: OnboardingData, setData: any }) {
  const toggleNotif = (key: keyof OnboardingData['notifications']) => {
    setData({
      ...data,
      notifications: { ...data.notifications, [key]: !data.notifications[key] }
    });
  };

  const NOTIFS = [
    { id: 'morningEmail', label: 'Morning schedule email', sub: '6:00 AM daily', icon: '🌅' },
    { id: 'eveningEmail', label: 'Evening recap email', sub: '11:00 PM daily', icon: '🌙' },
    { id: 'weeklySummary', label: 'Weekly performance summary', sub: 'Every Sunday', icon: '📊' },
    { id: 'streakWarning', label: 'Streak warning', sub: "If you haven't studied today", icon: '🔥' },
    { id: 'examReminders', label: 'Exam countdown reminders', sub: '7, 3, 1 day before', icon: '🚨' },
    { id: 'pushNotifications', label: 'Browser push notifications', sub: 'Real-time alerts', icon: '💻' },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bebas tracking-wider">How should we keep you on track? 🔔</h2>
        <p className="text-gray-400">All can be changed later in settings.</p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {NOTIFS.map((n) => (
          <div key={n.id} className="p-4 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{n.icon}</span>
              <div>
                <div className="text-sm font-bold">{n.label}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{n.sub}</div>
              </div>
            </div>
            <button 
              onClick={() => toggleNotif(n.id as any)}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-all",
                data.notifications[n.id as keyof OnboardingData['notifications']] ? "bg-orange-500" : "bg-gray-800"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-all",
                data.notifications[n.id as keyof OnboardingData['notifications']] ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-[#2a2a3a]">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Send emails to</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="email"
            value={data.notifications.email}
            onChange={(e) => setData({ ...data, notifications: { ...data.notifications, email: e.target.value } })}
            className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

function Step8({ data }: { data: OnboardingData }) {
  return (
    <div className="space-y-8 text-center">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <Sparkles className="w-12 h-12 text-green-500" />
      </motion.div>
      
      <div className="space-y-2">
        <h2 className="text-5xl font-bebas tracking-wider">You're all set, {data.name}! 🔥</h2>
        <p className="text-gray-400">Your personalized battle plan is ready.</p>
      </div>

      <div className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-[32px] p-8 grid grid-cols-2 gap-6 text-left">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Exam Type</div>
          <div className="font-bold text-orange-500">{data.examType === 'other' ? data.customExamType : EXAM_TYPES.find(t => t.id === data.examType)?.label}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Subjects</div>
          <div className="font-bold text-orange-500">{data.subjects.length} Added</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Exam In</div>
          <div className="font-bold text-orange-500">{differenceInDays(new Date(data.examDate), new Date())} Days</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Daily Goal</div>
          <div className="font-bold text-orange-500">{data.schedule.studyHours} Hours</div>
        </div>
        <div className="col-span-2 space-y-1 pt-4 border-t border-[#2a2a3a]">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Peak Focus Time</div>
          <div className="font-bold text-orange-500">{data.schedule.focusTime}</div>
        </div>
      </div>
    </div>
  );
}
