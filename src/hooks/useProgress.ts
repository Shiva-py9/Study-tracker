import { useApp } from '../context/AppContext';
import { SCHEDULE_DATA } from '../data/schedule';
import { SUBJECTS } from '../data/subjects';

export function useProgress() {
  const { completions, customSubjects } = useApp();

  const allSubjects = [...SUBJECTS, ...customSubjects];
  const totalBlocks = SCHEDULE_DATA.reduce((acc, day) => acc + day.blocks.length, 0);
  const completedBlocks = Object.values(completions).filter((c: any) => c.status === 'Done').length;
  
  const overallProgress = (completedBlocks / totalBlocks) * 100;

  const subjectProgress = allSubjects.filter(s => s.credits).map(subject => {
    const subjectBlocks = SCHEDULE_DATA.flatMap(d => d.blocks).filter(b => b.subject === subject.id);
    const subjectCompleted = subjectBlocks.filter(b => completions[b.id]?.status === 'Done').length;
    return {
      ...subject,
      progress: subjectBlocks.length > 0 ? (subjectCompleted / subjectBlocks.length) * 100 : 0
    };
  });

  const streak = calculateStreak(completions);

  return {
    overallProgress,
    subjectProgress,
    streak,
    totalBlocks,
    completedBlocks
  };
}

function calculateStreak(completions: Record<string, any>) {
  // Simplified streak calculation: count consecutive days with at least one 'Done' block
  let streak = 0;
  const daysWithCompletions = new Set(
    Object.keys(completions)
      .filter(id => completions[id].status === 'Done')
      .map(id => id.split('b')[0].replace('d', '')) // Extract day number
  );

  const sortedDays = Array.from(daysWithCompletions).map(Number).sort((a, b) => b - a);
  
  // This is a simple logic, in a real app we'd check against current date
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0 || sortedDays[i] === sortedDays[i-1] - 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
