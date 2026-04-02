import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function useNotifications() {
  const { userSettings } = useApp();
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (!('Notification' in window)) return;

    // Clear existing timeouts
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];

    const scheduleNotifications = () => {
      const now = new Date();
      const reminders = userSettings.reminders || [];
      const soundUrl = userSettings.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

      reminders.forEach(reminder => {
        if (!reminder.enabled) return;

        const [hours, minutes] = reminder.time.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, don't schedule
        if (scheduledTime > now) {
          const timeout = scheduledTime.getTime() - now.getTime();
          const t = window.setTimeout(() => {
            if (Notification.permission === 'granted') {
              // Play unique sound
              const audio = new Audio(soundUrl);
              audio.play().catch(e => console.error('Error playing notification sound:', e));

              new Notification("Shiva's Battle Dashboard", {
                body: reminder.msg,
                icon: userSettings.profilePictureUrl || '/favicon.ico'
              });
            }
          }, timeout);
          timeoutsRef.current.push(t);
        }
      });
    };

    if (Notification.permission === 'granted') {
      scheduleNotifications();
    }

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [userSettings.reminders, userSettings.notificationSound, userSettings.profilePictureUrl]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    return permission;
  };

  return { requestPermission };
}
