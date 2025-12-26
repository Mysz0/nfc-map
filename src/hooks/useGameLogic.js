import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useProfile } from './useProfile';
import { useSpots } from './useSpots';
import { useAdmin } from './useAdmin';
import { useVotes } from './useVotes'; // New import

export function useGameLogic(user, showToast) {
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, total_points, streak_count')
        .order('total_points', { ascending: false })
        .limit(50);
      
      if (profileError) throw profileError;

      const { data: allClaims, error: claimsError } = await supabase
        .from('user_spots')
        .select('user_id');

      if (claimsError) throw claimsError;

      if (profiles) {
        const mappedLeaderboard = profiles.map(p => ({
          username: p.username || 'Anonymous',
          score: p.total_points || 0,
          found: allClaims ? allClaims.filter(c => c.user_id === p.id).length : 0,
          streak: p.streak_count || 0 
        }));

        setLeaderboard(mappedLeaderboard);
      }
    } catch (err) { 
      console.error("Leaderboard fetch error:", err.message); 
    }
  };

  const profile = useProfile(user, showToast, fetchLeaderboard);
  const spots = useSpots(user, showToast, profile.totalPoints, profile.setTotalPoints, fetchLeaderboard);

  // Initialize the new voting hook, passing setSpots so it can update the UI instantly
  const { handleVote } = useVotes(user, spots.setSpots);

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
    handleVote, // Export handleVote to App.jsx
    leaderboard, 
    fetchLeaderboard 
  };
}
