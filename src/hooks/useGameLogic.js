import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useGameLogic(user, showToast) {
  const [spots, setSpots] = useState({});
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [visitData, setVisitData] = useState({ last_visit: null, streak: 0 });
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [lastChange, setLastChange] = useState(null);
  const [customRadius, setCustomRadius] = useState(50); // Fixed default to 50m
  const [leaderboard, setLeaderboard] = useState([]);

  // --- LEADERBOARD LOGIC ---
  // Moved up so it can be called immediately
  const fetchLeaderboard = async (currentSpots) => {
    // Select more fields to ensure we have data to rank
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('username, unlocked_spots, visit_data');
    
    if (profiles) {
      const ranked = profiles.map(p => {
        const streak = p.visit_data?.streak || 0;
        const multiplier = streak > 1 ? 1.1 : 1.0;
        const score = (p.unlocked_spots || []).reduce((sum, id) => {
          const basePoints = currentSpots[id]?.points || 0;
          return sum + Math.round(basePoints * multiplier);
        }, 0);
        return { 
          username: p.username || 'Anonymous', 
          score, 
          found: (p.unlocked_spots || []).length, 
          streak 
        };
      }).sort((a, b) => b.score - a.score);
      setLeaderboard(ranked);
    }
  };

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. Fetch All Spots first (needed for score calculations)
      const { data: dbSpots } = await supabase.from('spots').select('*');
      const spotsObj = dbSpots ? dbSpots.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}) : {};
      setSpots(spotsObj);

      // 2. Fetch or CREATE User Profile (Fixed for new Google/GitHub users)
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If user is new (e.g. Google login), create their profile row automatically
      if (!profile && !error) {
        const newProfile = {
          id: user.id,
          username: user.user_metadata?.full_name || 'Hunter',
          unlocked_spots: [],
          custom_radius: 50
        };
        const { data: created } = await supabase.from('profiles').insert([newProfile]).select().single();
        profile = created;
      }

      if (profile) {
        setUnlockedSpots(profile.unlocked_spots || []);
        setUsername(profile.username || '');
        setTempUsername(profile.username || '');
        setShowEmail(profile.show_email ?? false);
        setLastChange(profile.last_username_change);
        setVisitData(profile.visit_data || { last_visit: null, streak: 0 });
        setCustomRadius(profile.custom_radius || 50);
      }
      
      // 3. Always fetch leaderboard even if profile is fresh
      fetchLeaderboard(spotsObj);
    };
    
    fetchData();
  }, [user]);

  // --- GAMEPLAY ACTIONS ---
  const claimSpot = async (spotId) => {
    if (unlockedSpots.includes(spotId)) return showToast("Already logged", "error");
    
    const today = new Date(); today.setHours(0,0,0,0);
    const lastVisit = visitData.last_visit ? new Date(visitData.last_visit) : null;
    if (lastVisit) lastVisit.setHours(0,0,0,0);
    
    let newStreak = 1;
    if (lastVisit) {
      const diffDays = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) newStreak = visitData.streak;
      else if (diffDays === 1) newStreak = visitData.streak + 1;
    }

    const newUnlocked = [...unlockedSpots, spotId];
    const newVisitData = { last_visit: new Date().toISOString(), streak: newStreak };

    const { error } = await supabase.from('profiles').update({ 
      unlocked_spots: newUnlocked, 
      visit_data: newVisitData 
    }).eq('id', user.id);

    if (!error) {
      setUnlockedSpots(newUnlocked);
      setVisitData(newVisitData);
      fetchLeaderboard(spots); // Refresh leaderboard after scoring
      showToast(newStreak > 1 ? `Streak Bonus: ${newStreak} Days!` : "Spot Logged!");
    }
  };

  // --- PROFILE ACTIONS ---
  const saveUsername = async () => {
    const cleaned = tempUsername.replace('@', '').trim();
    if (cleaned.length < 3) return showToast("Name too short", "error");

    const { error } = await supabase.from('profiles')
      .update({ username: cleaned, last_username_change: new Date().toISOString() })
      .eq('id', user.id);
    
    if (!error) { 
      setUsername(cleaned); 
      setLastChange(new Date().toISOString()); 
      showToast("Identity updated!"); 
      fetchLeaderboard(spots); 
    }
  };

  const toggleEmailVisibility = async () => {
    const newValue = !showEmail;
    const { error } = await supabase.from('profiles').update({ show_email: newValue }).eq('id', user.id);
    if (!error) setShowEmail(newValue);
  };

  // --- ADMIN ACTIONS ---
  const removeSpot = async (id) => {
    const newUnlocked = unlockedSpots.filter(x => x !== id);
    await supabase.from('profiles').update({ unlocked_spots: newUnlocked }).eq('id', user.id);
    setUnlockedSpots(newUnlocked); 
    fetchLeaderboard(spots);
  };

  const updateRadius = async (v) => { 
    await supabase.from('profiles').update({ custom_radius: v }).eq('id', user.id); 
    setCustomRadius(v); 
  };

  const resetTimer = async () => { 
    const { error } = await supabase.from('profiles')
      .update({ last_username_change: null })
      .eq('id', user.id);  
  
    if (!error) {
      setLastChange(null);
      showToast("Cooldown Reset!", "success");
    }
  };

  const addNewSpot = async (s) => { 
    const id = s.name.toLowerCase().replace(/\s+/g, '-'); 
    const { error } = await supabase.from('spots').insert([{ id, ...s }]); 
  
    if (!error) {
      setSpots(prev => ({ ...prev, [id]: { id, ...s } })); 
      showToast(`${s.name} added!`);
    }
  };

  const deleteSpotFromDB = async (id) => { 
    await supabase.from('spots').delete().eq('id', id); 
    const n = {...spots}; 
    delete n[id]; 
    setSpots(n); 
  };

  return { 
    spots, unlockedSpots, visitData, 
    username, tempUsername, setTempUsername, 
    showEmail, lastChange, customRadius, leaderboard, 
    claimSpot, saveUsername, toggleEmailVisibility, 
    removeSpot, updateRadius, resetTimer, addNewSpot, deleteSpotFromDB,
    fetchLeaderboard 
  };
}
