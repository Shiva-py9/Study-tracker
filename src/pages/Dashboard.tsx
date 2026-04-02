import { motion } from 'motion/react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useProgress } from '../hooks/useProgress';
import { SCHEDULE_DATA } from '../data/schedule';
import CountdownTimer from '../components/CountdownTimer';
import MotivationalQuote from '../components/MotivationalQuote';
import BlockCard from '../components/BlockCard';
import { SUBJECTS } from '../data/subjects';
import { Flame, Trophy, Target, Clock } from 'lucide-react';

export default function Dashboard() {
  const { userSettings } = useApp();
  const { overallProgress, subjectProgress, streak, completedBlocks, totalBlocks } = useProgress();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayData = SCHEDULE_DATA.find(d => d.date === today) || SCHEDULE_DATA[0]; // Fallback to Day 1 for demo

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center shrink-0">
            {userSettings.profilePictureUrl ? (
              <img src={userSettings.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-3xl font-bebas text-gray-600">{(userSettings?.name || 'S')[0]}</span>
            )}
          </div>
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bebas tracking-wider text-white"
            >
              WELCOME BACK, <span className="text-red-500">{(userSettings?.name || 'SHIVA').toUpperCase()}</span>
            </motion.h2>
            <p className="text-gray-500 mt-1">The battle continues. Stay focused, stay sharp.</p>
          </div>
        </div>
        <div className="w-full md:w-auto">
          <CountdownTimer targetDate={userSettings.examDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Focus */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bebas tracking-widest text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                TODAY'S BATTLE PLAN
              </h3>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {format(new Date(), 'EEEE, MMMM do')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayData.blocks.map(block => (
                <BlockCard key={block.id} block={block} />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MotivationalQuote />
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Progress</h4>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-4xl font-bebas text-white">{Math.round(overallProgress)}%</span>
                  <span className="text-xs text-gray-500 font-bold">{completedBlocks}/{totalBlocks} Blocks</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Streak</div>
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                    <Flame className="w-4 h-4 fill-current" />
                    {streak} Days
                  </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Hours Logged</div>
                  <div className="flex items-center gap-1 text-blue-500 font-bold">
                    <Clock className="w-4 h-4" />
                    {completedBlocks * 1.5}h
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Subject Stats & Legend */}
        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bebas tracking-widest text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              SUBJECT MASTERY
            </h3>
            <div className="space-y-6">
              {subjectProgress.map(subject => (
                <div key={subject.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">{subject.id}</span>
                    <span className="text-xs font-bold text-gray-500">{Math.round(subject.progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      className="h-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Subject Legend</h4>
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{s.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
