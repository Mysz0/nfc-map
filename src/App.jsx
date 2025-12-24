import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useGameLogic } from './hooks/useGameLogic';
import { useLocation } from './hooks/useLocation';

// Component Imports
import Navbar from './components/Navbar';
import HomeTab from './components/HomeTab';
import ExploreTab from './components/ExploreTab';
import LeaderboardTab from './components/LeaderboardTab';
import ProfileTab from './components/ProfileTab';
import AdminTab from './components/AdminTab';
import Toast from './components/Shared/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isNavbarShrunk, setIsNavbarShrunk] = useState(false);
  const [toast, setToast] = useState(null);

  // --- TOAST HANDLER ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- AUTH SESSION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- CUSTOM HOOKS ---
  const { 
    spots, unlockedSpots, visitData, spotStreaks,
    username, tempUsername, setTempUsername, 
    showEmail, lastChange, customRadius, leaderboard, 
    claimSpot, saveUsername, toggleEmailVisibility, 
    removeSpot, updateRadius, resetTimer, addNewSpot, deleteSpotFromDB 
  } = useGameLogic(user, showToast);

  const { userLocation, isNearSpot, activeSpotId } = useLocation(spots, customRadius);

  // --- UI CONSTANTS ---
  const isAdmin = user?.email === 'admin@yourdomain.com'; // Change to your admin email
  const isDark = true;
  const colors = {
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900/50',
    text: 'text-white',
    accent: 'text-emerald-500',
    border: 'border-white/5'
  };

  // --- SCROLL HANDLER (FOR NAVBAR SHRINK) ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setIsNavbarShrunk(true);
      else setIsNavbarShrunk(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter italic">NODE_HUNTER</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Initialization Required</p>
          </div>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full py-4 bg-white text-black font-black rounded-3xl hover:bg-zinc-200 transition-all active:scale-95"
          >
            SIGN IN WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pb-32 transition-colors duration-500`}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* TOP HEADER / MIST OVERLAY */}
      <div className="fixed top-0 left-0 right-0 h-32 mist-overlay pointer-events-none z-40" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-md mx-auto px-6 pt-12 relative z-10">
        
        {/* TAB RENDERING */}
        {activeTab === 'home' && (
          <HomeTab 
            isNearSpot={isNearSpot}
            activeSpotId={activeSpotId}
            claimSpot={claimSpot}
            totalPoints={leaderboard.find(p => p.username === username)?.score || 0}
            foundCount={unlockedSpots.length}
            unlockedSpots={unlockedSpots}
            spots={spots}
            colors={colors}
            streak={visitData?.streak || 0}
            spotStreaks={spotStreaks} // Passed for individual flames
          />
        )}
        
        {activeTab === 'leaderboard' && (
          <LeaderboardTab 
            leaderboard={leaderboard} 
            username={username} 
            colors={colors} 
          />
        )}
        
        {activeTab === 'explore' && (
          <ExploreTab 
            userLocation={userLocation} 
            isDark={isDark} 
            spots={spots} 
            unlockedSpots={unlockedSpots}
            radius={customRadius}
            colors={colors} 
          />
        )}
        
        {activeTab === 'profile' && (
          <ProfileTab 
            tempUsername={tempUsername} 
            setTempUsername={setTempUsername} 
            saveUsername={saveUsername} 
            showEmail={showEmail} 
            toggleEmailVisibility={toggleEmailVisibility} 
            colors={colors} 
            isDark={isDark} 
            lastChange={lastChange}
            user={user}
            signOut={() => supabase.auth.signOut()}
          />
        )}
        
        {activeTab === 'dev' && isAdmin && (
          <AdminTab 
            spots={spots} 
            unlockedSpots={unlockedSpots} 
            claimSpot={claimSpot} 
            removeSpot={removeSpot} 
            isDark={isDark} 
            colors={colors} 
            userLocation={userLocation} 
            currentRadius={customRadius} 
            updateRadius={updateRadius} 
            resetTimer={resetTimer} 
            addNewSpot={addNewSpot} 
            deleteSpotFromDB={deleteSpotFromDB} 
          />
        )}
      </div>

      {/* DYNAMIC BOTTOM NAVIGATION */}
      <div className={`
        fixed bottom-8 left-0 right-0 z-[5000] px-8
        transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
        ${isNavbarShrunk 
          ? 'translate-y-[150%] opacity-0 scale-95 pointer-events-none' 
          : 'translate-y-0 opacity-100 scale-100 pointer-events-auto'}
      `}>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isAdmin={isAdmin} 
          colors={colors}
          isShrunk={isNavbarShrunk} 
        />
      </div>
    </div>
  );
}
