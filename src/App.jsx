import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Terminal, Trash2, Zap, Compass, Home, User, MapPin } from 'lucide-react';
import { supabase } from './supabase';

// Import our new components
import ThemeToggle from './components/ThemeToggle';
import Header from './components/Header';
import HomeView from './components/HomeView';
import Navigation from './components/Navigation';
import AuthView from './components/AuthView';

// Assuming sleekIcon and magnetic hooks are defined in your utils or top of file
// (Add those imports or definitions here)

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isNearSpot, setIsNearSpot] = useState(false);

  const isDark = theme === 'dark';
  const isAdmin = user?.email === 'your-admin@email.com'; // Adjust logic as needed

  // Helper for Theme Colors
  const colors = {
    bg: isDark ? 'bg-[#09090b]' : 'bg-[#f0f4f2]',
    card: isDark ? 'bg-zinc-900/40 border-white/[0.03] shadow-2xl' : 'bg-white/70 border-emerald-200/50 shadow-md shadow-emerald-900/5',
    nav: isDark ? 'bg-zinc-900/80 border-white/[0.05]' : 'bg-white/95 border-emerald-200/60',
    text: isDark ? 'text-zinc-100' : 'text-zinc-900',
    glass: isDark ? 'bg-white/[0.02] backdrop-blur-xl border-white/[0.05]' : 'bg-white/40 backdrop-blur-xl border-white/20'
  };

  // Logic Handlers
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };
  
  const claimSpot = async (spotId) => {
    const newUnlocked = [...unlockedSpots, spotId];
    const { error } = await supabase.from('profiles').update({ unlocked_spots: newUnlocked }).eq('id', user.id);
    if (!error) setUnlockedSpots(newUnlocked);
  };

  const removeSpot = async (spotId) => {
    const newUnlocked = unlockedSpots.filter(id => id !== spotId);
    const { error } = await supabase.from('profiles').update({ unlocked_spots: newUnlocked }).eq('id', user.id);
    if (!error) setUnlockedSpots(newUnlocked);
  };

  const saveUsername = async () => {
    const cleaned = tempUsername.replace('@', '').trim();
    const { error } = await supabase.from('profiles').upsert({ id: user.id, username: cleaned });
    if (!error) { setUsername(cleaned); alert("Profile secured."); }
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (spots[id]?.points || 0), 0);

  // Loading State
  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  // Auth State
  if (!user) return (
    <AuthView 
      colors={colors} 
      supabase={supabase} 
      themeProps={{ isDark, toggleTheme, themeMag }} 
    />
  );

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pb-36 transition-colors duration-500 selection:bg-emerald-500/30`}>
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} themeMag={themeMag} />
      
      {/* Dynamic Styles Injection */}
      <style>{`
        .leaflet-container { background: ${isDark ? '#09090b' : '#f0f4f2'} !important; }
        .mist-overlay { background: radial-gradient(circle at top, ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'} 0%, transparent 60%); }
        /* ... other animations from your original code ... */
      `}</style>

      <Header 
        username={username} 
        isAdmin={isAdmin} 
        isDark={isDark} 
        handleLogout={handleLogout} 
        logoutMag={logoutMag} 
      />

      <main className="max-w-md mx-auto px-6 -mt-16 relative z-30">
        {activeTab === 'home' && (
          <HomeView 
            isNearSpot={isNearSpot} 
            totalPoints={totalPoints} 
            unlockedSpots={unlockedSpots} 
            spots={spots} 
            colors={colors} 
          />
        )}

        {activeTab === 'explore' && (
          <div className={`${colors.card} rounded-[3rem] p-2 shadow-2xl border h-[520px] overflow-hidden backdrop-blur-md`}>
            <MapContainer 
              key={`${activeTab}-${theme}`} 
              center={mapCenter} 
              zoom={12} 
              zoomControl={false} 
              className="h-full w-full rounded-[2.5rem] z-0"
            >
              <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
              {Object.values(spots).map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={sleekIcon(isDark)}>
                  <Popup><span className="font-bold text-xs">{spot.name}</span></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className={`${colors.glass} p-10 rounded-[3rem] border space-y-8 animate-in fade-in zoom-in-95 duration-300`}>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Identity</label>
                <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                  className={`w-full ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/40 border-emerald-200/50'} border rounded-2xl py-5 px-6 font-bold outline-none focus:border-emerald-500/40 transition-all text-sm backdrop-blur-md`}
                  placeholder="Your callsign..."
                />
              </div>
              <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all text-sm">
                Apply Changes
              </button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className={`${colors.glass} p-8 rounded-[3rem] border space-y-6 animate-in fade-in zoom-in-95 duration-300`}>
              <h2 className="font-bold uppercase flex items-center gap-2 text-[10px] tracking-widest text-emerald-500">
                <Terminal size={14}/> Node Override
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(spots).map(spot => {
                  const isClaimed = unlockedSpots.includes(spot.id);
                  return (
                    <div key={spot.id} className={`${isDark ? 'bg-white/5' : 'bg-white/30'} p-4 rounded-[1.8rem] flex justify-between items-center border border-white/5 hover:border-emerald-500/20 transition-all`}>
                      <span className="text-xs font-bold tracking-tight">{spot.name}</span>
                      <div className="flex gap-2">
                        {isClaimed ? (
                          <button onClick={() => removeSpot(spot.id)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                        ) : (
                          <button onClick={() => claimSpot(spot.id)} className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"><Zap size={16}/></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        )}
      </main>

      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin} 
        colors={colors} 
      />
    </div>
  );
}
