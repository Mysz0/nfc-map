import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useProfile } from './useProfile';
import { useSpots } from './useSpots';
import { useAdmin } from './useAdmin';

export function useGameLogic(user, showToast) {
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      // 1. Fetch profiles for base stats (Username/XP)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, total_points')
        .order('total_points', { ascending: false })
        .limit(50);
      
      if (profileError) throw profileError;

      // 2. Fetch all claims to calculate "Nodes Secured" count
      const { data: allClaims, error: claimsError } = await supabase
        .from('user_spots')
        .select('user_id');

      if (claimsError) throw claimsError;

      // 3. Fetch all streaks from your new table
      const { data: allStreaks, error: streaksError } = await supabase
        .from('user_streaks')
        .select('user_id, streak_count');

      if (streaksError) throw streaksError;

      if (profiles) {
        const mappedLeaderboard = profiles.map(p => {
          // Count how many times this user appears in user_spots
          const nodesFound = allClaims.filter(c => c.user_id === p.id).length;
          
          // Find the streak for this user
          const userStreak = allStreaks.find(s => s.user_id === p.id)?.streak_count || 0;

          return { 
            username: p.username || 'Anonymous', 
            score: p.total_points || 0, 
            found: nodesFound, // FIXED: Now shows real count (e.g., 5)
            streak: userStreak  // FIXED: Now shows real streak in leaderboard
          };
        });

        setLeaderboard(mappedLeaderboard);
      }
    } catch (err) { 
      console.error("Leaderboard fetch error:", err.message); 
    }
  };

  // 1. Initialize Profile Logic
  const profile = useProfile(user, showToast, fetchLeaderboard);

  // 2. Initialize Spot Logic 
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
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  return {
    ...profile,
    ...spots,
    ...admin,
    leaderboard,
    fetchLeaderboard
  };
}
