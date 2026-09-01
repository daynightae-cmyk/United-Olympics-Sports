export type PortalType = 'public' | 'player' | 'parent' | 'coach' | 'admin';

export interface BilingualString {
  en: string;
  ar: string;
}

export interface UserProfile {
  id: string;
  name: BilingualString;
  role: 'player' | 'parent' | 'coach' | 'admin' | 'guest';
  email: string;
  phone: string;
  avatar: string;
  portal: PortalType;
  badge?: BilingualString;
  branch?: BilingualString;
}

export interface Program {
  id: string;
  title: BilingualString;
  sport: 'football' | 'swimming' | 'gymnastics' | 'martial_arts' | 'basketball' | 'tennis' | 'track';
  ageGroup: string;
  description: BilingualString;
  headCoach: BilingualString;
  pricePerMonth: number;
  currency: BilingualString;
  rating: number;
  enrolled: number;
  capacity: number;
  schedule: BilingualString;
  level: BilingualString;
  features: BilingualString[];
  image: string;
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  tactical: number;
  attendanceRate: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  mvpCount: number;
  overallRating: number;
}

export interface PlayerRecord {
  id: string;
  name: BilingualString;
  dob: string;
  age: number;
  sport: string;
  squad: string;
  position: BilingualString;
  jerseyNumber: number;
  branch: BilingualString;
  coach: BilingualString;
  photo: string;
  stats: PlayerStats;
  fitnessStatus: 'fit' | 'rehab' | 'resting' | 'injured';
  qrCode: string;
  joinedDate: string;
  rank: number;
  points: number;
}

export interface TrainingSession {
  id: string;
  title: BilingualString;
  date: string;
  time: string;
  pitch: BilingualString;
  coach: BilingualString;
  sport: string;
  focus: BilingualString;
  drills: BilingualString[];
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  intensity: 'Medium' | 'High' | 'Elite';
}

export interface AttendanceRecord {
  id: string;
  playerId: string;
  playerName: BilingualString;
  date: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  checkInTime?: string;
  note?: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  studentName: BilingualString;
  parentName: BilingualString;
  program: BilingualString;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidAt?: string;
  paymentMethod?: string;
}

export interface BranchLocation {
  id: string;
  name: BilingualString;
  city: BilingualString;
  address: BilingualString;
  facilities: BilingualString[];
  contact: string;
  capacity: number;
  activeAthletes: number;
}

export interface DrillItem {
  id: string;
  title: BilingualString;
  category: BilingualString;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  description: BilingualString;
  objectives: BilingualString[];
  equipment: BilingualString[];
}

export interface MatchFixture {
  id: string;
  tournament: BilingualString;
  homeTeam: BilingualString;
  awayTeam: BilingualString;
  date: string;
  time: string;
  venue: BilingualString;
  score?: { home: number; away: number };
  status: 'upcoming' | 'live' | 'completed';
  highlights?: BilingualString[];
}
