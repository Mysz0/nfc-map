import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Map, LogIn, LogOut, Save, CheckCircle } from 'lucide-react';
import { supabase } from './supabase'; 

const SPOTS = {
  'spot-001': { id: 'spot-001', name: 'Central Park Fountain', lat: 40.7829, lng: -73.9654, radius: 100, points: 50 },
  'spot-002': { id: 'spot-002', name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, radius: 100, points: 75 },
  'spot-003': { id: 'spot-003', name: 'Times Square', lat: 40.7580, lng: -73.9855, radius: 100, points: 100 },
  'spot-004': { id: 'spot-004', name: 'Empire State Building', lat: 40.7484, lng: -73.9857, radius: 100, points: 150 },
  'spot-005': { id: 'spot-005', name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445, radius: 100, points: 200 },
};

export default function App() {
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    const fetchProfile = async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUnlockedSpots(data.unlocked_spots || []);
        setUsername(data.username || '');
        setTempUsername(data.username || '');
      }
    };

    initApp();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const saveUsername = async () => {
    setIsSaving(true);
    const cleanedUsername = tempUsername.replace('@', '').trim();
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: cleanedUsername });
    
    if (!error) {
      setUsername(cleanedUsername);
      alert("Username updated!");
    } else {
      alert("Username might be taken.");
    }
    setIsSaving(false);
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (SPOTS[id]?.points || 0), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-500 font-mono">INITIALIZING...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40 rotate-3">
          <MapPin size={40} />
        </div>
        <h1 className="text-5xl font-black mb-2 tracking-tighter italic">SPOT<span className="text-emerald-500">HUNT</span></h1>
        <p className="mb-8 opacity-60 max-w-[280px]">The city is your playground. Scan tags, claim spots, level up.</p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } })}
          className="bg-white text-black px-10 py-4 rounded-2xl font-black flex items-center gap-3 active:scale-95 transition-all shadow-xl"
        >
          <LogIn size={20}/> START HUNTING
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white p-8 pt-16 rounded-b-[48px] shadow-2xl relative z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">
              {username ? `@${username}` : 'New Hunter'}
            </h1>
            <p className="text-emerald-400 text-xs font-mono font-bold opacity-80 mt-1">{user.email}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all">
            <LogOut size={20}/>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-md mx-auto px-6 relative z-20 -mt-10">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* STATS CARD */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-5xl font-black text-slate-900 leading-none">{totalPoints}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Points Total</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 leading-none">{unlockedSpots.length}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Spots Found</p>
              </div>
            </div>

            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-emerald-500"/> ACTIVITY LOG
            </h2>
            
            <div className="space-y-3">
              {unlockedSpots.length === 0 ? (
                <div className="bg-slate-100 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-sm uppercase">No spots claimed yet</p>
                </div>
              ) : (
                [...unlockedSpots].reverse().map(id => (
                  <div key={id} className="bg-white p-5 rounded-3xl flex items-center justify-between border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <MapPin size={22} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight">{SPOTS[id].name}</p>
                        <p className="text-xs font-bold text-emerald-500">+{SPOTS[id].points} POINTS</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 pt-12">
            <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Hunter Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">@</span>
                <input 
                  type="text" 
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="username"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-10 pr-4 font-black text-slate-800 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <button 
                onClick={saveUsername}
                disabled={isSaving}
                className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {isSaving ? 'SAVING...' : <><Save size={20}/> UPDATE PROFILE</>}
              </button>
            </div>

            <div className="bg-emerald-500 p-8 rounded-[32px] text-white shadow-lg shadow-emerald-500/30">
              <p className="font-black text-xl mb-1 italic">HUNTER LEVEL 1</p>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Global Ranking: #999</p>
            </div>
          </div>
        )}
      </div>

      {/* TAB NAVIGATION */}
      <nav className="fixed bottom-8 left-6 right-6 bg-slate-900 rounded-[32px] p-2 shadow-2xl z-50">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40' : 'text-slate-500'}`}>
            <Home size={24}/>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`p-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40' : 'text-slate-500'}`}>
            <User size={24}/>
          </button>
        </div>
      </nav>
    </div>
  );
}
