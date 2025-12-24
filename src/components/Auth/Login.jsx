import React from 'react';
import { MapPin, Sun, Moon } from 'lucide-react';
import { supabase } from '../../supabase';

export default function Login({ theme, setTheme, isDark, colors }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6 relative`}>
      <button 
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
        className={`fixed top-12 right-6 p-3.5 rounded-2xl border transition-all z-[10000] ${
          isDark 
            ? 'bg-zinc-900/80 border-white/10 text-emerald-400' 
            : 'bg-white/80 border-emerald-200 text-emerald-600 shadow-lg'
        }`}
      >
        {isDark ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3">
        <MapPin size={32} className="text-white" />
      </div>

      <h1 className={`text-3xl font-bold mb-8 ${colors.text}`}>SpotHunt</h1>
      
      <button 
        onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
        className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
