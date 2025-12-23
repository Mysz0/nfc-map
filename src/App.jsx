import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Compass, LogOut, Save, Terminal, Zap, Trash2, Sun, Moon } from 'lucide-react';
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
      setTimeout(() => setLoading(false), 500);
    };
    initApp();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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

  // --- REFINED COLOR PALETTE ---
  const colors = {
    bg: isDark ? 'bg-zinc-950' : 'bg-slate-50',
    card: isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200',
    header: isDark ? 'from-zinc-900 to-zinc-950 border-zinc-800' : 'from-emerald-600 to-emerald-700 border-emerald-800',
    text: isDark ? 'text-zinc-100' : 'text-slate-900',
    muted: isDark ? 'text-zinc-500' : 'text-slate-500',
    nav: isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-slate-200',
  };

  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6`}>
      <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 rotate-6">
        <MapPin size={48} className="text-white" />
      </div>
      <h1 className={`text-6xl font-black mb-10 italic tracking-tighter uppercase ${colors.text}`}>SPOT<span className="text-emerald-500">HUNT</span></h1>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
        className="bg-emerald-500 text-white px-10 py-5 rounded-3xl font-black shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all">
        START THE HUNT
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pb-44 transition-colors duration-500`}>
      
      {/* IMPROVED HEADER */}
      <header className={`bg-gradient-to-b ${colors.header} p-10 pt-20 pb-28 rounded-b-[3rem] border-b shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
          <div>
            <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-emerald-500' : 'text-white'}`}>
              @{username || 'HUNTER'} {isAdmin && "👑"}
            </h1>
            <p className={`${isDark ? 'text-zinc-500' : 'text-emerald-100'} text-[10px] font-mono font-bold tracking-widest mt-1`}>
              {user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleTheme} className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-white/10 border-white/20 text-white'}`}>
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={() => { supabase.auth.signOut(); window.location.href='/'; }} className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white/10 border-white/20 text-white'}`}>
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20">
        
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className={`${colors.card} rounded-[2.5rem] p-10 shadow-xl border flex justify-between items-end`}>
              <div>
                <p className="text-6xl font-black tracking-tighter leading-none">{totalPoints}</p>
                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-3">XP Earned</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black leading-none">{unlockedSpots.length}</p>
                <p className={`${colors.muted} text-[10px] font-black uppercase tracking-widest mt-2`}>Spots Found</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 px-2">Achievements</h2>
              {unlockedSpots.length === 0 ? (
                <div className={`${colors.card} rounded-[2rem] p-12 text-center border-2 border-dashed`}>
                  <p className={`${colors.muted} font-bold text-xs uppercase`}>No spots discovered yet.</p>
                </div>
              ) : (
                unlockedSpots.map(id => (
                  <div key={id} className={`${colors.card} p-6 rounded-[2rem] flex items-center gap-5 border shadow-sm group hover:border-emerald-500/50 transition-all`}>
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">✓</div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">{spots[id]?.name}</p>
                      <p className="text-[10px] text-emerald-500 font-bold mt-0.5">+{spots[id]?.points} POINTS</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className={`${colors.card} rounded-[3rem] p-3 shadow-2xl border h-[500px] overflow-hidden`}>
            <MapContainer key={`${activeTab}-${theme}`} center={mapCenter} zoom={12} className="h-full w-full rounded-[2.2rem]">
              <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
              {Object.values(spots).map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                  <Popup><span className="font-black uppercase text-xs">{spot.name}</span></Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className={`${colors.card} p-10 rounded-[2.5rem] shadow-xl border space-y-6`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Update Alias</label>
                <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                  className={`w-full ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'} border-2 rounded-2xl py-5 px-6 font-black outline-none focus:border-emerald-500 transition-all`}
                />
              </div>
              <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">SAVE IDENTITY</button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className={`${isDark ? 'bg-zinc-900 border-emerald-500/30' : 'bg-slate-900 border-slate-800'} p-8 rounded-[2.5rem] border-4 text-white space-y-6`}>
              <h2 className="font-black text-emerald-500 uppercase italic flex items-center gap-2 tracking-widest"><Terminal size={18}/> SYSTEM_ADMIN</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(spots).map(spot => {
                  const isClaimed = unlockedSpots.includes(spot.id);
                  return (
                    <div key={spot.id} className="bg-zinc-950/50 p-5 rounded-3xl border border-white/5 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-tighter">{spot.name}</span>
                      <div className="flex gap-2">
                        {isClaimed ? (
                          <button onClick={() => removeSpot(spot.id)} className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-all"><Trash2 size={16}/></button>
                        ) : (
                          <button onClick={() => claimSpot(spot.id)} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-all"><Zap size={16}/></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        )}
      </div>

      {/* REFINED NAV BAR */}
      <nav className={`fixed bottom-10 left-8 right-8 ${colors.nav} backdrop-blur-md rounded-[2.5rem] p-3 shadow-2xl z-[9999] flex justify-around items-center border transition-all`}>
        {['home', 'explore', 'profile', 'dev'].map((tab) => (
          (tab !== 'dev' || isAdmin) && (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`p-5 rounded-[1.8rem] transition-all relative ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : colors.muted + ' hover:text-emerald-500'}`}>
              {tab === 'home' && <Home size={24}/>}
              {tab === 'explore' && <Compass size={24}/>}
              {tab === 'profile' && <User size={24}/>}
              {tab === 'dev' && <Terminal size={24}/>}
            </button>
          )
        ))}
      </nav>
    </div>
  );
}
