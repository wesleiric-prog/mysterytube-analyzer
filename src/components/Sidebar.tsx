import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Trash2, 
  RefreshCw, 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Tv, 
  Github, 
  AlertTriangle,
  Flame,
  HelpCircle
} from 'lucide-react';
import { Channel } from '../types';

interface SidebarProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (id: string | null) => void;
  onAddChannel: (handle: string) => Promise<void>;
  onRefreshChannel: (id: string) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
  currentView: 'dashboard' | 'scriptwriter';
  onChangeView: (view: 'dashboard' | 'scriptwriter') => void;
}

export default function Sidebar({
  channels,
  selectedChannelId,
  onSelectChannel,
  onAddChannel,
  onRefreshChannel,
  onDeleteChannel,
  currentView,
  onChangeView
}: SidebarProps) {
  const [newHandle, setNewHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim()) return;

    setIsAdding(true);
    setErrorMsg(null);
    try {
      await onAddChannel(newHandle.trim());
      setNewHandle('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Canal não encontrado ou erro de conexão.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRefresh = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRefreshingId(id);
    try {
      await onRefreshChannel(id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente remover este canal e todos os seus relatórios?')) return;
    setDeletingId(id);
    try {
      await onDeleteChannel(id);
      if (selectedChannelId === id) {
        onSelectChannel(null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside id="app-sidebar" className="w-80 border-r border-red-900/20 bg-[#0a0a0c] p-4 flex flex-col h-full shrink-0 select-none">
      {/* Platform Branding */}
      <div className="flex items-center gap-3 px-2 py-4 border-b border-red-900/10">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center shadow-lg shadow-red-900/20">
          <Eye className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight uppercase text-white font-display">MysteryTube</h1>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-red-500/80 block mt-0.5">Obsidian Eye Engine</span>
        </div>
      </div>

      {/* Main navigation controls */}
      <div className="space-y-1 mt-5">
        <button
          id="btn-nav-dashboard"
          onClick={() => {
            onSelectChannel(null);
            onChangeView('dashboard');
          }}
          className={`w-full flex items-center justify-between px-3.5 py-3 border-l-2 transition-all cursor-pointer ${
            currentView === 'dashboard' && !selectedChannelId
              ? 'bg-red-900/10 border-l-red-600 text-red-100 rounded-r font-semibold'
              : 'text-gray-500 border-l-transparent hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Command Center</span>
          </div>
          <Flame className={`w-3.5 h-3.5 text-red-500 ${currentView === 'dashboard' && !selectedChannelId ? 'animate-pulse' : 'opacity-20'}`} />
        </button>

        <button
          id="btn-nav-scriptwriter"
          onClick={() => {
            onChangeView('scriptwriter');
            onSelectChannel(null);
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-3 border-l-2 transition-all cursor-pointer ${
            currentView === 'scriptwriter'
              ? 'bg-red-900/10 border-l-red-600 text-red-100 rounded-r font-semibold'
              : 'text-gray-500 border-l-transparent hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Script Engine</span>
        </button>
      </div>

      {/* Monitor new channel form */}
      <div className="mt-6">
        <h3 className="px-2 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Monitorar Novo Canal</h3>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <input
              id="input-monitor-handle"
              type="text"
              placeholder="Ex: @FilipePenoni ou link"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              disabled={isAdding}
              className="w-full bg-zinc-900/30 border border-white/5 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white placeholder-gray-500 focus:outline-[#1f2833]/40 text-[13px] transition-colors"
            />
            <button
              id="btn-monitor-submit"
              type="submit"
              disabled={isAdding || !newHandle.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white disabled:bg-gray-800 disabled:text-gray-500 transition-colors flex items-center justify-center"
            >
              {isAdding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2 rounded bg-red-500/10 border border-red-500/30 flex items-start gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-300 font-medium leading-relaxed">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Monitored Channels List */}
      <div className="mt-6 flex-1 overflow-y-auto pr-1 text-gray-400">
        <h3 className="px-2 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-500 mb-2.5">Canais em Observação</h3>
        {channels.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-white/5 bg-[#0a0a0c] p-4 text-gray-500">
            <Tv className="w-5 h-5 text-gray-700 mx-auto stroke-[1.5]" />
            <p className="text-xs text-gray-600 mt-2 font-medium">Nenhum canal ativo</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {channels.map((chan) => {
              const works = selectedChannelId === chan.id;
              return (
                <div
                  key={chan.id}
                  id={`channel-row-${chan.id}`}
                  onClick={() => {
                    onChangeView('dashboard');
                    onSelectChannel(chan.id);
                  }}
                  className={`group relative flex items-center justify-between p-2 border-l-2 rounded-r cursor-pointer transition-all ${
                    works 
                      ? 'bg-red-900/10 border-l-red-650 border-y-transparent border-r-transparent text-white' 
                      : 'border-transparent hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={chan.thumbnail}
                      alt={chan.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[#1f2833]/80 group-hover:border-red-500/30"
                    />
                    <div className="min-w-0 pr-8">
                      <p className="text-xs font-semibold truncate text-white">{chan.name}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{chan.handle}</p>
                      <p className="text-[9px] font-mono text-crimson/80 bg-red-500/10 inline-block px-1 rounded mt-1 font-medium">{chan.subscribers}</p>
                    </div>
                  </div>

                  {/* Actions overlaid to preserve spacing */}
                  <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-gradient-to-l from-black/90 via-black/90 pl-3">
                    <button
                      id={`btn-channel-refresh-${chan.id}`}
                      onClick={(e) => handleRefresh(e, chan.id)}
                      disabled={refreshingId === chan.id}
                      title="Sincronizar dados"
                      className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingId === chan.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      id={`btn-channel-delete-${chan.id}`}
                      onClick={(e) => handleDelete(e, chan.id)}
                      disabled={deletingId === chan.id}
                      title="Remover canal"
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer information */}
      <div className="mt-auto pt-4 border-t border-red-900/20 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-650 animate-pulse"></div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Crawler Active</span>
        </div>
        <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-white/5">
          <p className="text-[11px] text-gray-400 font-mono">SQLite Sync: Operational</p>
          <p className="text-[10px] text-gray-550 mt-0.5 font-mono">{channels.length} Channels Tracked</p>
        </div>
      </div>
    </aside>
  );
}
