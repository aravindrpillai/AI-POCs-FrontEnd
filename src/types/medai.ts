export type MedCategory = 'orthopedics' | 'ophthalmology' | 'ent' | 'neurology' | 'cardiology' | 'dermatology' | 'gastroenterology' | 'general';
export type Gender = 'male' | 'female' | 'other';

export interface PatientIntake {
  category: MedCategory;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  problem: string;
}

export interface MedMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface MedAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  progress: number; // 0-100
  uploaded: boolean;
  error?: boolean;
}

export const CATEGORIES: { value: MedCategory; label: string; icon: string }[] = [
  { value: 'orthopedics', label: 'Orthopedics', icon: '🦴' },
  { value: 'ophthalmology', label: 'Ophthalmology', icon: '👁️' },
  { value: 'ent', label: 'ENT', icon: '👂' },
  { value: 'neurology', label: 'Neurology', icon: '🧠' },
  { value: 'cardiology', label: 'Cardiology', icon: '❤️' },
  { value: 'dermatology', label: 'Dermatology', icon: '🩺' },
  { value: 'gastroenterology', label: 'Gastroenterology', icon: '🫁' },
  { value: 'general', label: 'General Medicine', icon: '💊' },
];
