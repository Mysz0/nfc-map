import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Compass, LogOut, Save, Terminal, Zap, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from './supabase'; 

// --- CONFIG ---
// Pulls from .env (VITE_ADMIN_UID)
const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

const SPOTS = {
  'spot-001': { id: 'spot-001', name: 'Central Park Fountain', lat: 40.7829, lng: -73.9654, points: 50 },
  'spot-002': { id: 'spot-002', name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, points: 75 },
  'spot-003': { id: 'spot-003', name: 'Times Square', lat: 40.7580, lng: -73.9855, points: 100 },
  'spot-004': { id: 'spot-004', name: 'Empire State Building', lat: 40.7484, lng: -73.9857, points: 150 },
  'spot-005': { id: 'spot-005', name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445, points: 200 },
};

export default function App() {
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [mapCenter] = useState([40.730610, -73.935242]);

  // Security Check
  const isAdmin = user?.id === ADMIN_UID;

  useEffect(() => {
    const initApp = async () => {
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

  // --- LOGIC ---
  const claimSpot = async (spotId) => {
    // Basic double-claim prevention
    if (unlockedSpots.includes(spotId)) return;

    const newUnlocked = [...unlockedSpots, spotId];
    const { error } = await supabase
      .from('profiles')
      .update({ unlocked_spots: newUnlocked })
      .eq('id', user.id);

    if (!error) setUnlockedSpots(newUnlocked);
  };

  const resetProgress = async () => {
    if (!isAdmin) return;
    const { error } = await supabase
      .from('profiles')
      .update({ unlocked_spots: [] })
      .eq('id', user.id);
    
    if (!error) {
      setUnlockedSpots([]);
      alert("Database wiped for your account.");
    }
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (SPOTS[id]?.points || 0), 0);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-black text-emerald-500 italic animate-pulse">
      INITIALIZING...
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <h1 className="text-5xl font-black mb-8 italic tracking-tighter uppercase text-center">
          SPOT<span className="text-emerald-500">HUNT</span>
        </h1>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
          className="bg-white text-black px-12 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
        >
          LOGIN WITH GITHUB
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-emerald-500">
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-8 pt-16 pb-24 rounded-b-[48px] shadow-2xl relative border-b-4 border-emerald-500/20">
        <div className="max-w-md mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-tight">
              {username || 'HUNTER'} {isAdmin && "👑"}
            </h1>
            <p className="text-slate-500 text-xs font-mono font-bold">{user.email}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20}/>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-14 relative z-20">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-5xl font-black text-slate-900 leading-none">{totalPoints}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 leading-none">{unlockedSpots.length}/5</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Claimed</p>
              </div>
            </div>

            <h2 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
              <Trophy size={20} className="text-emerald-500"/> COLLECTION
            </h2>
            <div className="space-y-3">
              {unlockedSpots.length === 0 ? (
                <div className="bg-slate-100 rounded-[32px] p-10 text-center border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs uppercase italic">
                  No spots claimed yet.
                </div>
              ) : (
                unlockedSpots.map(id => (
                  <div key={id} className="bg-white p-5 rounded-3xl flex items-center gap-4 border border-slate-100 shadow-sm font-black text-slate-800 uppercase text-sm">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-black">✓</div>
                    {SPOTS[id]?.name}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-[40px] p-2 shadow-2xl border border-slate-100 h-[450px] relative overflow-hidden">
              <MapContainer key={activeTab} center={mapCenter} zoom={12} className="h-full w-full rounded-[32px]">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {Object.values(SPOTS).map(spot => (
                  <Marker key={spot.id} position={[spot.lat, spot.lng]}>
                    <Popup>
                      <div className="p-1 font-black text-slate-900 uppercase text-xs">
                        {spot.name} <br/>
                        <span className="text-emerald-500">
                          {unlockedSpots.includes(spot.id) ? 'CLAIMED' : `${spot.points} PTS`}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 space-y-6 text-center animate-in zoom-in-95">
             <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-400">
               <User size={40}/>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified Hunter ID</p>
               <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-black text-slate-800">
                 @{username || 'UNSET'}
               </div>
             </div>
          </div>
        )}

        {/* --- ADMIN ONLY: CREATIVE MODE --- */}
        {(activeTab === 'dev' && isAdmin) && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-4 shadow-2xl border-4 border-emerald-500/30">
              <h2 className="text-xl font-black text-emerald-500 uppercase italic flex items-center gap-2">
                <Terminal/> DEV_CONSOLE
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Manual Signal Override</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(SPOTS).map(spot => (
                  <button 
                    key={spot.id} 
                    onClick={() => claimSpot(spot.id)}
                    disabled={unlockedSpots.includes(spot.id)}
                    className={`p-4 rounded-2xl font-black text-xs uppercase flex justify-between items-center transition-all ${unlockedSpots.includes(spot.id) ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 hover:bg-emerald-600'}`}
                  >
                    {spot.name} <Zap size={14}/>
                  </button>
                ))}
              </div>
              <button 
                onClick={resetProgress} 
                className="w-full bg-red-600/10 text-red-500 py-4 rounded-2xl font-black text-xs uppercase mt-4 hover:bg-red-600 hover:text-white transition-all"
              >
                WIPE ALL PROGRESS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NAV BAR */}
      <nav className="fixed bottom-8 left-6 right-6 bg-slate-900/95 backdrop-blur-lg rounded-[32px] p-2 shadow-2xl z-[9999] flex justify-around items-center border border-white/10">
        <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}><Home size={22}/></button>
        <button onClick={() => setActiveTab('explore')} className={`p-4 rounded-2xl transition-all ${activeTab === 'explore' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}><Compass size={22}/></button>
        <button onClick={() => setActiveTab('profile')} className={`p-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}><User size={22}/></button>
        
        {/* DEV ICON - HIDDEN FOR USERS */}
        {isAdmin && (
          <button onClick={() => setActiveTab('dev')} className={`p-4 rounded-2xl transition-all ${activeTab === 'dev' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>
            <Terminal size={22}/>
          </button>
        )}
      </nav>
    </div>
  );
}
