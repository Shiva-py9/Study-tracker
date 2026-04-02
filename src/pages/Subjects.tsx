import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, ChevronRight, Award, Target, Layout, Plus, X } from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { TOPICS_DATA } from '../data/topics';
import { useProgress } from '../hooks/useProgress';
import { useApp } from '../context/AppContext';

export default function Subjects() {
  const navigate = useNavigate();
  const { subjectProgress } = useProgress();
  const { customSubjects, addSubject } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({
    id: '',
    name: '',
    credits: 4,
    goal: 'TOP / DISTINCTION',
    color: '#ff4757'
  });

  const allSubjects = [...SUBJECTS, ...customSubjects].filter(s => s.credits);

  const handleAddSubject = (e: any) => {
    e.preventDefault();
    if (!newSubject.id || !newSubject.name) return;
    addSubject(newSubject);
    setNewSubject({
      id: '',
      name: '',
      credits: 4,
      goal: 'TOP / DISTINCTION',
      color: '#ff4757'
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">SUBJECT ARSENAL</h2>
          <p className="text-gray-500 mt-1">Master each domain. Leave no topic behind.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          ADD SUBJECT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSubjects.map((subject, i) => {
          const progress = subjectProgress.find(p => p.id === subject.id)?.progress || 0;
          const topics = TOPICS_DATA[subject.id as keyof typeof TOPICS_DATA] || [];

          return (
            <motion.div 
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/subjects/${subject.id}`)}
              className="group relative bg-white/5 border border-white/10 rounded-[40px] p-8 hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: subject.color }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Credits</div>
                    <div className="text-xl font-bebas text-white tracking-wider">{subject.credits}</div>
                  </div>
                </div>

                <h3 className="text-2xl font-bebas tracking-widest text-white mb-1 group-hover:text-red-500 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                  Goal: {subject.goal}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mastery</span>
                    <span className="text-2xl font-bebas text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">
                    <span>{topics.length} Topics Total</span>
                    <div className="flex items-center gap-1 group-hover:text-white transition-colors">
                      VIEW DETAILS <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1f] border border-white/10 rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bebas tracking-widest text-white">ADD NEW SUBJECT</h3>
                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddSubject} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Subject Code (e.g. DE, OS)</label>
                  <input 
                    autoFocus
                    type="text"
                    required
                    value={newSubject.id}
                    onChange={e => setNewSubject({...newSubject, id: e.target.value.toUpperCase()})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Enter code..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Subject Name</label>
                  <input 
                    type="text"
                    required
                    value={newSubject.name}
                    onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="Enter name..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Credits</label>
                    <input 
                      type="number"
                      min="1"
                      max="10"
                      value={newSubject.credits}
                      onChange={e => setNewSubject({...newSubject, credits: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Theme Color</label>
                    <input 
                      type="color"
                      value={newSubject.color}
                      onChange={e => setNewSubject({...newSubject, color: e.target.value})}
                      className="w-full h-[50px] bg-white/5 border border-white/10 rounded-2xl px-2 py-1 cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Goal</label>
                  <div className="relative">
                    <select 
                      value={newSubject.goal}
                      onChange={e => setNewSubject({...newSubject, goal: e.target.value})}
                      className="w-full bg-[#2a2a2f] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer pr-10"
                    >
                      <option value="TOP / DISTINCTION" className="bg-[#1a1a1f] text-white">TOP / DISTINCTION</option>
                      <option value="SCORE WELL" className="bg-[#1a1a1f] text-white">SCORE WELL</option>
                      <option value="PASS ONLY" className="bg-[#1a1a1f] text-white">PASS ONLY</option>
                      <option value="MASTER DOMAIN" className="bg-[#1a1a1f] text-white">MASTER DOMAIN</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 mt-4"
                >
                  INITIALIZE SUBJECT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
