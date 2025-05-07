// src/hooks/useDashboardStats.js
import { useState, useEffect } from 'react';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newMembers: 0,
    totalRevenue: 0,
    membershipGrowth: 0,
    activeMembershipGrowth: 0,
    newMembershipGrowth: 0,
    revenueGrowth: 0
  });

  const [membershipStats, setMembershipStats] = useState({
    activePercentage: 0,
    platinum: { count: 0, percentage: 0 },
    gold: { count: 0, percentage: 0 },
    silver: { count: 0, percentage: 0 },
    bronze: { count: 0, percentage: 0 }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      // Simulated API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data - replace with actual API response
      setStats({
        totalMembers: 1250,
        activeMembers: 980,
        newMembers: 45,
        totalRevenue: 125000,
        membershipGrowth: 12,
        activeMembershipGrowth: 8,
        newMembershipGrowth: 15,
        revenueGrowth: 10
      });

      setMembershipStats({
        activePercentage: 78,
        platinum: { count: 50, percentage: 4 },
        gold: { count: 200, percentage: 16 },
        silver: { count: 450, percentage: 36 },
        bronze: { count: 550, percentage: 44 }
      });

      setIsLoading(false);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up real-time updates - replace with actual WebSocket connection
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    membershipStats,
    isLoading,
    error,
    refetch: fetchStats
  };
};