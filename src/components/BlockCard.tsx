import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, BookOpen, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUBJECTS } from '../data/subjects';
import confetti from 'canvas-confetti';

interface BlockCardProps {
  block: {
    id: string;
    subject: string;
    topic: string;
    time: string;
    type: string;
  };
  key?: string | number;
}

export default function BlockCard({ block }: BlockCardProps) {
  const { completions, toggleCompletion, updateNotes } = useApp();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  
  const subject = SUBJECTS.find(s => s.id === block.subject);
  const completion = completions[block.id];
  const isDone = completion?.status === 'Done';

  const handleToggle = () => {
    const newStatus = isDone ? 'Pending' : 'Done';
    const today = new Date().toISOString().split('T')[0];
    toggleCompletion(block.id, newStatus, today);
    
    if (newStatus === 'Done') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [subject?.color || '#ffffff', '#ffffff']
      });
    }
  };

  const handleSaveNote = () => {
    const today = new Date().toISOString().split('T')[0];
    updateNotes(block.id, noteValue, today);
    setIsEditingNote(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`
        relative p-5 rounded-3xl border transition-all duration-300
        ${isDone 
          ? 'bg-white/5 border-white/20 opacity-90' 
          : 'bg-white/5 border-white/10 hover:border-white/20'}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: subject?.color }}
            />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
              {subject?.name || block.subject}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-3">{block.topic}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {block.time}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <BookOpen className="w-3.5 h-3.5" />
              Study Block
            </div>
          </div>
          
          {isEditingNote ? (
            <div className="mt-4 flex gap-2">
              <input 
                autoFocus
                type="text"
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                placeholder="Add a note..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
              />
              <button 
                onClick={handleSaveNote}
                className="px-3 py-2 bg-red-500 text-white text-[10px] font-bold rounded-xl hover:bg-red-600 transition-colors"
              >
                SAVE
              </button>
            </div>
          ) : (
            completion?.notes && (
              <div className="mt-3 text-[11px] text-gray-500 flex items-start gap-1.5 italic bg-white/5 p-2 rounded-xl">
                <MessageSquare className="w-3 h-3 mt-0.5" />
                {completion.notes}
              </div>
            )
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleToggle}
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDone 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}
            `}
          >
            {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => {
              setIsEditingNote(!isEditingNote);
              setNoteValue(completion?.notes || '');
            }}
            className={`
              w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isEditingNote ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}
            `}
            title="Add Note"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
