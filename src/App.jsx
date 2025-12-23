import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Compass, LogOut, Save, Terminal, Zap, Trash2, Sun, Moon, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from './supabase'; 

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
      setTimeout(() => setLoading(false), 600);
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

  // --- REMOVE FROM INVENTORY ---
  const removeSpot = async (spotId) => {
    const newUnlocked = unlockedSpots.filter(id => id !== spotId);
    const { error } = await supabase.from('profiles').update({ unlocked_spots: newUnlocked }).eq('id', user.id);
    if (!error) setUnlockedSpots(newUnlocked);
  };

  const saveUsername = async () => {
    setIsSaving(true);
    const cleaned = tempUsername.replace('@', '').trim();
    const { error } = await supabase.from('profiles').upsert({ id: user.id, username: cleaned });
    if (!error) { setUsername(cleaned); alert("Identity Verified."); }
    setIsSaving(false);
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (spots[id]?.points || 0), 0);

  // --- REFINED THEME COLORS ---
  const bgMain = isDark ? 'bg-[#020617]' : 'bg-slate-50'; 
  const cardBg = isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
  const navBg = isDark ? 'bg-slate-800 border-white/20' : 'bg-slate-900 border-transparent';
  const textColor = isDark ? 'text-white' : 'text-slate-900';

  if (loading) return (
    <div className={`min-h-screen ${isDark ? 'bg-[#020617]' : 'bg-slate-900'} flex items-center justify-center`}>
      <div className="h-10 w-10 bg-emerald-500 rounded-2xl animate-pulse shadow-lg shadow-emerald-500/50" />
    </div>
  );

  if (!user) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#020617]' : 'bg-slate-900'} text-white p-6 text-center`}>
      <h1 className="text-5xl font-black mb-8 italic uppercase">SPOT<span className="text-emerald-500">HUNT</span></h1>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
        className="bg-white text-black px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-emerald-500 hover:text-white transition-all">
        LOGIN WITH GITHUB
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${bgMain} ${textColor} pb-40 transition-colors duration-300`}>
      {/* HEADER */}
      <div className="bg-slate-950 text-white p-8 pt-16 pb-24 rounded-b-[48px] shadow-2xl relative">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-tight">
              @{username || 'HUNTER'} {isAdmin && "👑"}
            </h1>
            <p className="text-slate-500 text-[10px] font-mono font-bold uppercase">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-3 bg-slate-900 rounded-2xl border border-white/10 text-emerald-400">
              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={handleLogout} className="p-3 bg-slate-900 rounded-2xl border border-white/10 text-slate-400">
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-14 relative z-20">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className={`${cardBg} rounded-[32px] p-8 shadow-xl border-2 flex justify-between items-center`}>
              <div>
                <p className="text-5xl font-black leading-none">{totalPoints}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Points</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black leading-none">{unlockedSpots.length}/{Object.keys(spots).length}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Claimed</p>
              </div>
            </div>

            <div className="space-y-3">
              {unlockedSpots.map(id => (
                <div key={id} className={`${cardBg} p-5 rounded-3xl flex items-center gap-4 border-2 shadow-sm`}>
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black">✓</div>
                  <p className="font-black text-sm uppercase">{spots[id]?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className={`${cardBg} rounded-[40px] p-2 shadow-2xl border-2 h-[450px] overflow-hidden`}>
            <MapContainer key={`${activeTab}-${theme}`} center={mapCenter} zoom={12} className="h-full w-full rounded-[32px]">
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
           <div className={`${cardBg} p-8 rounded-[40px] shadow-xl border-2 space-y-4`}>
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Update Alias</label>
              <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)}
                className={`w-full ${isDark ? 'bg-slate-950 text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-100'} border-2 rounded-2xl py-4 px-6 font-black outline-none`}
              />
              <button onClick={saveUsername} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black">SAVE IDENTITY</button>
           </div>
        )}

        {activeTab === 'dev' && isAdmin && (
           <div className="bg-slate-950 p-8 rounded-[40px] border-4 border-emerald-500/20 text-white space-y-6">
              <h2 className="font-black text-emerald-500 uppercase italic flex items-center gap-2"><Terminal size={18}/> SYSTEM_ADMIN</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {Object.values(spots).map(spot => {
                  const isClaimed = unlockedSpots.includes(spot.id);
                  return (
                    <div key={spot.id} className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase">{spot.name}</span>
                      <div className="flex gap-2">
                        {isClaimed ? (
                          <button onClick={() => removeSpot(spot.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={16}/>
                          </button>
                        ) : (
                          <button onClick={() => claimSpot(spot.id)} className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                            <Zap size={16}/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        )}
      </div>

      {/* NAV BAR */}
      <nav className={`fixed bottom-8 left-6 right-6 ${navBg} backdrop-blur-xl rounded-[32px] p-2 shadow-2xl z-[9999] flex justify-around items-center border-2 transition-all`}>
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl ${activeTab === 'home' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'text-slate-400'}`}><Home size={22}/></button>
        <button onClick={() => setActiveTab('explore')} className={`p-4 rounded-2xl ${activeTab === 'explore' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'text-slate-400'}`}><Compass size={22}/></button>
        <button onClick={() => setActiveTab('profile')} className={`p-4 rounded-2xl ${activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'text-slate-400'}`}><User size={22}/></button>
        {isAdmin && <button onClick={() => setActiveTab('dev')} className={`p-4 rounded-2xl ${activeTab === 'dev' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'text-slate-400'}`}><Terminal size={22}/></button>}
      </nav>
    </div>
  );
}
