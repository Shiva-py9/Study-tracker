import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CalendarRange, 
  BarChart3, 
  CheckSquare, 
  BookOpen, 
  Settings,
  Flame,
  LogOut,
  LogIn,
  User as UserIcon,
  X,
  Calculator
} from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schedule', icon: CalendarDays, label: 'Daily Schedule' },
  { to: '/planner', icon: CalendarRange, label: '21-Day Planner' },
  { to: '/analytics', icon: BarChart3, label: 'Performance' },
  { to: '/cgpa', icon: Calculator, label: 'CGPA Predictor' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { streak } = useProgress();
  const { user, login, logout, isGuest } = useAuth();
  const { userSettings } = useApp();

  const userName = (userSettings?.name || user?.name || 'SHIVA').toUpperCase();

  return (
    <aside className={`
      fixed left-0 top-0 h-screen w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col z-50 transition-all duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between lg:block">
          <h1 className="text-2xl font-bebas tracking-wider text-white flex items-center gap-2">
            <span className="text-red-500">{userName}'S</span> BATTLE
          </h1>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {user ? (
          <div className="mt-4 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
              {userSettings.profilePictureUrl ? (
                <img src={userSettings.profilePictureUrl} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{userName}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">Warrior</div>
            </div>
          </div>
        ) : (
          <button 
            onClick={login}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20"
          >
            <LogIn className="w-4 h-4" />
            LOGIN WITH GOOGLE
          </button>
        )}

        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="text-sm font-medium text-orange-500">{streak} Day Streak</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-white/10 text-white shadow-lg shadow-black/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        {(user || isGuest) && (
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        )}
        <div className="px-4 py-2">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Exam Countdown</div>
          <div className="text-sm text-gray-400">April 15, 2026</div>
        </div>
      </div>
    </aside>
  );
}
