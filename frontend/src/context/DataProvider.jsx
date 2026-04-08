import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { kpiService } from '../services/api';
import { useTimeRange } from './TimeRangeContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { timeRange } = useTimeRange();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aggregated, setAggregated] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [heatmaps, setHeatmaps] = useState({ revpash: [], deadslot: [] });
  const [liveData, setLiveData] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // ─── Initial Fetch & Time Range Refresh ─────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetching for performance
      const [aggRes, trendRes, dailyRes, revpashRes, deadslotRes] = await Promise.all([
        kpiService.getAggregatedData('all', timeRange),
        kpiService.getTrends(30),
        kpiService.getDailyData(90),
        kpiService.getHeatmaps('revpash'),
        kpiService.getHeatmaps('deadslot'),
      ]);

      setAggregated(aggRes.data);
      setTrends(trendRes.data);
      setDailyData(dailyRes.data);
      setHeatmaps({
        revpash: revpashRes.data,
        deadslot: deadslotRes.data,
      });
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch dashboard data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Real-time Integration (Socket.IO) ───────────────────────
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);
    const socket = io(API_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('📡 Connected to KPI WebSocket');
    });

    // Listen for live KPI updates
    socket.on('kpi:live-update', (data) => {
      setLiveData(data);
      setIsLive(data.operating);
      
      // Update the "Today" aggregated data in real-time if we're on the today view
      if (timeRange === 'today') {
        setAggregated(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            revenue: { ...prev.revenue, daily: data.totals.revenue, attainment: data.totals.attainment },
            operations: { ...prev.operations, ktt: data.current.ktt, deliveryTime: data.current.deliveryTime, seatUtilisation: data.current.seatOccupancy },
            // Add other live updates as needed
          };
        });
      }
    });

    // Listen for real-time alert triggers
    socket.on('kpi:alert-trigger', (alerts) => {
      alerts.forEach(alert => {
        toast(
          (t) => (
            <div className="flex flex-col">
              <span className="font-bold text-red-500 uppercase text-xs tracking-wider">Live {alert.severity} Alert</span>
              <span className="text-sm">{alert.message}</span>
            </div>
          ),
          { 
            duration: 6000, 
            id: `alert-${alert.id}-${Date.now()}`,
            style: { borderBottom: `2px solid ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'}` }
          }
        );
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket');
      setIsLive(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [timeRange]);

  const refreshAction = () => fetchData();

  const value = {
    loading,
    error,
    aggregated,
    dailyData,
    trends,
    heatmaps,
    liveData,
    isLive,
    refreshAction,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
