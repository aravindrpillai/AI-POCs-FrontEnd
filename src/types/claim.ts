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
  note?: string;
  uploading?: boolean;
  uploadError?: boolean;
}

export type ClaimStep = 'describe' | 'details' | 'review' | 'submit';

export const STEPS: { key: ClaimStep; label: string }[] = [
  { key: 'describe', label: 'Describe incident' },
  { key: 'details', label: 'Gather details' },
  { key: 'review', label: 'Review' },
  { key: 'submit', label: 'Submit' },
];

export type ClaimData = AIResponseData;

export interface AIResponseData {
  what_happened: string;
  incident_date: string;
  incident_location: string;
  parties_involved: {
    name: string;
    role: string;
    phone: string;
    email: string;
    injury: string;
  }[];
  vehicle_number: string;
  other_vehicle_number?: string;
  contact_details: { name: string; phone: string; email: string }[];
  police_fir_number: string;
  policy_number: string;
  severity?: number;
  genuinity_score?: number;
  genuinity_rationale?: string;
  damage_map?: {
    is_collision: boolean;
    damages?: { view: string; zones: string[] }[];
    view?: string;
    damage_zones?: string[];
  };
}

export interface AIResponse {
  conv_id: string;
  reply: string;
  summary: boolean;
  data: AIResponseData | null;
}
