import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useProfile } from './useProfile';
import { useSpots } from './useSpots';
import { useAdmin } from './useAdmin';

export function useGameLogic(user, showToast) {
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, total_points, unlocked_spots, visit_data')
        .order('total_points', { ascending: false })
        .limit(50);
      
      if (profiles) {
        setLeaderboard(profiles.map(p => ({ 
          username: p.username || 'Anonymous', 
          score: p.total_points || 0, 
          found: (p.unlocked_spots || []).length, 
          streak: p.visit_data?.streak || 0 
        })));
      }
    } catch (err) { console.error(err); }
  };

  // 1. Initialize Profile Logic
  const profile = useProfile(user, showToast, fetchLeaderboard);

  // 2. Initialize Spot Logic (needs totalPoints state from profile)
  const spots = useSpots(
    user, 
    showToast, 
    profile.totalPoints, 
    profile.setTotalPoints, 
    fetchLeaderboard
  );

  // 3. Initialize Admin Logic
  const admin = useAdmin(
    user,
    profile.userRole,
    showToast,
    spots.setSpots,
    spots.setSpotStreaks,
    profile.totalPoints,
    profile.setTotalPoints,
    spots.getMultiplier,
    fetchLeaderboard
  );

  useEffect(() => {
    if (user) fetchLeaderboard();
  }, [user]);

  return {
    ...profile,
    ...spots,
    ...admin,
    leaderboard,
    fetchLeaderboard
  };
}
