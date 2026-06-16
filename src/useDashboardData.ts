import { useCallback, useEffect, useState } from 'react';
import { fetchJson, getErrorMessage } from './api';
import { sortVideosByViralScore } from './dashboard-utils';
import type { Channel, DashboardStats, Video } from './types';

const initialStats: DashboardStats = {
  totalChannels: 0,
  totalVideos: 0,
  avgViralScore: 100,
  viralVideosCount: 0,
  totalIdeas: 0,
  totalScripts: 0,
};

export function useDashboardData(selectedChannelId: string | null) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [globalVideosFeed, setGlobalVideosFeed] = useState<Video[]>([]);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsRefreshingStats(true);
    setDashboardError(null);

    try {
      const [channelsData, statsData] = await Promise.all([
        fetchJson<Channel[]>('/api/channels'),
        fetchJson<DashboardStats>('/api/stats'),
      ]);

      setChannels(channelsData);
      setStats(statsData);
    } catch (error) {
      setDashboardError(getErrorMessage(error, 'Falha ao carregar métricas do dashboard.'));
    } finally {
      setIsRefreshingStats(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!selectedChannelId) {
      setVideos([]);
      return;
    }

    let cancelled = false;

    const loadVideos = async () => {
      try {
        const channelVideos = await fetchJson<Video[]>(`/api/channels/${selectedChannelId}/videos`);

        if (!cancelled) {
          setVideos(channelVideos);
        }
      } catch (error) {
        if (!cancelled) {
          setVideos([]);
          setDashboardError(getErrorMessage(error, 'Falha ao carregar os vídeos do canal.'));
        }
      }
    };

    void loadVideos();

    return () => {
      cancelled = true;
    };
  }, [selectedChannelId]);

  useEffect(() => {
    if (channels.length === 0) {
      setGlobalVideosFeed([]);
      return;
    }

    let cancelled = false;

    const loadGlobalFeed = async () => {
      const results = await Promise.all(
        channels.map(async (channel) => {
          try {
            return await fetchJson<Video[]>(`/api/channels/${channel.id}/videos`);
          } catch {
            return [];
          }
        })
      );

      if (!cancelled) {
        setGlobalVideosFeed(sortVideosByViralScore(results.flat()).slice(0, 15));
      }
    };

    void loadGlobalFeed();

    return () => {
      cancelled = true;
    };
  }, [channels]);

  const handleAddChannel = useCallback(
    async (handle: string) => {
      await fetchJson<{ success: boolean; channel: Channel }>('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });

      await loadDashboardData();
    },
    [loadDashboardData]
  );

  const handleRefreshChannel = useCallback(
    async (id: string) => {
      await fetchJson<{ success: boolean }>(`/api/channels/${id}/refresh`, {
        method: 'POST',
      });

      if (selectedChannelId === id) {
        const refreshedVideos = await fetchJson<Video[]>(`/api/channels/${id}/videos`);
        setVideos(refreshedVideos);
      }

      await loadDashboardData();
    },
    [loadDashboardData, selectedChannelId]
  );

  const handleDeleteChannel = useCallback(
    async (id: string) => {
      await fetchJson<{ success: boolean }>(`/api/channels/${id}`, {
        method: 'DELETE',
      });

      await loadDashboardData();
    },
    [loadDashboardData]
  );

  return {
    channels,
    videos,
    globalVideosFeed,
    stats,
    isRefreshingStats,
    dashboardError,
    loadDashboardData,
    handleAddChannel,
    handleRefreshChannel,
    handleDeleteChannel,
  };
}