import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Compass, LogOut, Save, Terminal, Zap, Trash2, Sun, Moon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from './supabase'; 

// --- CONFIG ---
const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

// Leaflet default icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function App() {
  const [spots, setSpots] = useState({});
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
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
      setTimeout(() => setLoading(false), 800); // Small delay for smooth transition
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

  const saveUsername = async () => {
    setIsSaving(true);
    const cleaned = tempUsername.replace('@', '').trim();
    const { error } = await supabase.from('profiles').upsert({ id: user.id, username: cleaned });
    if (!error) {
      setUsername(cleaned);
      alert("ID Updated!");
    }
    setIsSaving(false);
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (spots[id]?.points || 0), 0);

  // --- HIGH CONTRAST DARK MODE THEME ---
  const bgMain = isDark ? 'bg-[#020617]' : 'bg-slate-50'; // Deep amoled black
  const cardBg = isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';

  if (loading) return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020617]' : 'bg-slate-900'} flex items-center justify-center`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute animate-ping h-12 w-12 rounded-full bg-emerald-500 opacity-20"></div>
        <div className="relative h-10 w-10 bg-emerald-500 rounded-2xl rotate-12 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <MapPin size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#020617]' : 'bg-slate-900'} text-white p-6`}>
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-3 shadow-emerald-500/20"><MapPin size={40} /></div>
        <h1 className="text-5xl font-black mb-8 italic tracking-tighter uppercase text-center">SPOT<span className="text-emerald-500">HUNT</span></h1>
        <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
          className="bg-white text-black px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-500 hover:text-white transition-all">
          LOGIN WITH GITHUB
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} ${textColor} pb-32 font-sans transition-colors duration-500`}>
      {/* HEADER - Always Dark for Contrast */}
      <div className="bg-slate-950 text-white p-8 pt-16 pb-24 rounded-b-[48px] shadow-2xl relative border-b-4 border-emerald-500/10">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-tight">
              {username ? `@${username}` : 'HUNTER'} {isAdmin && "👑"}
            </h1>
            <p className="text-slate-500 text-xs font-mono font-bold tracking-widest uppercase opacity-60">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-3 bg-slate-900 rounded-2xl text-emerald-500 border border-white/5 hover:bg-slate-800 transition-all">
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={handleLogout} className="p-3 bg-slate-900 rounded-2xl text-slate-400 border border-white/5 hover:text-red-400 transition-all">
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-14 relative z-20">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className={`${cardBg} rounded-[32px] p-8 shadow-xl border-2 backdrop-blur-md flex justify-between items-center`}>
              <div>
                <p className={`text-5xl font-black leading-none`}>{totalPoints}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Total Score</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black leading-none`}>{unlockedSpots.length}/{Object.keys(spots).length}</p>
                <p className={`${mutedText} text-[10px] font-black uppercase tracking-widest mt-2`}>Spots Found</p>
              </div>
            </div>

            <h2 className="text-sm font-black uppercase flex items-center gap-2 tracking-widest">
              <Trophy size={18} className="text-emerald-500"/> Your Collection
            </h2>
            <div className="space-y-3 pb-4">
              {unlockedSpots.length === 0 ? (
                <div className={`${cardBg} rounded-[32px] p-12 text-center border-2 border-dashed`}>
                  <p className={`${mutedText} font-bold text-xs uppercase tracking-tighter opacity-50`}>The map is waiting. Go find a tag.</p>
                </div>
              ) : (
                unlockedSpots.map(id => (
                  <div key={id} className={`${cardBg} p-5 rounded-3xl flex items-center justify-between border-2 shadow-sm animate-in zoom-in-95`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">✓</div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{spots[id]?.name || 'Unknown Location'}</p>
                        <p className="text-[10px] text-emerald-500 font-bold">+{spots[id]?.points} PTS</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in fade-in">
            <div className={`${cardBg} rounded-[40px] p-2 shadow-2xl border-2 h-[450px] relative overflow-hidden`}>
              <MapContainer key={`${activeTab}-${theme}`} center={mapCenter} zoom={12} className="h-full w-full rounded-[32px]">
                <TileLayer 
                  url={isDark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} 
                />
                {Object.values(spots).map(spot => (
                  <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                    <Popup>
                       <span className="font-black uppercase text-xs">{spot.name}</span>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className={`${cardBg} p-8 rounded-[40px] shadow-xl border-2 space-y-6 animate-in slide-in-from-right-4`}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">Hunter Identity</label>
                <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                  className={`w-full ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'} border-2 rounded-2xl py-4 px-6 font-black outline-none focus:border-emerald-500 transition-all`}
                  placeholder="Username"
                />
              </div>
              <button onClick={saveUsername} disabled={isSaving} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                {isSaving ? 'UPDATING...' : 'SAVE CHANGES'}
              </button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className="bg-slate-950 p-8 rounded-[40px] border-4 border-emerald-500/20 text-white space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-emerald-500 uppercase italic flex items-center gap-2"><Terminal size={18}/> SYSTEM_OVERRIDE</h2>
                <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">ROOT_ACCESS</span>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(spots).map(spot => (
                  <button key={spot.id} onClick={() => claimSpot(spot.id)} disabled={unlockedSpots.includes(spot.id)}
                    className={`w-full p-5 rounded-2xl text-xs font-black uppercase flex justify-between items-center transition-all ${unlockedSpots.includes(spot.id) ? 'bg-slate-900 text-slate-700' : 'bg-slate-900 border border-white/5 hover:border-emerald-500 text-white'}`}>
                    {spot.name} <Zap size={14} className={unlockedSpots.includes(spot.id) ? 'text-slate-800' : 'text-emerald-500'}/>
                  </button>
                ))}
              </div>
           </div>
        )}
      </div>

      {/* NAV BAR */}
      <nav className={`fixed bottom-8 left-6 right-6 bg-slate-950/90 border border-white/10 backdrop-blur-xl rounded-[32px] p-2 shadow-2xl z-[9999] flex justify-around items-center`}>
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}><Home size={22}/></button>
        <button onClick={() => setActiveTab('explore')} className={`p-4 rounded-2xl transition-all ${activeTab === 'explore' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}><Compass size={22}/></button>
        <button onClick={() => setActiveTab('profile')} className={`p-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}><User size={22}/></button>
        {isAdmin && <button onClick={() => setActiveTab('dev')} className={`p-4 rounded-2xl transition-all ${activeTab === 'dev' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}><Terminal size={22}/></button>}
      </nav>
    </div>
  );
}
