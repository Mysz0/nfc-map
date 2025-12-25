import { supabase } from '../supabase';

export function useAdmin(user, userRole, showToast, setSpots, setSpotStreaks, totalPoints, setTotalPoints, getMultiplier, fetchLeaderboard) {
  
  const isAdmin = userRole === 'admin';

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

  const updateNodeStreak = async (spotId, newStreakValue, spots) => {
    if (!user || !isAdmin) return;
    
    const finalVal = Math.max(0, parseInt(newStreakValue, 10) || 0);
    const multiplier = getMultiplier(finalVal);
    
    // We need to calculate if we are adding points based on the old streak vs new
    // This is a manual override, so logic can vary, but here is your current implementation:
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
      
      showToast(`Streak Set: ${multiplier}x applied`);
      if (fetchLeaderboard) fetchLeaderboard();
    }
  };

  return {
    addNewSpot,
    deleteSpotFromDB,
    updateNodeStreak
  };
}
