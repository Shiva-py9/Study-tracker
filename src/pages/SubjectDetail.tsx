import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Circle, Star, MessageSquare, Award, Target } from 'lucide-react';
import { SUBJECTS } from '../data/subjects';
import { TOPICS_DATA } from '../data/topics';
import { useApp } from '../context/AppContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completions, subjectNotes, updateSubjectNote, updateConfidence, fetchSubjectNotes } = useApp();

  useEffect(() => {
    if (id) fetchSubjectNotes(id);
  }, [id]);

  const subject = SUBJECTS.find(s => s.id === id);
  const topics = TOPICS_DATA[id as keyof typeof TOPICS_DATA] || [];

  if (!subject) return <div>Subject not found</div>;

  const completedCount = topics.filter(t => completions[`topic_${id}_${t}`]?.status === 'Done').length;
  const progress = (completedCount / topics.length) * 100;

  return (
    <div className="space-y-8 pb-12">
      <button 
        onClick={() => navigate('/subjects')}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO ARSENAL
      </button>

      <div className="relative bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20"
          style={{ backgroundColor: subject.color }}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                {subject.id} — {subject.credits} CREDITS
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bebas tracking-widest text-white mb-2">{subject.name}</h2>
            <p className="text-gray-500 font-medium uppercase tracking-widest text-sm">Target: {subject.goal}</p>
          </div>
          
          <div className="text-left md:text-right">
            <div className="text-4xl md:text-6xl font-bebas text-white mb-2">{Math.round(progress)}%</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Mastery</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bebas tracking-widest text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-red-500" />
            TOPIC CHECKLIST
          </h3>
          
          {topics.map((topic, i) => {
            const topicId = `topic_${id}_${topic}`;
            const isDone = completions[topicId]?.status === 'Done';
            const rating = subjectNotes[topic]?.confidence || 0;
            const note = subjectNotes[topic]?.note || '';

            return (
              <motion.div 
                key={topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`
                  p-6 rounded-3xl border transition-all duration-300
                  ${isDone ? 'bg-white/5 border-white/20' : 'bg-white/5 border-white/10'}
                `}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button className={`transition-colors ${isDone ? 'text-green-500' : 'text-gray-600'}`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <span className={`text-lg font-medium ${isDone ? 'text-white/70' : 'text-white'}`}>{topic}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => updateConfidence(id!, topic, star)}
                          className={`transition-colors ${star <= rating ? 'text-yellow-500' : 'text-gray-700'}`}
                        >
                          <Star className={`w-4 h-4 ${star <= rating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const newNote = prompt('Topic Notes:', note);
                        if (newNote !== null) updateSubjectNote(id!, topic, newNote);
                      }}
                      className={`p-2 rounded-xl transition-colors ${note ? 'text-blue-500' : 'text-gray-600'}`}
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {note && (
                  <div className="mt-4 p-4 bg-white/5 rounded-2xl text-xs text-gray-400 italic">
                    {note}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
            <h3 className="text-xl font-bebas tracking-widest text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              EXAM STRATEGY
            </h3>
            <ul className="space-y-4">
              {[
                'Focus on PYQs from last 5 years.',
                'Master the diagrams and flowcharts.',
                'Practice numericals daily.',
                'Review formula sheet before sleep.'
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
