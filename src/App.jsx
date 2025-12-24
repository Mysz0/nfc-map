import React, { useState } from 'react';
import 'leaflet/dist/leaflet.css';

// MODULAR IMPORTS
import { supabase } from './supabase';
import { useMagnetic } from './hooks/useMagnetic';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useGeoLocation } from './hooks/useGeoLocation';
import { useGameLogic } from './hooks/useGameLogic';

// COMPONENT IMPORTS
import Header from './components/Layout/Header';
import Navbar from './components/Layout/Navbar';
import HomeTab from './components/Tabs/HomeTab';
import ExploreTab from './components/Tabs/ExploreTab';
import LeaderboardTab from './components/Tabs/LeaderboardTab';
import ProfileTab from './components/Tabs/ProfileTab';
import AdminTab from './components/Tabs/AdminTab';
import Login from './components/Auth/Login';
import Toast from './components/UI/Toast';
import ThemeToggle from './components/UI/ThemeToggle';

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

export default function App() {
  // 1. STATE & HOOKS
  const [activeTab, setActiveTab] = useState('home');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  
  const { user, loading } = useAuth();
  const { theme, setTheme, isDark, isAtTop, isNavbarShrunk } = useTheme();
  const { userLocation, mapCenter } = useGeoLocation();
  const themeMag = useMagnetic();
  const logoutMag = useMagnetic();

  const showToast = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
  };

  const {
    spots, setSpots, unlockedSpots, setUnlockedSpots, visitData,
    username, setUsername, tempUsername, setTempUsername,
    showEmail, setShowEmail, lastChange, setLastChange,
    customRadius, setCustomRadius, leaderboard, claimSpot, fetchLeaderboard
  } = useGameLogic(user, showToast);

  // 2. DERIVED STATE & HANDLERS
  const isAdmin = user?.id === ADMIN_UID;
  const colors = {
    bg: isDark ? 'bg-[#09090b]' : 'bg-[#f0f4f2]',
    card: isDark ? 'bg-zinc-900/40 border-white/[0.03] shadow-2xl' : 'bg-white/70 border-emerald-200/50 shadow-md shadow-emerald-900/5',
    nav: isDark ? 'bg-zinc-900/80 border-white/[0.05]' : 'bg-white/95 border-emerald-200/60',
    text: isDark ? 'text-zinc-100' : 'text-zinc-900',
    glass: isDark ? 'bg-white/[0.02] backdrop-blur-xl border-white/[0.05]' : 'bg-white/40 backdrop-blur-xl border-white/20'
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    window.location.href = '/'; 
  };

  // 3. RENDER LOGIC
  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <Login theme={theme} setTheme={setTheme} isDark={isDark} colors={colors} />
  );

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pb-36 transition-colors duration-500`}>
      <Toast statusMsg={statusMsg} />

      <ThemeToggle 
        themeMag={themeMag} 
        setTheme={setTheme} 
        isDark={isDark} 
        isAtTop={isAtTop} 
      />

      <Header 
        isAdmin={isAdmin} 
        username={username} 
        email={user?.email} 
        showEmail={showEmail} 
        isDark={isDark} 
        logoutMag={logoutMag} 
        handleLogout={handleLogout} 
      />

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-30">
        {activeTab === 'home' && (
          <HomeTab 
            isNearSpot={false} // You can add proximity logic to useGeoLocation later
            totalPoints={unlockedSpots.reduce((sum, id) => sum + Math.round((spots[id]?.points || 0) * (visitData.streak > 1 ? 1.1 : 1.0)), 0)} 
            foundCount={unlockedSpots.length} 
            unlockedSpots={unlockedSpots} 
            spots={spots} 
            colors={colors} 
            streak={visitData.streak} 
          />
        )}
        
        {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} username={username} colors={colors} />}
        
        {activeTab === 'explore' && <ExploreTab mapCenter={mapCenter} isDark={isDark} spots={spots} colors={colors} />}
        
        {activeTab === 'profile' && (
          <ProfileTab 
            tempUsername={tempUsername} 
            setTempUsername={setTempUsername} 
            saveUsername={async () => {
              const cleaned = tempUsername.replace('@', '').trim();
              const { error } = await supabase.from('profiles').update({ username: cleaned, last_username_change: new Date().toISOString() }).eq('id', user.id);
              if (!error) { setUsername(cleaned); setLastChange(new Date().toISOString()); showToast("Identity updated!"); fetchLeaderboard(spots); }
            }} 
            showEmail={showEmail} 
            toggleEmailVisibility={async () => {
              const newValue = !showEmail;
              const { error } = await supabase.from('profiles').update({ show_email: newValue }).eq('id', user.id);
              if (!error) setShowEmail(newValue);
            }} 
            colors={colors} 
            isDark={isDark} 
            lastChange={lastChange} 
          />
        )}
        
        {activeTab === 'dev' && isAdmin && (
          <AdminTab 
            spots={spots} unlockedSpots={unlockedSpots} claimSpot={claimSpot} 
            removeSpot={async (id) => {
              const newUnlocked = unlockedSpots.filter(x => x !== id);
              await supabase.from('profiles').update({ unlocked_spots: newUnlocked }).eq('id', user.id);
              setUnlockedSpots(newUnlocked); fetchLeaderboard(spots);
            }} 
            isDark={isDark} colors={colors} userLocation={userLocation} currentRadius={customRadius} 
            updateRadius={async (v) => { await supabase.from('profiles').update({ custom_radius: v }).eq('id', user.id); setCustomRadius(v); }} 
            resetTimer={async () => { await supabase.from('profiles').update({ last_username_change: null }).eq('id', user.id); setLastChange(null); }} 
            addNewSpot={async (s) => { const id = s.name.toLowerCase().replace(/\s+/g, '-'); await supabase.from('spots').insert([{ id, ...s }]); setSpots(p => ({ ...p, [id]: { id, ...s } })); }} 
            deleteSpotFromDB={async (id) => { await supabase.from('spots').delete().eq('id', id); const n = {...spots}; delete n[id]; setSpots(n); }} 
          />
        )}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 z-[50] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isNavbarShrunk ? 'nav-shrink' : ''}`}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} colors={colors} />
      </div>
    </div>
  );
}
