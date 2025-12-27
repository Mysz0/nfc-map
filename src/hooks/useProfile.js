import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export function useProfile(user, showToast, fetchLeaderboard) {
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [userRole, setUserRole] = useState('player');
  const [totalPoints, setTotalPoints] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
  const [lastChange, setLastChange] = useState(null);
  const [customRadius, setCustomRadius] = useState(250);
  const [claimRadius, setClaimRadius] = useState(20);
  const [visitData, setVisitData] = useState({ last_visit: null, streak: 0 });

  // 1. DATA SYNC ONLY (Does not touch the typing box)
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      let { data: profile } = await supabase
        .from('profiles')
        .select('username, role, total_points, show_email, last_username_change, custom_radius, claim_radius, streak_count, last_visit')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUsername(profile.username || '');
        setUserRole(profile.role || 'player');
        setTotalPoints(profile.total_points || 0);
        setShowEmail(profile.show_email ?? false);
        setLastChange(profile.last_username_change);
        setCustomRadius(profile.custom_radius || 250);
        setClaimRadius(profile.claim_radius || 20);

        // Streak logic... (omitted for brevity, keep your existing streak code here)
      }
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    }
  }, [user]); // Only depend on user ID

  // 2. INITIAL LOAD ONLY (Runs once to fill the box)
  useEffect(() => {
    if (user) {
      fetchProfile().then(() => {
        // We only set the input box ONCE when the app starts
        supabase.from('profiles').select('username').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) setTempUsername(data.username || '');
          });
      });
    }
  }, [user]); // Strictly only runs when the user logs in

  const saveUsername = async () => {
    const cleaned = tempUsername.trim();
    if (cleaned.length < 3) return showToast("Identity too short", "error");
    if (cleaned === username) return showToast("This is already your current identity!", "error");

    const { data: reserved } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', cleaned)
      .not('id', 'eq', user.id)
      .maybeSingle();

    if (reserved) return showToast("Identity already reserved", "error");

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('profiles')
      .update({ username: cleaned, last_username_change: now })
      .eq('id', user.id);

    if (!error) {
      setUsername(cleaned);
      setLastChange(now);
      showToast("Identity Synchronized");
      if (fetchLeaderboard) fetchLeaderboard();
    }
  };

  // ... (resetTimer, updateRadius, etc. stay the same)

  const resetTimer = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ last_username_change: null }).eq('id', user.id);
    setLastChange(null);
    showToast("Cooldown Bypassed");
    fetchProfile(); // Refresh points/role but don't touch tempUsername
  };

  return {
    username, tempUsername, setTempUsername,
    userRole, totalPoints, setTotalPoints,
    showEmail, lastChange, customRadius, claimRadius, visitData,
    saveUsername, updateRadius, updateClaimRadius, toggleEmailVisibility, resetTimer,
    fetchProfile
  };
}
