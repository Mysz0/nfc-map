import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

export function useStore(user, totalPoints, setTotalPoints, showToast) {
  const [shopItems, setShopItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const isActivating = useRef(false);

  const getItemStatus = useCallback((item) => {
    if (!item.is_active || !item.activated_at || !item.shop_items?.duration_hours) {
      return { timeLeft: null, progress: 100 };
    }
    
    const durationMs = item.shop_items.duration_hours * 60 * 60 * 1000;
    const startTime = new Date(item.activated_at).getTime();
    const expiryTime = startTime + durationMs;
    const now = new Date().getTime();
    const diff = expiryTime - now;

    if (diff <= 0) return { timeLeft: "EXPIRED", progress: 0 };

    const progress = Math.max(0, Math.min(100, (diff / durationMs) * 100));
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return { timeLeft: `${h}h ${m}m ${s}s`, progress };
  }, []);

  const deactivateExpiredItem = async (inventoryId) => {
    try {
      await supabase
        .from('user_inventory')
        .update({ is_active: false, activated_at: null })
        .eq('id', inventoryId);
      
      setInventory(prev => prev.map(i => 
        i.id === inventoryId 
          ? { ...i, is_active: false, activated_at: null, timeLeft: null }
          : i
      ));
    } catch (err) {
      console.error("Auto-deactivate failed:", err);
    }
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: items } = await supabase.from('shop_items').select('*');
      const { data: inv } = await supabase
        .from('user_inventory')
        .select('*, shop_items(*)')
        .eq('user_id', user.id);
      
      const processedInv = (inv || []).map(item => {
        const status = getItemStatus(item);
        if (status.timeLeft === "EXPIRED") {
          deactivateExpiredItem(item.id);
          return { ...item, is_active: false, timeLeft: null };
        }
        return { ...item, ...status };
      });

      setShopItems(items || []);
      setInventory(processedInv);
    } catch (err) {
      console.error("Store fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, getItemStatus]);

  useEffect(() => {
    const timer = setInterval(() => {
      setInventory(prevInv => 
        prevInv.map(item => {
          if (item.is_active) {
            const status = getItemStatus(item);
            if (status.timeLeft === "EXPIRED") {
              deactivateExpiredItem(item.id);
              return { ...item, is_active: false };
            }
            return { ...item, ...status };
          }
          return item;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [getItemStatus]);

  const buyItem = async (item) => {
    if (totalPoints < item.price || loading) return;
    setLoading(true);
    try {
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ total_points: totalPoints - item.price })
        .eq('id', user.id);

      if (pointsError) throw pointsError;

      const existing = inventory.find(i => i.item_id === item.id);
      if (existing) {
        await supabase.from('user_inventory').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('user_inventory').insert({ user_id: user.id, item_id: item.id, quantity: 1, is_active: false });
      }
      
      setTotalPoints(prev => prev - item.price);
      showToast(`Purchased ${item.name}!`, "success");
      await fetchData();
    } catch (err) {
      showToast("Purchase failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const activateItem = async (inventoryId) => {
    if (!user || loading || isActivating.current) return;
    
    const item = inventory.find(inv => inv.id === inventoryId);
    if (!item || item.quantity < 1) return;

    isActivating.current = true;
    setLoading(true);

    try {
      const durationHours = item.shop_items?.duration_hours || 1;
      const boostDurationMs = durationHours * 60 * 60 * 1000;
      const now = new Date().getTime();
      
      let newActivationTime;

      if (item.is_active && item.activated_at) {
        // EXTENSION LOGIC
        const currentStartTime = new Date(item.activated_at).getTime();
        const currentExpiry = currentStartTime + boostDurationMs;
        const remainingTime = Math.max(0, currentExpiry - now);

        // We push the "start time" forward by the remaining time
        newActivationTime = new Date(now + remainingTime);
      } else {
        newActivationTime = new Date();
      }

      const { error } = await supabase
        .from('user_inventory')
        .update({
          quantity: item.quantity - 1,
          is_active: true,
          activated_at: newActivationTime.toISOString()
        })
        .eq('id', inventoryId);

      if (error) throw error;
      showToast(`${item.shop_items.name} ${item.is_active ? 'extended' : 'activated'}!`, "success");
      await fetchData();
    } catch (err) {
      console.error("Activation error:", err);
      showToast("Activation failed", "error");
    } finally {
      isActivating.current = false;
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return { shopItems, inventory, buyItem, activateItem, loading };
}
