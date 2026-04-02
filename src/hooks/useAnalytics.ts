import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, startOfWeek, startOfMonth, parseISO } from 'date-fns';

export function useAnalytics() {
  const { completions, dailyProgress } = useApp();

  // 1. Day-wise Study Hours
  const dailyHours = Array.from({ length: 21 }, (_, i) => {
    const day = i + 1;
    const dayBlocks = Object.keys(completions).filter(id => id.startsWith(`d${day}b`) && (completions[id] as any).status === 'Done');
    return { label: `Day ${day}`, hours: dayBlocks.length * 1.5 };
  });

  // 2. Weekly Study Hours
  const weeklyHours = [
    { label: 'Week 1', hours: dailyHours.slice(0, 7).reduce((acc, d) => acc + d.hours, 0) },
    { label: 'Week 2', hours: dailyHours.slice(7, 14).reduce((acc, d) => acc + d.hours, 0) },
    { label: 'Week 3', hours: dailyHours.slice(14, 21).reduce((acc, d) => acc + d.hours, 0) },
  ];

  // 3. Monthly Study Hours
  const monthlyMap: Record<string, number> = {};
  dailyProgress.forEach(day => {
    const month = format(parseISO(day.date), 'MMMM yyyy');
    const doneCount = day.completions.filter(c => c.status === 'Done').length;
    monthlyMap[month] = (monthlyMap[month] || 0) + (doneCount * 1.5);
  });

  const monthlyHours = Object.keys(monthlyMap).map(month => ({
    label: month,
    hours: monthlyMap[month]
  })).sort((a, b) => a.label.localeCompare(b.label));

  // If no monthly data yet, show current month
  if (monthlyHours.length === 0) {
    monthlyHours.push({ label: format(new Date(), 'MMMM yyyy'), hours: 0 });
  }

  const subjectTime = [
    { subject: 'DE', hours: 0 },
    { subject: 'OS', hours: 0 },
    { subject: 'TAFL', hours: 0 },
    { subject: 'JAVA', hours: 0 },
    { subject: 'UHV', hours: 0 },
    { subject: 'Cyber', hours: 0 },
  ].map(s => {
    const count = Object.keys(completions).filter(id => {
      const block = findBlockById(id);
      return block?.subject === s.subject && (completions[id] as any).status === 'Done';
    }).length;
    return { ...s, hours: count * 1.5 };
  });

  const statusDistribution = [
    { name: 'Done', value: Object.values(completions).filter((c: any) => c.status === 'Done').length },
    { name: 'Skipped', value: Object.values(completions).filter((c: any) => c.status === 'Skipped').length },
    { name: 'Partial', value: Object.values(completions).filter((c: any) => c.status === 'Partial').length },
  ];

  return {
    dailyHours,
    weeklyHours,
    monthlyHours,
    subjectTime,
    statusDistribution
  };
}

import { SCHEDULE_DATA } from '../data/schedule';
function findBlockById(id: string) {
  return SCHEDULE_DATA.flatMap(d => d.blocks).find(b => b.id === id);
}
