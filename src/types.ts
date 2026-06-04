export interface Channel {
  id: string; // YouTube channel ID (e.g. UC...)
  name: string;
  handle: string;
  thumbnail: string;
  subscribers: string;
  last_monitored_at: string;
  videoCount?: number;
}

export interface Video {
  id: string; // YouTube video ID
  channel_id: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  duration: string;
  published_at: string;
  viral_score: number; // calculated relative to general average
  analysis?: string; // JSON with deep insights
}

export interface VideoAnalysis {
  viralFactors: string[];
  hookStrength: 'Excelente' | 'Bom' | 'Regular' | 'Baixo';
  hookExplanation: string;
  thumbnailFeedback: string;
  storytellingStrategy: string;
  audienceRetentionTips: string[];
}

export interface VideoIdea {
  id?: number;
  channel_id: string;
  title: string;
  concept: string;
  script_outline: string;
  cinematic_prompt: string;
  created_at: string;
}

export interface ScriptItem {
  id?: number;
  title: string;
  target_duration: string;
  full_script: string;
  cinematic_prompts: string; // JSON array of prompt strings
  viral_hooks: string; // JSON array of hooks
  created_at: string;
}

export interface DashboardStats {
  totalChannels: number;
  totalVideos: number;
  avgViralScore: number;
  viralVideosCount: number;
  totalIdeas: number;
  totalScripts: number;
}
