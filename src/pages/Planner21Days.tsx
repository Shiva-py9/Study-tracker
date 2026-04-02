import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isToday, addDays, isBefore, startOfDay } from 'date-fns';
import { ChevronRight, CheckCircle2, Circle, Calendar, MessageSquare, Edit2, Save, X, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/subjects';

export default function Planner21Days() {
  const { completions, toggleCompletion, updateNotes, planner, updatePlanner, plannerStartDate, setPlannerStartDate } = useApp();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ subject: '', topic: '', time: '' });

  const handleSaveNote = (id: string, date: string) => {
    updateNotes(id, noteValue, date);
    setEditingNoteId(null);
  };

  const handleStartEditBlock = (block: any) => {
    setEditingBlockId(block.id);
    setBlockForm({ subject: block.subject, topic: block.topic, time: block.time });
  };

  const handleSaveBlock = (dayIndex: number, blockIndex: number) => {
    const newPlanner = [...planner];
    newPlanner[dayIndex].blocks[blockIndex] = { ...newPlanner[dayIndex].blocks[blockIndex], ...blockForm };
    updatePlanner(newPlanner);
    setEditingBlockId(null);
  };

  const handleSetFromNow = () => {
    setPlannerStartDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">21-DAY BATTLE PLANNER</h2>
          <p className="text-gray-500 mt-1">The entire roadmap to victory. One day at a time.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input 
              type="date"
              value={plannerStartDate}
              onChange={(e) => setPlannerStartDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            />
          </div>
          <button 
            onClick={handleSetFromNow}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <Play className="w-3 h-3" />
            SET FROM NOW
          </button>
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isEditMode ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'}`}
          >
            {isEditMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditMode ? 'EXIT EDIT' : 'EDIT PLAN'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {planner.map((dayData, dayIndex) => {
          // Calculate date based on start date
          const dayDate = addDays(parseISO(plannerStartDate), dayData.day - 1);
          const dateStr = format(dayDate, 'yyyy-MM-dd');
          const isDayToday = isToday(dayDate);
          const isPast = isBefore(dayDate, startOfDay(new Date())) && !isDayToday;
          
          const dayCompletions = dayData.blocks.filter(b => completions[b.id]?.status === 'Done').length;
          const totalDayBlocks = dayData.blocks.length;
          const score = totalDayBlocks > 0 ? (dayCompletions / totalDayBlocks) * 100 : 0;
          const isExpanded = expandedDay === dayData.day;

          return (
            <motion.div 
              key={dayData.day}
              layout
              className={`
                relative rounded-3xl border transition-all duration-300 overflow-hidden
                ${isDayToday ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'}
                ${isPast ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
                ${isExpanded ? 'lg:col-span-2 row-span-2' : ''}
              `}
            >
              <div 
                onClick={() => setExpandedDay(isExpanded ? null : dayData.day)}
                className="p-6 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center font-bebas text-2xl
                    ${isDayToday ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'}
                  `}>
                    {dayData.day}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      {format(dayDate, 'EEE, MMM do')}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${score === 100 ? 'bg-green-500' : score > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{Math.round(score)}%</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 border-t border-white/5 pt-6"
                  >
                    <div className="space-y-4">
                      {dayData.blocks.map((block, blockIndex) => {
                        const subject = SUBJECTS.find(s => s.id === block.subject);
                        const completion = completions[block.id];
                        const isDone = completion?.status === 'Done';
                        const isEditingNote = editingNoteId === block.id;
                        const isEditingBlock = editingBlockId === block.id;
                        
                        return (
                          <div key={block.id} className="flex flex-col p-3 rounded-2xl bg-white/5 border border-white/5">
                            {isEditingBlock ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <input 
                                    type="text"
                                    value={blockForm.subject}
                                    onChange={(e) => setBlockForm({ ...blockForm, subject: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                                    placeholder="Subject"
                                  />
                                  <input 
                                    type="text"
                                    value={blockForm.time}
                                    onChange={(e) => setBlockForm({ ...blockForm, time: e.target.value })}
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                                    placeholder="Time"
                                  />
                                </div>
                                <input 
                                  type="text"
                                  value={blockForm.topic}
                                  onChange={(e) => setBlockForm({ ...blockForm, topic: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                                  placeholder="Topic"
                                />
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleSaveBlock(dayIndex, blockIndex)}
                                    className="flex-1 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors"
                                  >
                                    SAVE
                                  </button>
                                  <button 
                                    onClick={() => setEditingBlockId(null)}
                                    className="flex-1 py-1.5 bg-white/5 text-gray-400 text-[10px] font-bold rounded-lg hover:bg-white/10 transition-colors"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: subject?.color || '#555' }} />
                                    <div>
                                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{block.subject} • {block.time}</div>
                                      <div className="text-sm font-medium text-white">{block.topic}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {isEditMode ? (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStartEditBlock(block);
                                        }}
                                        className="p-2 rounded-xl text-gray-600 hover:text-white transition-all"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingNoteId(isEditingNote ? null : block.id);
                                            setNoteValue(completion?.notes || '');
                                          }}
                                          className={`p-2 rounded-xl transition-all ${isEditingNote ? 'text-white bg-white/10' : 'text-gray-600 hover:text-white'}`}
                                        >
                                          <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCompletion(block.id, isDone ? 'Pending' : 'Done', dateStr);
                                          }}
                                          className={`p-2 rounded-xl transition-all ${isDone ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}
                                        >
                                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {isEditingNote ? (
                                  <div className="mt-3 flex gap-2">
                                    <input 
                                      autoFocus
                                      type="text"
                                      value={noteValue}
                                      onChange={(e) => setNoteValue(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(block.id, dateStr)}
                                      placeholder="Add a note..."
                                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500/50"
                                    />
                                    <button 
                                      onClick={() => handleSaveNote(block.id, dateStr)}
                                      className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                      SAVE
                                    </button>
                                  </div>
                                ) : (
                                  completion?.notes && (
                                    <div className="mt-2 text-[10px] text-gray-500 flex items-start gap-1.5 italic px-1">
                                      <MessageSquare className="w-3 h-3 mt-0.5" />
                                      {completion.notes}
                                    </div>
                                  )
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
