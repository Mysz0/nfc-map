import { useState } from 'react'; 
import { supabase } from '../supabase';

export function useAdmin(user, userRole, showToast, setSpots, setSpotStreaks, totalPoints, setTotalPoints, getMultiplier, fetchLeaderboard) {
  const isAdmin = userRole === 'admin';
  
  const radiusOptions = [
    { label: '250m', val: 250 },
    { label: '500m', val: 500 },
    { label: '1km', val: 1000 },
    { label: '5km', val: 5000 },
  ];

  const resetTimer = async () => {
    showToast("Cooldowns Reset");
  };

  const addNewSpot = async (s) => {
    if (!isAdmin) return;
    const id = s.name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('spots').insert([{ id, ...s }]);
    
    if (!error) {
      setSpots(prev => ({ ...prev, [id]: { id, ...s } }));
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
    radiusOptions,
    resetTimer,
    addNewSpot,
    deleteSpotFromDB,
    updateNodeStreak
  };
}
