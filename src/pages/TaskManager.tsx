import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle2, Circle, Filter, Tag, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/subjects';

export default function TaskManager() {
  const navigate = useNavigate();
  const { tasks, addTask, toggleTask, deleteTask, customSubjects } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('All');
  
  const allSubjects = [...SUBJECTS, ...customSubjects];
  const creditSubjects = allSubjects.filter(s => s.credits || customSubjects.some(cs => cs.id === s.id));

  const [newTask, setNewTask] = useState({
    text: '',
    subject: creditSubjects[0]?.id || 'DE',
    priority: 'Medium' as const,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const filteredTasks = tasks.filter(t => filter === 'All' || t.subject === filter);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!newTask.text.trim()) return;
    addTask(newTask);
    setNewTask({ ...newTask, text: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">TASK COMMAND CENTER</h2>
          <p className="text-gray-500 mt-1">Beyond the schedule. Manage your extra missions.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
        >
          <Plus className="w-5 h-5" />
          NEW TASK
        </button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === 'All' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          ALL TASKS
        </button>
        {creditSubjects.map(s => (
          <button 
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === s.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {s.id}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => {
            const subject = allSubjects.find(s => s.id === task.subject);
            return (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                  group p-5 rounded-3xl border transition-all duration-300 flex items-center justify-between gap-4
                  ${task.completed ? 'bg-white/5 border-white/10 opacity-60' : 'bg-white/5 border-white/10 hover:border-white/20'}
                `}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => toggleTask((task._id || task.id)!)}
                    className={`transition-colors ${task.completed ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}
                  >
                    {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div>
                    <h4 className={`text-lg font-medium transition-all ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {task.text}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Tag className="w-3 h-3" style={{ color: subject?.color }} />
                        {task.subject}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {task.dueDate}
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        task.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask((task._id || task.id)!)}
                  className="p-2 text-gray-600 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100 opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
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
              <h3 className="text-2xl font-bebas tracking-widest text-white mb-6">ADD NEW MISSION</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Task Description</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newTask.text}
                    onChange={e => setNewTask({...newTask, text: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="What needs to be done?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Subject</label>
                    <div className="relative">
                      <select 
                        value={newTask.subject}
                        onChange={e => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAdding(false);
                            navigate('/subjects');
                          } else {
                            setNewTask({...newTask, subject: e.target.value});
                          }
                        }}
                        className="w-full bg-[#2a2a2f] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer pr-10"
                      >
                        {creditSubjects.map(s => (
                          <option key={s.id} value={s.id} className="bg-[#1a1a1f] text-white">{s.id}</option>
                        ))}
                        <option value="ADD_NEW" className="bg-[#1a1a1f] text-red-500 font-bold">+ ADD NEW SUBJECT</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Priority</label>
                    <div className="relative">
                      <select 
                        value={newTask.priority}
                        onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                        className="w-full bg-[#2a2a2f] border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer pr-10"
                      >
                        <option value="High" className="bg-[#1a1a1f] text-white">High</option>
                        <option value="Medium" className="bg-[#1a1a1f] text-white">Medium</option>
                        <option value="Low" className="bg-[#1a1a1f] text-white">Low</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Due Date</label>
                  <input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
                  >
                    ADD TASK
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
