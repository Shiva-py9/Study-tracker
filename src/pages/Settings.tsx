import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Trash2, Bell, Moon, Sun, Download, RefreshCw, User, Save, Camera, Plus, X, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { userSettings, updateSettings, resetProgress, uploadProfilePicture } = useApp();
  const [localName, setLocalName] = useState(userSettings.name);
  const [localExamDate, setLocalExamDate] = useState(userSettings.examDate);
  const [localReminders, setLocalReminders] = useState(userSettings.reminders || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalName(userSettings.name);
    setLocalExamDate(userSettings.examDate);
    setLocalReminders(userSettings.reminders || []);
  }, [userSettings.name, userSettings.examDate, userSettings.reminders]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ 
        name: localName, 
        examDate: localExamDate,
        reminders: localReminders
      });
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      await uploadProfilePicture(file);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const addReminder = () => {
    const newReminder = {
      id: Math.random().toString(36).substr(2, 9),
      time: '09:00',
      msg: 'Time to study! 📚',
      enabled: true
    };
    setLocalReminders([...localReminders, newReminder]);
  };

  const updateReminder = (id: string, updates: any) => {
    setLocalReminders(localReminders.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReminder = (id: string) => {
    setLocalReminders(localReminders.filter(r => r.id !== id));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
      window.location.reload();
    }
  };

  const playTestSound = () => {
    const audio = new Audio(userSettings.notificationSound);
    audio.play().catch(e => toast.error('Could not play sound'));
  };

  return (
    <div className="space-y-8 pb-12 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bebas tracking-wider text-white">COMMAND SETTINGS</h2>
          <p className="text-gray-500 mt-1">Configure your dashboard and personal preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          SAVE CHANGES
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
          <h3 className="text-xl font-bebas tracking-widest text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            PROFILE
          </h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center">
                {userSettings.profilePictureUrl ? (
                  <img src={userSettings.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-12 h-12 text-gray-600" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Your Name</label>
                <input 
                  type="text"
                  value={localName}
                  onChange={e => setLocalName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Exam Date</label>
                <input 
                  type="date"
                  value={localExamDate}
                  onChange={e => setLocalExamDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reminders Section */}
        <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bebas tracking-widest text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              STUDY REMINDERS
            </h3>
            <button 
              onClick={addReminder}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {localReminders.map((reminder) => (
                <motion.div 
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5"
                >
                  <input 
                    type="time"
                    value={reminder.time}
                    onChange={e => updateReminder(reminder.id, { time: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <input 
                    type="text"
                    value={reminder.msg}
                    onChange={e => updateReminder(reminder.id, { msg: e.target.value })}
                    placeholder="Reminder message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button 
                      onClick={() => updateReminder(reminder.id, { enabled: !reminder.enabled })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${reminder.enabled ? 'bg-green-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${reminder.enabled ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                    <button 
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {localReminders.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm italic">
                No reminders set. Click + to add one.
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Volume2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Notification Sound</div>
                <div className="text-xs text-gray-500">Unique battle alert sound</div>
              </div>
            </div>
            <button 
              onClick={playTestSound}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white rounded-lg transition-all border border-white/5"
            >
              TEST SOUND
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
          <h3 className="text-xl font-bebas tracking-widest text-white mb-6 flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            THEME & DISPLAY
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  {userSettings.theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dark Mode</div>
                  <div className="text-xs text-gray-500">Easier on the eyes for night study</div>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ theme: userSettings.theme === 'dark' ? 'light' : 'dark' })}
                className={`w-12 h-6 rounded-full transition-colors relative ${userSettings.theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${userSettings.theme === 'dark' ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white/5 border border-white/10 rounded-[40px] p-8">
          <h3 className="text-xl font-bebas tracking-widest text-red-500 mb-6 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            DANGER ZONE
          </h3>
          <div className="space-y-4">
            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
                <div className="text-left">
                  <div className="text-sm font-bold text-red-500">Reset All Progress</div>
                  <div className="text-xs text-red-500/60">Wipe all data and start fresh</div>
                </div>
              </div>
            </button>
          </div>
        </section>

        <div className="pt-8 text-center">
          <button className="flex items-center gap-2 mx-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5">
            <Download className="w-5 h-5" />
            EXPORT PROGRESS (PDF)
          </button>
          <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-[0.2em]">{(userSettings?.name || 'Shiva')}'s 21-Day Battle Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
}
