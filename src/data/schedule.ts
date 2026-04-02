import { addDays, format } from 'date-fns';

const START_DATE = new Date(2026, 2, 23); // March 23, 2026

export const SCHEDULE_DATA = [
  // WEEK 1
  {
    day: 1,
    date: format(addDays(START_DATE, 0), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd1b1', type: 'study', subject: 'DE', topic: 'Number Systems', time: '06:15–07:20 AM' },
      { id: 'd1b2', type: 'study', subject: 'OS', topic: 'Intro', time: '06:00–07:20 PM' },
      { id: 'd1b3', type: 'study', subject: 'JAVA', topic: 'OOP Intro', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 2,
    date: format(addDays(START_DATE, 1), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd2b1', type: 'study', subject: 'DE', topic: 'Boolean Algebra', time: '06:15–07:20 AM' },
      { id: 'd2b2', type: 'study', subject: 'OS', topic: 'Process Concepts', time: '06:00–07:20 PM' },
      { id: 'd2b3', type: 'study', subject: 'UHV', topic: 'Unit 1', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 3,
    date: format(addDays(START_DATE, 2), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd3b1', type: 'study', subject: 'TAFL', topic: 'Intro+DFA', time: '06:15–07:20 AM' },
      { id: 'd3b2', type: 'study', subject: 'DE', topic: 'Logic Gates+K-Map', time: '06:00–07:20 PM' },
      { id: 'd3b3', type: 'study', subject: 'JAVA', topic: 'Classes & Objects', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 4,
    date: format(addDays(START_DATE, 3), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd4b1', type: 'study', subject: 'TAFL', topic: 'NFA+Conversion', time: '06:15–07:20 AM' },
      { id: 'd4b2', type: 'study', subject: 'OS', topic: 'CPU Scheduling I', time: '06:00–07:20 PM' },
      { id: 'd4b3', type: 'study', subject: 'UHV', topic: 'Unit 2', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 5,
    date: format(addDays(START_DATE, 4), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd5b1', type: 'study', subject: 'OS', topic: 'CPU Scheduling II', time: '06:15–07:20 AM' },
      { id: 'd5b2', type: 'study', subject: 'TAFL', topic: 'Regular Expressions', time: '06:00–07:20 PM' },
      { id: 'd5b3', type: 'study', subject: 'JAVA', topic: 'Inheritance', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 6,
    date: format(addDays(START_DATE, 5), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd6b1', type: 'study', subject: 'DE', topic: 'Combinational I', time: '06:15–07:20 AM' },
      { id: 'd6b2', type: 'study', subject: 'DE', topic: 'Combinational II', time: '09:00–10:30 AM' },
      { id: 'd6b3', type: 'study', subject: 'OS', topic: 'Process Sync', time: '10:50 AM–12:20 PM' },
      { id: 'd6b4', type: 'study', subject: 'TAFL', topic: 'DFA Minimization', time: '01:30–03:00 PM' },
      { id: 'd6b5', type: 'study', subject: 'JAVA', topic: 'Polymorphism+Interfaces', time: '03:20–04:50 PM' },
      { id: 'd6b6', type: 'study', subject: 'Cyber', topic: 'Intro', time: '05:10–06:30 PM' },
    ]
  },
  {
    day: 7,
    date: format(addDays(START_DATE, 6), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd7b1', type: 'study', subject: 'TAFL', topic: 'CFG', time: '06:15–07:20 AM' },
      { id: 'd7b2', type: 'study', subject: 'OS', topic: 'Deadlock', time: '09:00–10:30 AM' },
      { id: 'd7b3', type: 'study', subject: 'DE', topic: 'Sequential Circuits', time: '10:50 AM–12:20 PM' },
      { id: 'd7b4', type: 'study', subject: 'JAVA', topic: 'Exception Handling', time: '01:30–03:00 PM' },
      { id: 'd7b5', type: 'study', subject: 'UHV', topic: 'Unit 3', time: '03:20–04:50 PM' },
      { id: 'd7b6', type: 'study', subject: 'Cyber', topic: 'Cryptography Basics', time: '05:10–06:30 PM' },
    ]
  },
  // WEEK 2
  {
    day: 8,
    date: format(addDays(START_DATE, 7), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd8b1', type: 'study', subject: 'DE', topic: 'Flip-Flop Deep Dive', time: '06:15–07:20 AM' },
      { id: 'd8b2', type: 'study', subject: 'OS', topic: 'Memory Management', time: '06:00–07:20 PM' },
      { id: 'd8b3', type: 'study', subject: 'JAVA', topic: 'Collections', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 9,
    date: format(addDays(START_DATE, 8), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd9b1', type: 'study', subject: 'TAFL', topic: 'Pushdown Automata', time: '06:15–07:20 AM' },
      { id: 'd9b2', type: 'study', subject: 'OS', topic: 'Virtual Memory', time: '06:00–07:20 PM' },
      { id: 'd9b3', type: 'study', subject: 'UHV', topic: 'Unit 4', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 10,
    date: format(addDays(START_DATE, 9), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd10b1', type: 'study', subject: 'DE', topic: 'Registers+Counters', time: '06:15–07:20 AM' },
      { id: 'd10b2', type: 'study', subject: 'OS', topic: 'File Systems', time: '06:00–07:20 PM' },
      { id: 'd10b3', type: 'study', subject: 'JAVA', topic: 'Multithreading', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 11,
    date: format(addDays(START_DATE, 10), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd11b1', type: 'study', subject: 'TAFL', topic: 'Turing Machines', time: '06:15–07:20 AM' },
      { id: 'd11b2', type: 'study', subject: 'DE', topic: 'Memory Units', time: '06:00–07:20 PM' },
      { id: 'd11b3', type: 'study', subject: 'UHV', topic: 'Unit 5 + Cyber', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 12,
    date: format(addDays(START_DATE, 11), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd12b1', type: 'study', subject: 'OS', topic: 'I/O+Disk Scheduling', time: '06:15–07:20 AM' },
      { id: 'd12b2', type: 'study', subject: 'TAFL', topic: 'Decidability', time: '06:00–07:20 PM' },
      { id: 'd12b3', type: 'study', subject: 'JAVA', topic: 'File I/O+Revision', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 13,
    date: format(addDays(START_DATE, 12), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd13b1', type: 'study', subject: 'DE', topic: 'DE PYQ(Number+Boolean)', time: '06:15–07:20 AM' },
      { id: 'd13b2', type: 'study', subject: 'DE', topic: 'DE PYQ(Circuits)', time: '09:00–10:30 AM' },
      { id: 'd13b3', type: 'study', subject: 'OS', topic: 'OS PYQ(Scheduling)', time: '10:50 AM–12:20 PM' },
      { id: 'd13b4', type: 'study', subject: 'TAFL', topic: 'TAFL PYQ(DFA+NFA)', time: '01:30–03:00 PM' },
      { id: 'd13b5', type: 'study', subject: 'TAFL', topic: 'TAFL PYQ(CFG+PDA)', time: '03:20–04:50 PM' },
      { id: 'd13b6', type: 'study', subject: 'JAVA', topic: 'JAVA(PYQ+Programs)', time: '05:10–06:30 PM' },
    ]
  },
  {
    day: 14,
    date: format(addDays(START_DATE, 13), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd14b1', type: 'study', subject: 'OS', topic: 'OS PYQ(Memory+Deadlock)', time: '06:15–07:20 AM' },
      { id: 'd14b2', type: 'study', subject: 'OS', topic: 'OS PYQ(File+I/O)', time: '09:00–10:30 AM' },
      { id: 'd14b3', type: 'study', subject: 'TAFL', topic: 'TAFL(TM+Closure)', time: '10:50 AM–12:20 PM' },
      { id: 'd14b4', type: 'study', subject: 'DE', topic: 'DE(Weak Topic Revision)', time: '01:30–03:00 PM' },
      { id: 'd14b5', type: 'study', subject: 'JAVA', topic: 'JAVA(Programs by Hand)', time: '03:20–04:50 PM' },
      { id: 'd14b6', type: 'study', subject: 'Cyber', topic: 'Cyber(Complete Syllabus)', time: '05:10–06:30 PM' },
    ]
  },
  // WEEK 3
  {
    day: 15,
    date: format(addDays(START_DATE, 14), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd15b1', type: 'study', subject: 'DE', topic: 'DE(Full Rapid Revision)', time: '06:15–07:20 AM' },
      { id: 'd15b2', type: 'study', subject: 'OS', topic: 'OS(Revision Part 1)', time: '06:00–07:20 PM' },
      { id: 'd15b3', type: 'study', subject: 'JAVA', topic: 'JAVA(Key Concepts Revision)', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 16,
    date: format(addDays(START_DATE, 15), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd16b1', type: 'study', subject: 'TAFL', topic: 'TAFL(Rapid Revision I)', time: '06:15–07:20 AM' },
      { id: 'd16b2', type: 'study', subject: 'OS', topic: 'OS(Revision Part 2)', time: '06:00–07:20 PM' },
      { id: 'd16b3', type: 'study', subject: 'UHV', topic: 'UHV(Complete Revision)', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 17,
    date: format(addDays(START_DATE, 16), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd17b1', type: 'study', subject: 'DE', topic: 'DE(Mock Test)', time: '06:15–07:20 AM' },
      { id: 'd17b2', type: 'study', subject: 'TAFL', topic: 'TAFL(Rapid Revision II)', time: '06:00–07:20 PM' },
      { id: 'd17b3', type: 'study', subject: 'Cyber', topic: 'Cyber(Final Full Pass)', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 18,
    date: format(addDays(START_DATE, 17), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd18b1', type: 'study', subject: 'OS', topic: 'OS(Mock Test)', time: '06:15–07:20 AM' },
      { id: 'd18b2', type: 'study', subject: 'DE', topic: 'DE(Weak Area Targeted)', time: '06:00–07:20 PM' },
      { id: 'd18b3', type: 'study', subject: 'JAVA', topic: 'JAVA(Viva Q Prep)', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 19,
    date: format(addDays(START_DATE, 18), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd19b1', type: 'study', subject: 'TAFL', topic: 'TAFL(Mock Test)', time: '06:15–07:20 AM' },
      { id: 'd19b2', type: 'study', subject: 'OS', topic: 'OS(Deadlock+Memory Final)', time: '06:00–07:20 PM' },
      { id: 'd19b3', type: 'study', subject: 'ALL', topic: 'Viva Question Bank ALL', time: '10:30–11:30 PM' },
    ]
  },
  {
    day: 20,
    date: format(addDays(START_DATE, 19), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd20b1', type: 'study', subject: 'DE', topic: 'DE(Formula Sheet)', time: '06:15–07:20 AM' },
      { id: 'd20b2', type: 'study', subject: 'OS', topic: 'OS(Formula Sheet)', time: '09:00–10:30 AM' },
      { id: 'd20b3', type: 'study', subject: 'TAFL', topic: 'TAFL(Formula Sheet)', time: '10:50 AM–12:20 PM' },
      { id: 'd20b4', type: 'study', subject: 'JAVA', topic: 'JAVA(Key Topics)', time: '01:30–03:00 PM' },
      { id: 'd20b5', type: 'study', subject: 'UHV', topic: 'UHV+Cyber(Last Pass)', time: '03:20–04:50 PM' },
      { id: 'd20b6', type: 'study', subject: 'ALL', topic: 'Rest+Mental Prep', time: '05:10–06:30 PM' },
    ]
  },
  {
    day: 21,
    date: format(addDays(START_DATE, 20), 'yyyy-MM-dd'),
    blocks: [
      { id: 'd21b1', type: 'study', subject: 'ALL', topic: 'All Subjects Mind Map', time: '06:15–07:20 AM' },
      { id: 'd21b2', type: 'study', subject: 'DE', topic: 'DE+TAFL Key Theorems', time: '09:00–10:30 AM' },
      { id: 'd21b3', type: 'study', subject: 'OS', topic: 'OS Critical Algorithms', time: '10:50 AM–12:20 PM' },
      { id: 'd21b4', type: 'study', subject: 'ALL', topic: 'JAVA+UHV+Cyber Quick Pass', time: '01:30–03:00 PM' },
      { id: 'd21b5', type: 'study', subject: 'ALL', topic: 'VIVA PREP ALL', time: '03:20–04:50 PM' },
    ]
  },
];
