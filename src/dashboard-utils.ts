import type { Video } from './types';

export function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1).replace('.0', '')}M`;
  }

  if (views >= 1000) {
    return `${(views / 1000).toFixed(1).replace('.0', '')}K`;
  }

  return views.toString();
}

export function getViralBadgeColor(score: number) {
  if (score >= 200) return 'bg-rose-500/10 text-rose-500 border border-rose-500/25 font-bold animate-pulse';
  if (score >= 110) return 'bg-red-500/10 text-red-400 border border-red-500/25 font-semibold';
  if (score >= 90) return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-medium';
  if (score >= 50) return 'bg-amber-500/10 text-amber-500 border border-amber-500/25';
  return 'bg-gray-500/10 text-gray-400 border border-gray-500/25';
}

export function getViralLabel(score: number) {
  if (score >= 200) return 'Explosivo 🚀';
  if (score >= 110) return 'Viral 🔥';
  if (score >= 90) return 'Médio 📊';
  if (score >= 50) return 'Fraco 📉';
  return 'Insuficiente ⚠️';
}

export function sortVideosByViralScore(videos: Video[]) {
  return [...videos].sort((left, right) => right.viral_score - left.viral_score);
}