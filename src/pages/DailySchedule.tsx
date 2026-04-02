import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isWeekend } from 'date-fns';
import { Clock, CheckCircle2, XCircle, MinusCircle, MessageSquare, MoreVertical, Edit2, Trash2, Plus, Save, X, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/subjects';
import { REWARD_QUOTES } from '../data/quotes';

export default function DailySchedule() {
  const { completions, toggleCompletion, updateNotes, routine, updateRoutine } = useApp();
  const isWeekendDay = isWeekend(new Date());
  
  const [activeTab, setActiveTab] = useState<'weekday' | 'weekend'>(isWeekendDay ? 'weekend' : 'weekday');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ time: '', activity: '', type: 'study' as any });

  const currentSchedule = routine[activeTab];

  // Calculate completion percentage
  const dayCompletions = currentSchedule.filter((_, index) => {
    const id = `daily_${activeTab}_${index}`;
    return completions[id]?.status === 'Done';
  }).length;
  const totalItems = currentSchedule.length;
  const completionPercentage = totalItems > 0 ? (dayCompletions / totalItems) * 100 : 0;

  const handleSaveNote = (id: string) => {
    updateNotes(id, noteValue, format(new Date(), 'yyyy-MM-dd'));
    setEditingNoteId(null);
  };

  const handleStartEditItem = (item: any, index: number) => {
    setEditingItemId(`daily_${activeTab}_${index}`);
    setEditForm({ time: item.time, activity: item.activity, type: item.type });
  };

  const handleSaveItem = (index: number) => {
    const newItems = [...currentSchedule];
    newItems[index] = { ...newItems[index], ...editForm };
    updateRoutine(activeTab, newItems);
    setEditingItemId(null);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = currentSchedule.filter((_, i) => i !== index);
    updateRoutine(activeTab, newItems);
  };

  const handleAddItem = () => {
    const newItem = {
      id: `custom_${Date.now()}`,
      time: '00:00 AM',
      activity: 'New Task',
      type: 'study' as const
    };
    updateRoutine(activeTab, [...currentSchedule, newItem]);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">DAILY BATTLE RHYTHM</h2>
          <p className="text-gray-500 mt-1">Stick to the routine. Consistency is the only way.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isEditMode ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
          >
            {isEditMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditMode ? 'EXIT EDIT' : 'EDIT SCHEDULE'}
          </button>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('weekday')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'weekday' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              WEEKDAY
            </button>
            <button 
              onClick={() => setActiveTab('weekend')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'weekend' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              WEEKEND
            </button>
          </div>
        </div>
      </div>

      {completionPercentage >= 90 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-3xl p-6 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bebas tracking-widest text-yellow-500">ELITE PERFORMANCE UNLOCKED</h3>
            <p className="text-gray-300 italic">"{REWARD_QUOTES[Math.floor(Math.random() * REWARD_QUOTES.length)]}"</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {currentSchedule.map((item, index) => {
          const id = `daily_${activeTab}_${index}`;
          const completion = completions[id];
          const status = completion?.status || 'Pending';
          const isEditingNote = editingNoteId === id;
          const isEditingItem = editingItemId === id;
          
          return (
            <motion.div 
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                group p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4
                ${status === 'Done' ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10 hover:border-white/20'}
              `}
            >
              {isEditingItem ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    placeholder="Time (e.g., 06:00 AM)"
                  />
                  <input 
                    type="text"
                    value={editForm.activity}
                    onChange={(e) => setEditForm({ ...editForm, activity: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    placeholder="Activity"
                  />
                  <div className="flex gap-2">
                    <select 
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="study">Study</option>
                      <option value="routine">Routine</option>
                      <option value="college">College</option>
                      <option value="gym">Gym</option>
                      <option value="family">Family</option>
                    </select>
                    <button 
                      onClick={() => handleSaveItem(index)}
                      className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setEditingItemId(null)}
                      className="p-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 md:w-48 shrink-0">
                    <Clock className={`w-4 h-4 ${status === 'Done' ? 'text-green-500' : 'text-gray-500'}`} />
                    <span className={`text-sm font-bold ${status === 'Done' ? 'text-green-500' : 'text-gray-400'}`}>
                      {item.time}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-medium ${status === 'Done' ? 'text-white/90' : 'text-white'}`}>
                        {item.activity}
                      </span>
                      {item.type === 'gym' && <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded uppercase tracking-widest">GYM</span>}
                      {item.type === 'family' && <span className="px-2 py-0.5 bg-pink-500/10 text-pink-500 text-[10px] font-bold rounded uppercase tracking-widest">FAMILY</span>}
                      {item.type === 'study' && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded uppercase tracking-widest">STUDY</span>}
                    </div>
                    
                    {isEditingNote ? (
                      <div className="mt-3 flex gap-2">
                        <input 
                          autoFocus
                          type="text"
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(id)}
                          placeholder="Add a note about this block..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500/50"
                        />
                        <button 
                          onClick={() => handleSaveNote(id)}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          SAVE
                        </button>
                        <button 
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1.5 bg-white/5 text-gray-400 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      completion?.notes && (
                        <div className="mt-2 text-xs text-gray-500 flex items-start gap-1.5 italic">
                          <MessageSquare className="w-3 h-3 mt-0.5" />
                          {completion.notes}
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2 relative">
                    {isEditMode ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStartEditItem(item, index)}
                          className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(index)}
                          className="p-2 text-gray-400 hover:text-red-500 bg-white/5 rounded-xl border border-white/5"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => toggleCompletion(id, 'Done', format(new Date(), 'yyyy-MM-dd'))}
                            className={`p-2 rounded-xl transition-all ${status === 'Done' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-500 hover:text-green-500'}`}
                            title="Mark Done"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => toggleCompletion(id, 'Partial', format(new Date(), 'yyyy-MM-dd'))}
                            className={`p-2 rounded-xl transition-all ${status === 'Partial' ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-500 hover:text-amber-500'}`}
                            title="Mark Partial"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => toggleCompletion(id, 'Skipped', format(new Date(), 'yyyy-MM-dd'))}
                            className={`p-2 rounded-xl transition-all ${status === 'Skipped' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500 hover:text-red-500'}`}
                            title="Mark Skipped"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingNoteId(id);
                              setNoteValue(completion?.notes || '');
                            }}
                            className={`p-2 rounded-xl transition-all ${isEditingNote ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                            title="Add Note"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Mobile Actions (Three Dot Menu) */}
                        <div className="md:hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === id ? null : id);
                            }}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-xl border border-white/5"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          <AnimatePresence>
                            {openMenuId === id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 bottom-full mb-2 w-48 bg-[#1a1a1f] border border-white/10 rounded-2xl p-2 shadow-2xl z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  onClick={() => {
                                    toggleCompletion(id, 'Done', format(new Date(), 'yyyy-MM-dd'));
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-green-500 hover:bg-green-500/5 rounded-xl transition-all"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark Done
                                </button>
                                <button 
                                  onClick={() => {
                                    toggleCompletion(id, 'Partial', format(new Date(), 'yyyy-MM-dd'));
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-amber-500 hover:bg-amber-500/5 rounded-xl transition-all"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                  Mark Partial
                                </button>
                                <button 
                                  onClick={() => {
                                    toggleCompletion(id, 'Skipped', format(new Date(), 'yyyy-MM-dd'));
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Mark Skipped
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingNoteId(id);
                                    setNoteValue(completion?.notes || '');
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Add Note
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}

        {isEditMode && (
          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleAddItem}
            className="w-full p-4 rounded-2xl border border-dashed border-white/20 text-gray-500 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ADD NEW BLOCK
          </motion.button>
        )}
      </div>
    </div>
  );
}
