export interface ICandidateBase {
    id: number,
    name: string | null,
    email: string | null,
    mobile: string | null,
    cv_fileid:  string | null,
    cv_filename: string | null,
    skills: string[] | null,
    total_exp: number | null,
    ollama: ICandidate_LLM_Data | null,
    ollama_gen_time: string | null,
    openai: ICandidate_LLM_Data | null,
    openai_gen_time: string | null,
    create_time: string | null
}

export interface ICandidate_LLM_Data {
  candidate_name: string;
  email: string;
  contact_number: string;
  location: string | null;
  gap_in_experience: string | null;
  overall_years_experience: number;
  skills: { name: string; years: number | null }[];
  experiences: {
    company: string;
    role: string;
    start: string;
    end: string;
    highlights: string[];
  }[];
  certifications: { name: string; issuer: string | null; year: string | null }[];
  ranking_score: number;
  ranking_reason: string;
}