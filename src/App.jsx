import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Compass, LogOut, Terminal, Zap, Trash2, Sun, Moon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from './supabase'; 

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

// Leaflet fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function App() {
  const [spots, setSpots] = useState({});
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mapCenter] = useState([40.730610, -73.935242]);

  const isAdmin = user?.id === ADMIN_UID;
  const isDark = theme === 'dark';

  useEffect(() => {
    const initApp = async () => {
      const { data: dbSpots } = await supabase.from('spots').select('*');
      if (dbSpots) {
        const spotsObj = dbSpots.reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
        setSpots(spotsObj);
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
          setUnlockedSpots(data.unlocked_spots || []);
          setUsername(data.username || '');
          setTempUsername(data.username || '');
        }
      }
      setLoading(false);
    };
    initApp();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const claimSpot = async (spotId) => {
    if (unlockedSpots.includes(spotId)) return;
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
    if (!error) { setUsername(cleaned); alert("Identity Updated."); }
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (spots[id]?.points || 0), 0);

  // --- CLEAN FROSTED PALETTE ---
  const colors = {
    bg: isDark ? 'bg-zinc-950' : 'bg-[#f7faf8]',
    card: isDark ? 'bg-zinc-900/50 border-white/5 shadow-2xl' : 'bg-white border-emerald-100/50 shadow-sm',
    header: isDark 
      ? 'from-emerald-950/40 via-zinc-900/90 to-zinc-950 border-emerald-500/10' 
      : 'from-emerald-500/10 via-emerald-50/50 to-[#f7faf8] border-emerald-200/30',
    text: isDark ? 'text-zinc-100' : 'text-slate-900',
    muted: isDark ? 'text-zinc-500' : 'text-emerald-700/50',
    nav: isDark ? 'bg-zinc-900/70 border-white/5' : 'bg-white/80 border-emerald-100',
  };

  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6`}>
      <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
        <MapPin size={40} className="text-white" />
      </div>
      <h1 className={`text-4xl font-bold mb-10 tracking-tight ${colors.text}`}>SpotHunt</h1>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
        className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all">
        Sign in with GitHub
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pb-36 transition-colors duration-500`}>
      
      {/* FROSTED HEADER LAYOUT */}
      <header className={`bg-gradient-to-b ${colors.header} backdrop-blur-xl p-10 pt-16 pb-28 rounded-b-[3.5rem] border-b relative overflow-hidden`}>
        {/* Subtle Ambient Green Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-emerald-500/5 blur-[100px] rounded-full" />
        
        <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1 opacity-80">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight">
              @{username || 'Hunter'} {isAdmin && "👑"}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-zinc-800/50 border-zinc-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-600 shadow-sm'}`}>
              {isDark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <button onClick={handleLogout} className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-zinc-800/50 border-zinc-700 text-zinc-500' : 'bg-white border-emerald-100 text-emerald-600 shadow-sm'}`}>
              <LogOut size={18}/>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-14 relative z-20">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`${colors.card} backdrop-blur-md rounded-[2.5rem] p-8 border flex justify-between items-center`}>
              <div>
                <p className="text-5xl font-bold tracking-tighter leading-none">{totalPoints}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-3">Points Earned</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold leading-none">{unlockedSpots.length}</p>
                <p className={`${colors.muted} text-[10px] font-bold uppercase mt-1`}>Spots Found</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/70 px-4">Recent Discoveries</h2>
              {unlockedSpots.map(id => (
                <div key={id} className={`${colors.card} p-5 rounded-[2rem] flex items-center justify-between border transition-all hover:scale-[1.01]`}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center font-bold">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{spots[id]?.name}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase">+{spots[id]?.points} XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className={`${colors.card} rounded-[2.5rem] p-2 shadow-2xl border h-[480px] overflow-hidden`}>
            <MapContainer key={`${activeTab}-${theme}`} center={mapCenter} zoom={12} attributionControl={false} className="h-full w-full rounded-[1.8rem]">
              <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
              {Object.values(spots).map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                  <Popup><span className="font-bold text-xs">{spot.name}</span></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className={`${colors.card} p-10 rounded-[2.5rem] border space-y-6`}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Change Name</label>
                <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                  className={`w-full ${isDark ? 'bg-zinc-950/50 border-white/5' : 'bg-emerald-50/50 border-emerald-100'} border rounded-2xl py-4 px-6 font-bold outline-none focus:border-emerald-500/50 transition-all text-sm`}
                />
              </div>
              <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm">Update Profile</button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className={`${colors.card} p-8 rounded-[2.5rem] border space-y-6`}>
              <h2 className="font-bold uppercase flex items-center gap-2 text-xs tracking-widest text-emerald-500">
                <Terminal size={16}/> Admin Dashboard
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(spots).map(spot => {
                  const isClaimed = unlockedSpots.includes(spot.id);
                  return (
                    <div key={spot.id} className={`${isDark ? 'bg-black/20' : 'bg-slate-50'} p-4 rounded-[1.5rem] border border-transparent flex justify-between items-center`}>
                      <span className="text-xs font-bold">{spot.name}</span>
                      <div className="flex gap-2">
                        {isClaimed ? (
                          <button onClick={() => removeSpot(spot.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                        ) : (
                          <button onClick={() => claimSpot(spot.id)} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Zap size={14}/></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        )}
      </div>

      {/* CLEAN GLASS NAV BAR */}
      <nav className={`fixed bottom-8 left-8 right-8 ${colors.nav} backdrop-blur-2xl rounded-[2.2rem] p-1.5 shadow-2xl z-[9999] flex justify-around items-center border transition-all`}>
        {['home', 'explore', 'profile', 'dev'].map((tab) => (
          (tab !== 'dev' || isAdmin) && (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`p-3.5 px-6 rounded-[1.8rem] transition-all relative ${activeTab === tab ? 'bg-emerald-500/10 text-emerald-500 scale-105' : 'text-zinc-500 hover:text-emerald-500/50'}`}>
              {tab === 'home' && <Home size={20} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
              {tab === 'explore' && <Compass size={20} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
              {tab === 'profile' && <User size={20} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
              {tab === 'dev' && <Terminal size={20} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
            </button>
          )
        ))}
      </nav>
    </div>
  );
}
