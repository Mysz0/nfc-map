import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useProfile(user, showToast, fetchLeaderboard) {
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [userRole, setUserRole] = useState('player');
  const [totalPoints, setTotalPoints] = useState(0);
  const [showEmail, setShowEmail] = useState(false);
  const [lastChange, setLastChange] = useState(null);
  const [customRadius, setCustomRadius] = useState(250);
  const [visitData, setVisitData] = useState({ last_visit: null, streak: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          setUsername(profile.username || '');
          setTempUsername(profile.username || '');
          setUserRole(profile.role || 'player');
          setTotalPoints(profile.total_points || 0);
          setShowEmail(profile.show_email ?? false);
          setLastChange(profile.last_username_change);
          setCustomRadius(profile.custom_radius || 250);

          // --- DAILY VISIT STREAK LOGIC ---
          const now = new Date();
          const todayStr = now.toDateString();
          const dbVisitData = profile.visit_data || { last_visit: null, streak: 0 };
          let newStreak = dbVisitData.streak || 0;
          const lastVisitDate = dbVisitData.last_visit ? new Date(dbVisitData.last_visit) : null;

          if (!lastVisitDate) {
            newStreak = 1;
          } else if (lastVisitDate.toDateString() !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            newStreak = (lastVisitDate.toDateString() === yesterday.toDateString()) ? newStreak + 1 : 1;
          }

          if (!lastVisitDate || lastVisitDate.toDateString() !== todayStr) {
            const updatedVisit = { last_visit: now.toISOString(), streak: newStreak };
            setVisitData(updatedVisit);
            await supabase.from('profiles').update({ visit_data: updatedVisit }).eq('id', user.id);
            showToast(`${newStreak} Day Streak Active!`);
          } else {
            setVisitData(dbVisitData);
          }
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    };

    fetchProfile();
  }, [user]);

  const saveUsername = async () => {
    const cleaned = tempUsername.trim();
    if (cleaned.length < 3) return showToast("Identity too short", "error");
    if (cleaned === username) return;

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

  const updateRadius = async (v) => {
    const { error } = await supabase
      .from('profiles')
      .update({ custom_radius: v })
      .eq('id', user.id);
    if (!error) {
      setCustomRadius(v);
      showToast(`Radius: ${v}m`);
    }
  };

  const toggleEmailVisibility = async () => {
    const newVal = !showEmail;
    const { error } = await supabase
      .from('profiles')
      .update({ show_email: newVal })
      .eq('id', user.id);
    if (!error) {
      setShowEmail(newVal);
      showToast(newVal ? "Email Visible" : "Email Hidden");
    }
  };

  const resetTimer = async () => {
    if (!user) return;
    await supabase.from('profiles').update({ last_username_change: null }).eq('id', user.id);
    setLastChange(null);
    showToast("Cooldown Bypassed");
  };

  return {
    username,
    tempUsername,
    setTempUsername,
    userRole,
    totalPoints,
    setTotalPoints, // Exported so useSpots can update it
    showEmail,
    lastChange,
    customRadius,
    visitData,
    saveUsername,
    updateRadius,
    toggleEmailVisibility,
    resetTimer
  };
}
