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

  // --- IMPROVED "FOREST FROST" PALETTE ---
  const colors = {
    bg: isDark ? 'bg-[#020604]' : 'bg-[#f8faf9]',
    card: isDark ? 'bg-zinc-900/40 border-emerald-500/10' : 'bg-white border-emerald-100 shadow-xl shadow-emerald-900/5',
    header: isDark 
      ? 'from-emerald-950/80 via-zinc-950 to-[#020604] border-emerald-500/20' 
      : 'from-emerald-600 via-emerald-500 to-emerald-400 border-emerald-300',
    text: isDark ? 'text-zinc-100' : 'text-emerald-950',
    muted: isDark ? 'text-emerald-500/60' : 'text-emerald-700/60',
    nav: isDark ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-white/80 border-emerald-100',
    input: isDark ? 'bg-zinc-950 border-emerald-500/20 focus:border-emerald-500' : 'bg-emerald-50/50 border-emerald-100 focus:border-emerald-400',
  };

  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="w-12 h-12 border-[3px] border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6 relative overflow-hidden`}>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_20px_50px_rgba(16,185,129,0.3)] rotate-3">
        <MapPin size={48} className="text-white" />
      </div>
      <h1 className={`text-6xl font-black mb-12 italic uppercase tracking-tighter ${colors.text}`}>
        SPOT<span className="text-emerald-500 not-italic">HUNT</span>
      </h1>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
        className="group relative bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 overflow-hidden">
        <span className="relative z-10">INITIALIZE LOGIN</span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} pb-40 transition-colors duration-700`}>
      
      {/* IMPROVED HEADER WITH GREEN TINT */}
      <header className={`bg-gradient-to-b ${colors.header} backdrop-blur-xl p-10 pt-20 pb-32 rounded-b-[4rem] border-b shadow-2xl relative overflow-hidden`}>
        {/* Animated Glow behind username */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full animate-pulse" />
        <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full" />
        
        <div className="max-w-md mx-auto flex justify-between items-end relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
               <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-emerald-500' : 'text-emerald-100'}`}>Agent Profile</span>
            </div>
            <h1 className={`text-3xl font-black uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-white'}`}>
              @{username || 'HUNTER'} {isAdmin && <span className="text-yellow-400 drop-shadow-md">👑</span>}
            </h1>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleTheme} className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10' : 'bg-black/10 border-white/20 text-white hover:bg-black/20'}`}>
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={handleLogout} className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-black/10 border-white/20 text-white hover:bg-black/20'}`}>
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Stats Card */}
            <div className={`${colors.card} backdrop-blur-md rounded-[3rem] p-10 border flex justify-between items-center relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Trophy size={80} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-6xl font-black tracking-tighter leading-none italic">{totalPoints}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-3">Total Experience</p>
              </div>
              <div className="text-right border-l border-emerald-500/10 pl-8">
                <p className="text-3xl font-black leading-none">{unlockedSpots.length}</p>
                <p className={`${colors.muted} text-[10px] font-black uppercase tracking-widest mt-2`}>Intel Found</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500/80">Secured Locations</h2>
                <div className="h-px flex-1 bg-emerald-500/10 ml-4" />
              </div>
              
              {unlockedSpots.length === 0 && (
                <div className={`${colors.card} p-12 rounded-[2.5rem] border border-dashed flex flex-col items-center opacity-50`}>
                  <Compass size={40} className="mb-4 text-emerald-500" />
                  <p className="text-xs font-bold uppercase tracking-widest">No spots claimed yet</p>
                </div>
              )}

              {unlockedSpots.map(id => (
                <div key={id} className={`${colors.card} p-6 rounded-[2.5rem] flex items-center justify-between border group hover:scale-[1.02] transition-all duration-300 cursor-default`}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="font-black text-base uppercase tracking-tight">{spots[id]?.name}</p>
                      <p className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">Rank: {spots[id]?.points} XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className={`${colors.card} rounded-[3rem] p-3 shadow-2xl border h-[520px] overflow-hidden animate-in slide-in-from-bottom-8 duration-500`}>
            <MapContainer key={`${activeTab}-${theme}`} center={mapCenter} zoom={12} attributionControl={false} className="h-full w-full rounded-[2.5rem]">
              <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
              {Object.values(spots).map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                  <Popup>
                    <div className="p-1">
                        <span className="font-black uppercase text-[10px] tracking-tighter block border-b border-emerald-100 pb-1 mb-1">{spot.name}</span>
                        <span className="text-emerald-500 font-bold text-[9px] uppercase tracking-widest">+{spot.points} XP</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className={`${colors.card} p-12 rounded-[3rem] shadow-xl border space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-2">Operative Callsign</label>
                <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                    <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                      className={`w-full ${colors.input} border-2 rounded-[1.5rem] py-5 pl-14 pr-6 font-black outline-none transition-all text-sm`}
                      placeholder="ENTER NAME..."
                    />
                </div>
              </div>
              <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all uppercase text-xs tracking-[0.2em]">
                Secure Identity
              </button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className={`${isDark ? 'bg-zinc-900/40' : 'bg-emerald-50'} backdrop-blur-xl p-10 rounded-[3rem] border-2 ${isDark ? 'border-emerald-500/20' : 'border-emerald-200'} space-y-8 shadow-xl animate-in zoom-in-95`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-black uppercase italic flex items-center gap-3 tracking-[0.2em] ${isDark ? 'text-emerald-500' : 'text-emerald-800'}`}>
                    <Terminal size={20}/> ROOT_ACCESS
                </h2>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[9px] font-black text-emerald-500 uppercase">Admin Mode</div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(spots).map(spot => {
                  const isClaimed = unlockedSpots.includes(spot.id);
                  return (
                    <div key={spot.id} className={`${isDark ? 'bg-black/40 border-emerald-500/10' : 'bg-white border-emerald-100'} p-5 rounded-[1.8rem] border flex justify-between items-center`}>
                      <span className={`text-[11px] font-black uppercase tracking-tight ${!isDark && 'text-emerald-950'}`}>{spot.name}</span>
                      <div className="flex gap-2">
                        {isClaimed ? (
                          <button onClick={() => removeSpot(spot.id)} className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        ) : (
                          <button onClick={() => claimSpot(spot.id)} className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><Zap size={16}/></button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        )}
      </div>

      {/* FLOATING GLASS NAV */}
      <nav className={`fixed bottom-10 left-10 right-10 ${colors.nav} backdrop-blur-xl rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[9999] flex justify-around items-center border transition-all`}>
        {['home', 'explore', 'profile', 'dev'].map((tab) => (
          (tab !== 'dev' || isAdmin) && (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`p-4 px-8 rounded-[1.8rem] transition-all relative group ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : colors.muted + ' hover:text-emerald-500'}`}>
              {tab === 'home' && <Home size={22}/>}
              {tab === 'explore' && <Compass size={22}/>}
              {tab === 'profile' && <User size={22}/>}
              {tab === 'dev' && <Terminal size={22}/>}
              {activeTab === tab && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
            </button>
          )
        ))}
      </nav>
    </div>
  );
}
