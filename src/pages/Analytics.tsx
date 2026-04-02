import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { useProgress } from '../hooks/useProgress';
import { Flame, TrendingUp, Target, Award, Calendar } from 'lucide-react';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export default function Analytics() {
  const { dailyHours, weeklyHours, monthlyHours, subjectTime, statusDistribution } = useAnalytics();
  const { streak, overallProgress, completedBlocks } = useProgress();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const radarData = subjectTime.map(s => ({
    subject: s.subject,
    A: s.hours * 10, // Scaled for radar
    fullMark: 100,
  }));

  const getChartData = () => {
    switch (viewMode) {
      case 'week': return weeklyHours;
      case 'month': return monthlyHours;
      default: return dailyHours;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">PERFORMANCE ANALYTICS</h2>
          <p className="text-gray-500 mt-1">Visualize your progress. Data doesn't lie.</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            DAY-WISE
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            WEEKLY
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            MONTHLY
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: `${streak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Completion Rate', value: `${Math.round(overallProgress)}%`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Hours Invested', value: `${completedBlocks * 1.5}h`, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Blocks Done', value: completedBlocks, icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-bebas text-white tracking-wider">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Hours Line Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bebas tracking-widest text-white mb-6">
            {viewMode.toUpperCase()} STUDY HOURS
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="label" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="hours" stroke="#ff4757" strokeWidth={3} dot={{ fill: '#ff4757', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Time Bar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bebas tracking-widest text-white mb-6">TIME PER SUBJECT (HOURS)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="subject" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  cursor={{ fill: '#ffffff05' }}
                />
                <Bar dataKey="hours" fill="#3d9eff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bebas tracking-widest text-white mb-6">BLOCK STATUS DISTRIBUTION</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusDistribution.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-xs text-gray-400 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Mastery Radar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-lg font-bebas tracking-widest text-white mb-6">SUBJECT MASTERY RADAR</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
