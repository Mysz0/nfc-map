import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Trophy, User, Home, Compass, LogOut, Terminal, Zap, Trash2, Sun, Moon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from './supabase'; 

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

// --- SLEEK CUSTOM MARKER ---
const sleekIcon = (isDark) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background-color: #10b981;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 3px solid ${isDark ? '#18181b' : '#ffffff'};
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const useMagnetic = () => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });
  return { ref, position, handleMouseMove, reset };
};

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

  const themeMag = useMagnetic();
  const logoutMag = useMagnetic();

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

  const colors = {
    bg: isDark ? 'bg-zinc-950' : 'bg-[#f7faf8]',
    card: isDark ? 'bg-zinc-900/50 border-white/5 shadow-2xl shadow-black/20' : 'bg-white border-emerald-100/40 shadow-sm shadow-emerald-900/5',
    // BIGGER, SMOOTHER GRADIENT RAMP
    header: isDark 
      ? 'from-emerald-600/10 via-emerald-800/5 via-zinc-900/90 to-zinc-950 border-emerald-500/10' 
      : 'from-emerald-200/40 via-emerald-100/20 via-emerald-50/50 to-[#f7faf8] border-emerald-200/30',
    text: isDark ? 'text-zinc-100' : 'text-slate-900',
    muted: isDark ? 'text-zinc-500' : 'text-emerald-800/40',
    nav: isDark ? 'bg-zinc-900/60 border-white/5' : 'bg-white/80 border-emerald-100/60',
  };

  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
      <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6`}>
      <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
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
      
      {/* IMPROVED GRADIENT HEADER */}
      <header className={`bg-gradient-to-b ${colors.header} backdrop-blur-3xl p-10 pt-16 pb-32 rounded-b-[4.5rem] border-b relative overflow-hidden`}>
        <div className="max-w-md mx-auto flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-500 opacity-90">Session Active</p>
               {isAdmin && <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase border border-zinc-500/30 px-1.5 rounded-sm">Admin Privileges</span>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              @{username || 'Hunter'}
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              ref={themeMag.ref}
              onMouseMove={themeMag.handleMouseMove}
              onMouseLeave={themeMag.reset}
              style={{ transform: `translate(${themeMag.position.x}px, ${themeMag.position.y}px)` }}
              onClick={toggleTheme} 
              className={`p-3.5 rounded-2xl border transition-all duration-200 ease-out active:scale-90 ${isDark ? 'bg-zinc-800/40 border-zinc-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-600 shadow-sm'}`}
            >
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>

            <button 
              ref={logoutMag.ref}
              onMouseMove={logoutMag.handleMouseMove}
              onMouseLeave={logoutMag.reset}
              style={{ transform: `translate(${logoutMag.position.x}px, ${logoutMag.position.y}px)` }}
              onClick={handleLogout} 
              className={`p-3.5 rounded-2xl border transition-all duration-200 ease-out active:scale-90 ${isDark ? 'bg-zinc-800/40 border-zinc-700 text-zinc-500' : 'bg-white border-emerald-100 text-emerald-600 shadow-sm'}`}
            >
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 -mt-16 relative z-20">
        
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className={`${colors.card} backdrop-blur-xl rounded-[2.8rem] p-9 border flex justify-between items-center`}>
              <div>
                <p className="text-5xl font-bold tracking-tighter leading-none italic">{totalPoints}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-4">Total Score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold leading-none">{unlockedSpots.length}</p>
                <p className={`${colors.muted} text-[10px] font-bold uppercase mt-1`}>Claimed</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 px-4">Inventory</h2>
              {unlockedSpots.map(id => (
                <div key={id} className={`${colors.card} p-5 rounded-[2.2rem] flex items-center justify-between border transition-all hover:border-emerald-500/20`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-[1.2rem] flex items-center justify-center">
                      <Zap size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{spots[id]?.name}</p>
                      <p className="text-[10px] text-emerald-500/80 font-bold uppercase">Rank {spots[id]?.points}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className={`${colors.card} rounded-[3rem] p-2 shadow-2xl border h-[500px] overflow-hidden relative`}>
            {/* CSS to hide Leaflet attribution */}
            <style>{`.leaflet-control-attribution { display: none !important; }`}</style>
            <MapContainer key={`${activeTab}-${theme}`} center={mapCenter} zoom={12} attributionControl={false} className="h-full w-full rounded-[2.4rem] z-0">
              <TileLayer url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
              {Object.values(spots).map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={sleekIcon(isDark)}>
                  <Popup>
                    <div className="font-bold text-xs py-1">
                        <span className="block text-emerald-500 text-[10px] uppercase">Spot</span>
                        {spot.name}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className={`${colors.card} p-10 rounded-[2.8rem] border space-y-8`}>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Update Identity</label>
                <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                  className={`w-full ${isDark ? 'bg-zinc-950/50 border-white/5' : 'bg-emerald-50/30 border-emerald-100'} border rounded-2xl py-5 px-6 font-bold outline-none focus:border-emerald-500/40 transition-all text-sm`}
                />
              </div>
              <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-bold shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 active:scale-[0.97] transition-all text-sm">
                Apply Changes
              </button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className={`${colors.card} p-8 rounded-[2.8rem] border space-y-6`}>
              <h2 className="font-bold uppercase flex items-center gap-2 text-[10px] tracking-[0.2em] text-emerald-500">
                <Terminal size={14}/> Admin Control
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(spots).map(spot => {
                  const isClaimed = unlockedSpots.includes(spot.id);
                  return (
                    <div key={spot.id} className={`${isDark ? 'bg-black/20' : 'bg-slate-50/50'} p-4 rounded-[1.5rem] flex justify-between items-center border border-transparent hover:border-emerald-500/10 transition-all`}>
                      <span className="text-xs font-bold">{spot.name}</span>
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
      </div>

      <nav className="fixed bottom-10 left-8 right-8 z-[9999] flex justify-center">
        <div className={`${colors.nav} backdrop-blur-2xl rounded-[2.5rem] p-1.5 flex items-center border shadow-2xl shadow-black/10`}>
          {['home', 'explore', 'profile', 'dev'].map((tab) => (
            (tab !== 'dev' || isAdmin) && (
              <button key={tab} onClick={() => setActiveTab(tab)} 
                className={`p-4 px-7 rounded-[2rem] transition-all duration-300 relative ${activeTab === tab ? 'bg-emerald-500/10 text-emerald-500 scale-105' : 'text-zinc-500 hover:text-emerald-500/40'}`}>
                {tab === 'home' && <Home size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
                {tab === 'explore' && <Compass size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
                {tab === 'profile' && <User size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
                {tab === 'dev' && <Terminal size={22} strokeWidth={activeTab === tab ? 2.5 : 2}/>}
              </button>
            )
          ))}
        </div>
      </nav>
    </div>
  );
}
