import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Tv, 
  Flame, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Clock, 
  Users, 
  FileText, 
  Sparkles, 
  Search,
  ExternalLink,
  Shield,
  HelpCircle,
  VideoOff,
  ChevronRight,
  Info
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import VideoAnalysisModal from './components/VideoAnalysisModal';
import IdeaGenerator from './components/IdeaGenerator';
import Scriptwriter from './components/Scriptwriter';
import { Channel, Video, DashboardStats } from './types';

export default function App() {
  // Navigation states
  const [currentView, setCurrentView] = useState<'dashboard' | 'scriptwriter'>('dashboard');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  
  // Scriptwriter prefilled states
  const [scriptPrefill, setScriptPrefill] = useState({ title: '', concept: '' });
const [storyCategory, setStoryCategory] = useState<'misterio' | 'terror' | 'suspense'>('misterio');
const [storyOptions, setStoryOptions] = useState<any[]>([]);
const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  // Data states
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [globalVideosFeed, setGlobalVideosFeed] = useState<Video[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalChannels: 0,
    totalVideos: 0,
    avgViralScore: 100,
    viralVideosCount: 0,
    totalIdeas: 0,
    totalScripts: 0
  });

  // UX states
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<Video | null>(null);
const [lastGeneratedProject, setLastGeneratedProject] = useState<{
  title: string;
  output: string;
  createdAt: string;
} | null>(null);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'videos' | 'ideas'>('videos');
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Load initial channel, video, and aggregate dashboard data
  const loadDashboardData = async () => {
    setIsRefreshingStats(true);
    try {
      // 1. Load monitored channels
      const channelsRes = await fetch('/api/channels');
      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        setChannels(channelsData);
      }

      // 2. Load global KPI stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 3. Load top viral videos from all channels combined (global feed)
      // We will perform a simple multi-fetch or rely on a specific join inside the database
      // Let's grab videos for each channel or fetch globally. We'll fetch for each channel and aggregate
    } catch (err) {
      console.error('Falha ao carregar métricas:', err);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Fetch videos whenever a specific channel gets clicked or refreshed
  useEffect(() => {
    if (selectedChannelId) {
      const fetchChannelVideos = async () => {
        try {
          const res = await fetch(`/api/channels/${selectedChannelId}/videos`);
          if (res.ok) {
            const data = await res.json();
            setVideos(data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchChannelVideos();
      setActiveDetailTab('videos');
    } else {
      setVideos([]);
    }
  }, [selectedChannelId]);

  // Aggregate global high viral score feed from all channels Combined
  useEffect(() => {
    const aggregateGlobalFeed = async () => {
      try {
        const listPromises = channels.map(c => fetch(`/api/channels/${c.id}/videos`).then(r => r.json()));
        const results = await Promise.all(listPromises);
        const combined: Video[] = results.flat();
        // Sort highest viral scores first
        combined.sort((a, b) => b.viral_score - a.viral_score);
        setGlobalVideosFeed(combined.slice(0, 15));
      } catch (err) {
        console.error(err);
      }
    };

    if (channels.length > 0) {
      aggregateGlobalFeed();
    } else {
      setGlobalVideosFeed([]);
    }
  }, [channels]);

  // API Call Handlers
  const handleAddChannel = async (handle: string) => {
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle })
    });

    if (!res.ok) {
      const errorJson = await res.json();
      throw new Error(errorJson.error || 'Erro ao adicionar canal');
    }

    await loadDashboardData();
  };

  const handleRefreshChannel = async (id: string) => {
    const res = await fetch(`/api/channels/${id}/refresh`, {
      method: 'POST'
    });

    if (!res.ok) {
      throw new Error('Erro ao sincronizar dados');
    }

    if (selectedChannelId === id) {
      // Trigger video re-load
      const vRes = await fetch(`/api/channels/${id}/videos`);
      if (vRes.ok) {
        setVideos(await vRes.json());
      }
    }
    await loadDashboardData();
  };

  const handleDeleteChannel = async (id: string) => {
    const res = await fetch(`/api/channels/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Erro ao excluir canal');
    }

    await loadDashboardData();
  };

  const handleWriteScriptFromIdea = (title: string, concept: string) => {
    setScriptPrefill({ title, concept });
    setCurrentView('scriptwriter');
    setSelectedChannelId(null);
  };
const handleGenerateStoryOptions = async () => {
  try {
    alert('🎬 Gerando 3 ideias...');

    const res = await fetch('/api/story-options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: storyCategory })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao gerar ideias');
    }

    setStoryOptions(data.options || []);
    setSelectedStoryId(data.options?.[0]?.id || null);

    alert('✅ 3 ideias geradas!');
  } catch (err: any) {
    alert(`❌ Erro ao gerar ideias:\n\n${err.message}`);
  }
};

const handleGenerateSelectedProject = async () => {
  if (!selectedStoryId) {
    alert('Escolha uma ideia primeiro.');
    return;
  }

  try {
    alert(`🎬 Gerando projeto completo da ideia ${selectedStoryId}...`);

    const res = await fetch('/api/generate-selected-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: selectedStoryId })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao gerar projeto');
    }

    setLastGeneratedProject({
      title: `Ideia ${selectedStoryId}`,
      output: data.output || 'backend/output/capcut-pack',
      createdAt: new Date().toLocaleString()
    });

    alert('✅ Projeto completo criado!');
  } catch (err: any) {
    alert(`❌ Erro ao gerar projeto:\n\n${err.message}`);
  }
};
const handleGeneratePackFromVideo = async (video: Video) => {
  try {
    alert(`🎬 Gerando pacote CapCut para:\n\n${video.title}`);

    const res = await fetch('/api/generate-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: video.title })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao gerar pacote');
    }

   setLastGeneratedProject({
  title: video.title,
  output: data.output || 'backend/output/capcut-pack',
  createdAt: new Date().toLocaleString()
}); alert(`✅ Pacote CapCut criado!\n\n${video.title}`);
  } catch (err: any) {
    alert(`❌ Erro ao gerar pacote:\n\n${err.message}`);
  }
};
  const getViralBadgeColor = (score: number) => {
    if (score >= 200) return 'bg-rose-500/10 text-rose-500 border border-rose-500/25 font-bold animate-pulse';
    if (score >= 110) return 'bg-red-500/10 text-red-400 border border-red-500/25 font-semibold';
    if (score >= 90) return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-medium';
    if (score >= 50) return 'bg-amber-500/10 text-amber-500 border border-amber-500/25';
    return 'bg-gray-500/10 text-gray-400 border border-gray-500/25';
  };

  const getViralLabel = (score: number) => {
    if (score >= 200) return 'Explosivo 🚀';
    if (score >= 110) return 'Viral 🔥';
    if (score >= 90) return 'Médio 📊';
    if (score >= 50) return 'Fraco 📉';
    return 'Insuficiente ⚠️';
  };

  const activeChannel = channels.find(c => c.id === selectedChannelId);

  // Helper formatting view stats
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return views.toString();
  };

  return (
    <div id="mysterytube-main-layout" className="flex h-screen w-screen bg-[#050506] text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar - channel picker form & list */}
      <Sidebar
        channels={channels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        onAddChannel={handleAddChannel}
        onRefreshChannel={handleRefreshChannel}
        onDeleteChannel={handleDeleteChannel}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Main Content Area */}
      <main id="app-main-viewport" className="flex-1 relative overflow-y-auto bg-[#050506] p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.04)_0%,transparent_75%)] pointer-events-none"></div>
        
        {/* Dynamic Navigation views */}
        <AnimatePresence mode="wait">
          {currentView === 'scriptwriter' ? (
            <motion.div
              key="scriptwriter-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header Title context */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f2833]/40">
                <div>
                  <h2 className="text-xl font-bold font-display text-white">Roteirista Cinematográfico</h2>
                  <p className="text-xs text-gray-400 mt-1">Gere ganchos magnéticos de retenção e roteiros estruturados de 15 minutos utilizando IA.</p>
                </div>
              </div>

              {/* Central Scriptwriter Module */}
              <Scriptwriter
                initialTitle={scriptPrefill.title}
                initialConcept={scriptPrefill.concept}
              />
            </motion.div>
          ) : selectedChannelId && activeChannel ? (
            /* Channel Detail view */
            <motion.div
              key="channel-details-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Channel Profile Banner card */}
              <div className="relative p-6 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-45"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -z-10"></div>
                
                <div className="flex items-center gap-4">
                  <img
                    src={activeChannel.thumbnail}
                    alt={activeChannel.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-500/20 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white font-display leading-tight">{activeChannel.name}</h2>
                      <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-bold">Monitorado</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{activeChannel.handle}</p>
                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-gray-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {activeChannel.subscribers}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Sincronizado {new Date(activeChannel.last_monitored_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header actions */}
                <div className="flex gap-2">
                  <button
                    id="btn-trigger-refresh"
                    onClick={() => handleRefreshChannel(activeChannel.id)}
                    className="flex items-center justify-center gap-2 font-display text-xs font-semibold px-4.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sincronizar Canal</span>
                  </button>
                </div>
              </div>

              {/* Sub tabs selector */}
              <div className="flex border-b border-white/5 gap-6">
                <button
                  id="tab-videos"
                  onClick={() => setActiveDetailTab('videos')}
                  className={`pb-3 text-sm font-semibold font-display tracking-wide relative transition-colors ${
                    activeDetailTab === 'videos' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mapeamento de Vídeos ({videos.length})
                  {activeDetailTab === 'videos' && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-red-600 rounded" />
                  )}
                </button>
                <button
                  id="tab-ideas"
                  onClick={() => setActiveDetailTab('ideas')}
                  className={`pb-3 text-sm font-semibold font-display tracking-wide relative transition-colors ${
                    activeDetailTab === 'ideas' ? 'text-white font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Incubadora de Ideias
                  {activeDetailTab === 'ideas' && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-red-600 rounded" />
                  )}
                </button>
              </div>

              {/* Selected Sub Tab body screen */}
              {activeDetailTab === 'videos' ? (
                <div className="space-y-4">
                  {/* Instructional alert banner */}
                  <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-indigo-300 font-sans text-xs leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Psicologia dos Cliques:</strong> Compare os vídeos abaixo. O <strong>Score Viral</strong> calcula o engajamento relativo deste vídeo frente à média comum do próprio canal (100%). Clique em qualquer cartão para ver a análise profunda do Gemini sobre a imagem da thumbnail, narrativa e técnicas psicológicas de suspense!
                    </div>
                  </div>

                  {/* Videos map output */}
                  {videos.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-white/5 bg-zinc-900/10">
                      <VideoOff className="w-10 h-10 text-gray-600 mx-auto" />
                      <p className="text-xs text-gray-500 mt-2 font-medium">Nenhum vídeo capturado</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {videos.map((vid) => (
                        <motion.div
                          key={vid.id}
                          id={`video-card-${vid.id}`}
                          whileHover={{ y: -3 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => setSelectedVideoForAnalysis(vid)}
                          className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-red-650/30 flex flex-col group relative transition-all shadow-lg backdrop-blur-sm"
                        >
                          {/* Image container */}
                          <div className="relative aspect-video w-full bg-slate-900 border-b border-white/5 overflow-hidden">
                            <img
                              src={vid.thumbnail_url}
                              alt={vid.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Length string */}
                            <span className="absolute bottom-2 right-2 bg-black/85 text-[10px] font-mono text-white px-1.5 py-0.5 rounded">
                              {vid.duration}
                            </span>
                          </div>

                          {/* Detail fields info */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                            <div>
                              <p className="text-xs font-bold text-white leading-normal line-clamp-2 h-9 group-hover:text-red-400 transition-colors">
                                {vid.title}
                              </p>
<p className="text-xs font-bold text-white leading-relaxed hover:text-red-400 transition-colors">
  {vid.title}
</p>

<button
  onClick={(e) => {
    e.stopPropagation();
    handleGeneratePackFromVideo(vid);
console.log("BOTÃO CLICADO", vid.title);
alert("BOTÃO CLICADO");

  }}
  className="mt-2 w-fit rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase text-red-300 hover:bg-red-500/20"
>
  🎬 Gerar Pack
</button>
                              <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono mt-2">
                                <span>{formatViews(vid.view_count)} visualizações</span>
                                <span>{vid.published_at}</span>
                              </div>
                            </div>

                            {/* Scoring bar */}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-mono font-bold text-gray-500">Score Viral</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold font-mono text-white">{vid.viral_score}%</span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${getViralBadgeColor(vid.viral_score)}`}>
                                  {getViralLabel(vid.viral_score)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Ideia generator screen container */
                <IdeaGenerator
                  channel={activeChannel}
                  onWriteScript={handleWriteScriptFromIdea}
                />
              )}
            </motion.div>
          ) : (
            /* General Platform Dashboard view */
            <motion.div
              key="global-dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Massive Welcome Hero Banner */}
              <div className="p-7 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm xl:p-8 flex flex-col lg:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-45"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-red-600/10 text-red-500">
                      <Flame className="w-4 h-4 animate-bounce" />
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-red-500">Módulo Científico de Suspense</span>
                  </div>
                  <h2 className="text-2xl font-extrabold font-display text-white mt-1.5 tracking-tight">Análise Geral de Canais de Mistério</h2>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Adicione canais de mistério à barra lateral para extrair automaticamente novos vídeos, calcular a viralidade comparada a 20 publicações e gerar roteiros de retenção de 15 minutos com o Gemini AI.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-950/10 rounded-xl border border-red-900/10 text-center shrink-0">
                    <span className="text-[10px] font-mono text-gray-500 block uppercase font-bold">Média de Sucesso</span>
                    <span className="text-2xl font-bold text-red-500 mt-1 block font-mono">100%</span>
                  </div>
                  <div className="p-3 bg-red-950/10 rounded-xl border border-red-900/10 text-center shrink-0">
                    <span className="text-[10px] font-mono text-gray-500 block uppercase font-bold">Padrão Viral</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono">↗ 110%</span>
                  </div>
                </div>
              </div>

              {/* KPI metrics cards display */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                  id="kpi-channels"
                  title="Canais Monitorados"
                  value={stats.totalChannels}
                  icon="Tv"
                  description="Canais ativos mapeados na sidebar"
                  accent="red"
                />
                <KPICard
                  id="kpi-videos"
                  title="Vídeos Analisados"
                  value={stats.totalVideos}
                  icon="Flame"
                  description="Vídeos catalogados no banco SQLite"
                  accent="amber"
                />
                <KPICard
                  id="kpi-avg-score"
                  title="Score Geral de Mistério"
                  value={`${stats.avgViralScore}%`}
                  icon="TrendingUp"
                  description="Eficiência viral média do portfólio"
                  accent="blue"
                />
                <KPICard
                  id="kpi-viral-detected"
                  title="Breakouts Virais"
                  value={stats.viralVideosCount}
                  icon="Sparkles"
                  description="Tópicos com score viral >= 110%"
                  accent="emerald"
                />
              </div>

              {/* Feed global containing hottest viral layouts currently */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </span>
<div className="mb-8 rounded-3xl border border-red-500/30 bg-zinc-900/80 p-8 shadow-2xl">
  <h3 className="text-sm font-bold text-white mb-3">🎬 Gerador de Projeto Completo</h3>

  <div className="flex gap-2 mb-4">
    {['misterio', 'terror', 'suspense'].map((cat) => (
      <button
        key={cat}
        onClick={() => setStoryCategory(cat as any)}
        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase ${
          storyCategory === cat ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-300'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>

  <button
    onClick={handleGenerateStoryOptions}
    className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold mb-4"
  >
<button
  className="mb-4 w-full rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg hover:bg-red-700"
>
  🚀 GERAR CANAL DARK COMPLETO
</button>
Gerar 3 Ideias
  </button>

  <div className="space-y-2">
    {storyOptions.map((idea) => (
      <button
        key={idea.id}
        onClick={() => setSelectedStoryId(idea.id)}
        className={`block w-full text-left p-3 rounded-lg text-xs ${
          selectedStoryId === idea.id ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-gray-300'
        }`}
      >
        {idea.id}. {idea.title}
      </button>
    ))}
  </div>

  <button
    onClick={handleGenerateSelectedProject}
    className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold"
  >
    🎬 Gerar Projeto Completo em Português
<div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
  <h3 className="text-sm font-bold text-emerald-300 mb-3">
    📊 Status do Projeto
  </h3>

  <div className="space-y-2 text-xs">
    <div>✅ Backend Online</div>
    <div>✅ Banco SQLite</div>
    <div>✅ Ideias</div>
    <div>⏳ Roteiro</div>
    <div>⏳ Narração</div>
    <div>⏳ Vídeos</div>
    <div>❌ CapCut Pack</div>
  </div>
</div>
  </button>
</div>
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">Líderes Virais Globais</h3>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">Atualizado dinamicamente</span>
                </div>
{lastGeneratedProject && (
  <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-xl">
    <h3 className="text-sm font-bold text-emerald-300">📦 Último Projeto Gerado</h3>
    <p className="mt-2 text-xs text-white font-semibold">{lastGeneratedProject.title}</p>
    <p className="mt-1 text-[11px] text-emerald-200">Criado em: {lastGeneratedProject.createdAt}</p>
    <p className="mt-1 text-[11px] text-gray-400">Pasta: {lastGeneratedProject.output}</p>
  </div>
)}
                {globalVideosFeed.length === 0 ? (
                  <div className="p-16 text-center rounded-2xl border border-dashed border-white/5 bg-zinc-900/10">
                    <Info className="w-8 h-8 text-gray-600 mx-auto" />
                    <h4 className="text-sm font-semibold text-white mt-3">Pronto para iniciar?</h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      Adicione handles de canais de mistério à barra lateral (clicando no botão `+`) ou explore o canal de demonstração "Filipe Penoni" pré-semeado no sistema!
                    </p>
                  </div>
                ) : (
                  <div className="bg-zinc-900/40 rounded-2xl border border-white/5 overflow-hidden backdrop-blur-sm shadow-xl">
                    {/* Header header label row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-[10px] uppercase font-mono font-bold text-gray-500 border-b border-white/5 bg-black/10">
                      <div className="col-span-6">Vídeo de Mistério</div>
                      <div className="col-span-2">Canal</div>
                      <div className="col-span-2 text-right">Visualizações</div>
                      <div className="col-span-2 text-right text-red-400">Score Viral</div>
                    </div>

                    {/* Table list */}
                    <div className="divide-y divide-white/5">
                      {globalVideosFeed.map((vid) => {
                        const originalChannel = channels.find(c => c.id === vid.channel_id);
                        return (
                          <div
                            key={vid.id}
                            id={`global-feed-row-${vid.id}`}
                            onClick={() => setSelectedVideoForAnalysis(vid)}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center cursor-pointer transition-colors hover:bg-white/5 font-sans"
                          >
                            {/* Video card visual outline */}
                            <div className="col-span-1 md:col-span-6 flex gap-4 pr-4">
                              <img
                                src={vid.thumbnail_url}
                                alt={vid.title}
                                referrerPolicy="no-referrer"
                                className="w-24 aspect-video object-cover rounded border border-white/5 shrink-0"
                              />
                              <div className="min-w-0 flex flex-col justify-center">
                                <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed hover:text-red-400 transition-colors">{vid.title}</h4>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 md:hidden font-mono">
                                  <span>{originalChannel ? originalChannel.name : 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{vid.duration}</span>
                                </div>
                              </div>
                            </div>

                            {/* Channel metadata column */}
                            <div className="col-span-1 md:col-span-2 hidden md:flex items-center gap-2">
                              {originalChannel && (
                                <>
                                  <img
                                    src={originalChannel.thumbnail}
                                    alt={originalChannel.name}
                                    referrerPolicy="no-referrer"
                                    className="w-5 h-5 rounded-full object-cover border border-white/10"
                                  />
                                  <span className="text-xs text-gray-400 font-medium truncate">{originalChannel.name}</span>
                                </>
                              )}
                            </div>

                            {/* Absolute viewcount metrics columns */}
                            <div className="col-span-1 md:col-span-2 hidden md:block text-right text-xs font-semibold text-gray-300 font-mono">
                              {formatViews(vid.view_count)} views
                            </div>

                            {/* Score indicator columns */}
                            <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center gap-2.5">
                              <span className="text-[10px] uppercase font-mono font-bold text-gray-500 md:hidden">Viralidade:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white font-mono">{vid.viral_score}%</span>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${getViralBadgeColor(vid.viral_score)}`}>
                                  {getViralLabel(vid.viral_score)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Side overlay Drawer component for Video psychological critique */}
      <VideoAnalysisModal
        video={selectedVideoForAnalysis}
        onClose={() => setSelectedVideoForAnalysis(null)}
      />

    </div>
  );
}
