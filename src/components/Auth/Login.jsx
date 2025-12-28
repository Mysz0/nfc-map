import React from 'react';
import { MapPin, Sun, Moon, Github, Chrome } from 'lucide-react';
import { supabase } from '../../supabase';

export default function Login({ theme, setTheme, isDark, colors }) {
  
  // Create a reusable function for logins
  const handleLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({ 
      provider: provider,
      options: {
        // This ensures they come back to the right page after logging in
        redirectTo: window.location.origin 
      }
    });
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6 relative`}>
      {/* Theme Toggle */}
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

      {/* Logo Icon */}
      <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3">
        <MapPin size={32} className="text-white" />
      </div>

      <h1 className={`text-4xl font-black mb-10 tracking-tighter italic uppercase ${colors.text}`}>
        UrbanRadar<span className="text-emerald-500">.</span>
      </h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* GOOGLE BUTTON */}
        <button 
          onClick={() => handleLogin('google')} 
          className="flex items-center justify-center gap-3 bg-white text-zinc-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-zinc-50 transition-all border border-zinc-200"
        >
          <Chrome size={20} className="text-emerald-500" />
          Continue with Google
        </button>

        {/* GITHUB BUTTON */}
        <button 
          onClick={() => handleLogin('github')} 
          className="flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all border border-white/10"
        >
          <Github size={20} />
          Continue with GitHub
        </button>
      </div>

      <p className="mt-12 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] opacity-40">
        Free Secure Auth via Supabase
      </p>
    </div>
  );
}
