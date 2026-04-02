import { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<any>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = differenceInSeconds(target, now);
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft(intervalToDuration({ start: now, end: target }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Days', value: timeLeft.days || 0 },
    { label: 'Hours', value: timeLeft.hours || 0 },
    { label: 'Mins', value: timeLeft.minutes || 0 },
    { label: 'Secs', value: timeLeft.seconds || 0 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {units.map((unit) => (
        <div key={unit.label} className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 text-center backdrop-blur-xl">
          <div className="text-xl sm:text-3xl font-bebas text-white tracking-wider">{unit.value.toString().padStart(2, '0')}</div>
          <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-gray-500 mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
