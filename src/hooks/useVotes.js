import { supabase } from '../supabase';

export function useVotes(user, setSpots) {
  
  const handleVote = async (spotId, columnName) => {
    if (!user) return;

    // 1. OPTIMISTIC UPDATE
    // Update the local state immediately so the UI feels snappy
    setSpots(prev => {
      const targetSpot = prev[spotId];
      if (!targetSpot) return prev;

      return {
        ...prev,
        [spotId]: {
          ...targetSpot,
          [columnName]: (targetSpot[columnName] || 0) + 1
        }
      };
    });

    // 2. DATABASE UPDATE
    // Call the RPC function we created in Supabase
    const { error } = await supabase.rpc('increment_vote', {
      row_id: spotId,
      column_name: columnName
    });

    if (error) {
      console.error("Vote sync failed:", error.message);
      
      // 3. ROLLBACK ON ERROR
      // If the DB update fails, we fetch the single spot to correct the UI
      const { data: freshSpot } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .single();

      if (freshSpot) {
        setSpots(prev => ({
          ...prev,
          [spotId]: freshSpot
        }));
      }
    }
  };

  return { handleVote };
}
