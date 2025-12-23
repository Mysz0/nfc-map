import React, { useState, useEffect } from 'react';
import { MapPin, Trophy, User, Home, Map, LogIn, LogOut } from 'lucide-react';
import { supabase } from './supabase'; 

const SPOTS = {
  'spot-001': { id: 'spot-001', name: 'Central Park Fountain', lat: 40.7829, lng: -73.9654, radius: 100, points: 50 },
  'spot-002': { id: 'spot-002', name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969, radius: 100, points: 75 },
  'spot-003': { id: 'spot-003', name: 'Times Square', lat: 40.7580, lng: -73.9855, radius: 100, points: 100 },
  'spot-004': { id: 'spot-004', name: 'Empire State Building', lat: 40.7484, lng: -73.9857, radius: 100, points: 150 },
  'spot-005': { id: 'spot-005', name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445, radius: 100, points: 200 },
};

const App = () => {
  const [unlockedSpots, setUnlockedSpots] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchProgress(session.user.id);
      setLoading(false);
    };

    const fetchProgress = async (userId) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setUnlockedSpots(data.unlocked_spots || []);
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProgress(session.user.id);
    });

    const params = new URLSearchParams(window.location.search);
    const spotId = params.get('spot');
    if (spotId) verifyAndUnlock(spotId);

    return () => authListener.subscription.unsubscribe();
  }, []);

  const verifyAndUnlock = async (spotId) => {
    if (!user) return;
    setIsVerifying(true);
    try {
      const position = await new Promise((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
      );
      const spot = SPOTS[spotId];
      if (!spot) return;

      // Distance calculation
      const dist = Math.sqrt(
        Math.pow(position.coords.latitude - spot.lat, 2) + 
        Math.pow(position.coords.longitude - spot.lng, 2)
      ) * 111320;

      if (dist <= spot.radius && !unlockedSpots.includes(spotId)) {
        const newUnlocked = [...unlockedSpots, spotId];
        const newPoints = newUnlocked.reduce((sum, id) => sum + (SPOTS[id]?.points || 0), 0);
        
        await supabase.from('profiles').upsert({ 
          id: user.id, 
          unlocked_spots: newUnlocked, 
          total_points: newPoints 
        });
        setUnlockedSpots(newUnlocked);
        alert(`Spot Unlocked: ${spot.name}!`);
      } else if (dist > spot.radius) {
        alert(`Too far! You are ${Math.round(dist)}m away.`);
      }
    } catch (err) { 
      console.error(err);
      alert("Location access required to unlock spots.");
    } finally { 
      setIsVerifying(false); 
    }
  };

  const totalPoints = unlockedSpots.reduce((sum, id) => sum + (SPOTS[id]?.points || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-slate-600">Syncing with Cloud...</p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
          <MapPin size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-emerald-400">SpotHunt</h1>
        <p className="mb-8 opacity-70 text-center">Scan physical NFC tags to discover secret locations.</p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
          className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-100 transition-colors shadow-xl"
        >
          <LogIn size={20}/> Login with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 pt-12 pb-10 rounded-b-[40px] shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">SpotHunt</h1>
            <p className="text-slate-400 text-xs font-mono">{user.email}</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="p-3 bg-slate-800 rounded-2xl hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={20} className="text-slate-300"/>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-4xl font-black text-slate-900">{totalPoints}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Points</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">{unlockedSpots.length}/{Object.keys(SPOTS).length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">Discovery</p>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
            <div className="grid gap-3">
               {unlockedSpots.length === 0 ? (
                 <div className="text-center py-10 bg-slate-200/50 rounded-3xl border-2 border-dashed border-slate-300">
                    <MapPin className="mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500 text-sm">No locations found yet.</p>
                 </div>
               ) : (
                [...unlockedSpots].reverse().map(id => (
                  <div key={id} className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Trophy size={20}/>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{SPOTS[id].name}</p>
                      <p className="text-xs text-emerald-600 font-bold">+{SPOTS[id].points} PTS</p>
                    </div>
                  </div>
                ))
               )}
            </div>
          </div>
        )}

        {activeTab === 'map' && (
           <div className="space-y-4 pt-4">
             <h2 className="text-lg font-bold text-slate-800">Location Directory</h2>
             {Object.values(SPOTS).map(spot => {
               const found = unlockedSpots.includes(spot.id);
               return (
                <div key={spot.id} className={`p-4 rounded-2xl border-2 transition-all ${found ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 opacity-70'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${found ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {found ? <MapPin size={16}/> : <span className="text-xs font-bold">?</span>}
                      </div>
                      <p className={`font-bold ${found ? 'text-slate-800' : 'text-slate-400'}`}>
                        {found ? spot.name : "Locked Location"}
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-400">{spot.points} PTS</span>
                  </div>
                </div>
               );
             })}
           </div>
        )}

        {activeTab === 'profile' && (
          <div className="pt-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg">
                <User size={40} className="text-slate-400" />
              </div>
              <p className="font-bold text-slate-800">{user.email?.split('@')[0]}</p>
              <p className="text-xs text-slate-500 mb-4">Hunter Level 1</p>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(unlockedSpots.length / 5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900 rounded-[32px] p-2 shadow-2xl z-40">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('home')} className={`p-4 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-emerald-500 text-white scale-110 shadow-lg' : 'text-slate-500'}`}><Home/></button>
          <button onClick={() => setActiveTab('map')} className={`p-4 rounded-2xl transition-all ${activeTab === 'map' ? 'bg-emerald-500 text-white scale-110 shadow-lg' : 'text-slate-500'}`}><Map/></button>
          <button onClick={() => setActiveTab('profile')} className={`p-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-emerald-500 text-white scale-110 shadow-lg' : 'text-slate-500'}`}><User/></button>
        </div>
      </nav>

      {/* Verification Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black text-xl tracking-widest animate-pulse">VERIFYING LOCATION...</p>
        </div>
      )}
    </div>
  );
};

export default App;
