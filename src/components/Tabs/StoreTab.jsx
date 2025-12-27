import React, { useState } from 'react';
import { ShoppingCart, Package, Sparkles, Coins, Zap, Maximize, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function StoreTab({ totalPoints, colors, shopItems = [], inventory = [], onBuy, onActivate }) {
  const [view, setView] = useState('shop');
  const [confirmItem, setConfirmItem] = useState(null);

  const iconMap = {
    Zap: <Zap size={24} className="text-yellow-400" />,
    Maximize: <Maximize size={24} className="text-blue-400" />
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      
      {/* Confirmation Modal - Made theme-responsive */}
      {confirmItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-[var(--theme-bg-glass-light)] dark:bg-zinc-900 border border-[var(--theme-border-light)] dark:border-white/10 p-8 rounded-[2.5rem] w-full max-w-xs text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
            <h3 className="text-xl font-black text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)] mb-2">Confirm?</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-6 uppercase tracking-widest font-bold">
              Spend {confirmItem.price} XP for {confirmItem.name}?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmItem(null)} 
                className="flex-1 py-3 rounded-2xl bg-zinc-200 dark:bg-white/5 text-[var(--theme-text-title-light)] dark:text-white font-bold text-[10px] uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onBuy(confirmItem); setConfirmItem(null); }} 
                className="flex-1 py-3 rounded-2xl bg-[rgb(var(--theme-primary))] dark:bg-white text-zinc-950 font-black text-[10px] uppercase tracking-widest"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Card - Replaced colors.card with node-card-animate */}
      <div className="node-card-animate smart-glass p-6 rounded-[2.5rem] overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1 text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)]">Available Balance</p>
          <div className="flex items-center gap-2">
            <Coins className="text-yellow-500" size={20} />
            <h3 className="text-3xl font-black tracking-tighter text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)]">
              {totalPoints?.toLocaleString() || 0}
            </h3>
            <span className="text-xs font-bold opacity-40 mt-2 text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)]">XP</span>
          </div>
        </div>
        <Sparkles className="absolute -right-4 -top-4 opacity-10 text-[rgb(var(--theme-primary))]" size={120} />
      </div>

      {/* Switcher - Updated for themes */}
      <div className="flex p-1.5 bg-[var(--theme-bg-glass-light)] dark:bg-white/5 rounded-[2rem] border border-[var(--theme-border-light)] dark:border-white/5 mx-4">
        <button onClick={() => setView('shop')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.6rem] transition-all ${view === 'shop' ? 'bg-[rgb(var(--theme-primary))] text-zinc-950 shadow-lg' : 'text-zinc-500'}`}>
          <ShoppingCart size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Market</span>
        </button>
        <button onClick={() => setView('inventory')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[1.6rem] transition-all ${view === 'inventory' ? 'bg-[rgb(var(--theme-primary))] text-zinc-950 shadow-lg' : 'text-zinc-500'}`}>
          <Package size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Inventory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
        {view === 'shop' ? (
          shopItems.map((item) => (
            <div key={item.id} className="node-card-animate smart-glass p-5 rounded-[2rem] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--theme-primary))]/5 flex items-center justify-center">
                  {iconMap[item.icon_name] || <Sparkles />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)]">{item.name}</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 max-w-[150px] leading-tight">{item.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setConfirmItem(item)}
                disabled={totalPoints < item.price}
                className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all ${
                  totalPoints >= item.price 
                  ? 'bg-[rgb(var(--theme-primary))] dark:bg-white text-zinc-950 active:scale-95 shadow-xl' 
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {item.price} XP
              </button>
            </div>
          ))
        ) : (
          inventory.length > 0 ? (
            inventory.map((inv) => (
              <div key={inv.id} className="node-card-animate smart-glass p-5 rounded-[2rem] flex items-center gap-4 relative overflow-hidden group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center z-10 relative ${inv.is_active ? 'bg-[rgb(var(--theme-primary))]/20 shadow-[0_0_15px_rgba(var(--theme-primary),0.3)]' : 'bg-[rgb(var(--theme-primary))]/5'}`}>
                  {inv.is_active ? <CheckCircle2 size={20} className="text-[rgb(var(--theme-primary))]" /> : (iconMap[inv.shop_items?.icon_name] || <Package size={20} />)}
                  
                  {inv.quantity > 0 && (
                    <div className="absolute -top-1 -right-1 bg-[rgb(var(--theme-primary))] dark:bg-white text-zinc-950 text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--theme-bg-glass-light)] dark:border-zinc-900 shadow-lg">
                      x{inv.quantity}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 z-10">
                  <h4 className="font-bold text-sm text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)]">{inv.shop_items?.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${inv.is_active ? 'text-[rgb(var(--theme-primary))]' : 'text-zinc-500'}`}>
                      {inv.is_active ? 'Active' : 'In Stock'}
                    </p>
                    {inv.is_active && inv.timeLeft && (
                      <div className="flex items-center gap-1 bg-black/10 dark:bg-black/20 px-2 py-0.5 rounded-full border border-black/5 dark:border-white/5">
                        <Clock size={8} className="text-[rgb(var(--theme-primary))]" />
                        <span className="text-[9px] font-mono font-bold text-[var(--theme-text-title-light)] dark:text-white/90">{inv.timeLeft}</span>
                      </div>
                    )}
                  </div>
                </div>

                {inv.quantity > 0 && (
                  <button 
                    onClick={() => onActivate(inv.id)}
                    className="z-10 text-[9px] font-black bg-[rgb(var(--theme-primary))] text-zinc-950 px-4 py-2 rounded-xl transition-colors active:scale-95 uppercase tracking-widest"
                  >
                    {inv.is_active ? 'Extend' : 'Activate'}
                  </button>
                )}

                {inv.is_active && inv.progress !== undefined && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-[rgb(var(--theme-primary))] transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(var(--theme-primary),0.5)]"
                      style={{ width: `${inv.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 opacity-30 text-[var(--theme-text-title-light)] dark:text-[var(--theme-text-title-dark)]">
              <Package size={40} className="mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">your inventory is empty</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
