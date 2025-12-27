import { useState } from 'react'; 
import { supabase } from '../supabase';

// Added fetchProfile to the arguments list
export function useAdmin(user, userRole, showToast, setSpots, setSpotStreaks, totalPoints, setTotalPoints, getMultiplier, fetchLeaderboard, fetchProfile) {
  const isAdmin = userRole === 'admin';
  
  const detectionOptions = [
    { label: '250m', val: 250 },
    { label: '500m', val: 500 },
    { label: '1km', val: 1000 },
    { label: '5km', val: 5000 },
  ];

  const claimOptions = [
    { label: '10m', val: 10 },
    { label: '20m', val: 20 },
    { label: '50m', val: 50 },
    { label: '100m', val: 100 },
    { label: '500m', val: 500 },
  ];

  const resetTimer = async () => {
    if (!user || !isAdmin) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_username_change: null })
        .eq('id', user.id);

      if (error) throw error;
      
      showToast("Username Cooldown Reset!", "success");
      
      // FIX: Manually trigger a data refresh so ProfileTab updates without a reload
      if (fetchProfile) {
        await fetchProfile();
      }
    } catch (err) {
      console.error("Reset Timer Error:", err);
      showToast("Failed to reset cooldown", "error");
    }
  };

  const addNewSpot = async (s) => {
    if (!isAdmin) return;
    // Ensure we use the random ID if provided, or fallback
    const id = s.id || s.name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('spots').insert([{ ...s, id }]);
    
    if (!error) {
      setSpots(prev => ({ ...prev, [id]: { ...s, id } }));
      showToast("Deployed!");
    } else {
      showToast("Deployment Failed", "error");
    }
  };

  const deleteSpotFromDB = async (id) => {
    if (!isAdmin) return;
    const { error } = await supabase.rpc('force_delete_spot', { target_id: id });
    
    if (!error) {
      setSpots(prev => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
      showToast("Global Purge Success");
    } else {
      showToast("Purge Failed", "error");
    }
  };

  const updateNodeStreak = async (spotId, newStreakValue) => {
    if (!user || !isAdmin) return;
    const finalVal = Math.max(0, parseInt(newStreakValue, 10) || 0);
    const { error } = await supabase.from('user_spots').upsert({
      user_id: user.id,
      spot_id: spotId,
      streak: finalVal
    }, { onConflict: 'user_id, spot_id' });

    if (!error) {
      setSpotStreaks(prev => ({ 
        ...prev, 
        [spotId]: { ...prev[spotId], streak: finalVal } 
      }));
      showToast(`Streak Set`);
      if (fetchLeaderboard) fetchLeaderboard();
    }
  };

  return {
    detectionOptions,
    claimOptions,
    resetTimer,
    addNewSpot,
    deleteSpotFromDB,
    updateNodeStreak
  };
}
