export interface Message {
  id: string;
  type: 'user' | 'ai' | 'attachment';
  content: string;
  timestamp: Date;
  attachment?: AttachmentFile;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  isImage: boolean;
}

export type ClaimStep = 'describe' | 'details' | 'review' | 'submit';

export interface ClaimData {
  description: string;
  dateTime: string;
  location: string;
  incidentType: string;
  injuries: string;
  policeReport: string;
}

export const STEPS: { key: ClaimStep; label: string }[] = [
  { key: 'describe', label: 'Describe incident' },
  { key: 'details', label: 'Gather details' },
  { key: 'review', label: 'Review' },
  { key: 'submit', label: 'Submit' },
];

export const FOLLOW_UP_QUESTIONS = [
  "When did this incident occur? Please provide the date and approximate time.",
  "Where did this happen? Please share the location or address.",
  "What type of incident is this? (e.g., auto accident, property damage, theft, or other)",
  "Were there any injuries involved? If so, please briefly describe them.",
  "Do you have a police report or reference number? If so, please share it.",
];

export const CLAIM_FIELD_KEYS: (keyof ClaimData)[] = [
  'dateTime',
  'location',
  'incidentType',
  'injuries',
  'policeReport',
];
