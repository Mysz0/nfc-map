import React from 'react';
import { MapPin, Sun, Moon, Github, Chrome } from 'lucide-react';
import { supabase } from '../../supabase';

export default function Login({ theme, setTheme, isDark }) {
  
  const handleLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({ 
      provider: provider,
      options: {
        redirectTo: window.location.origin 
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--theme-map-bg)] text-[var(--theme-text-title)] p-6 relative transition-colors duration-700">
      
      {/* Theme Toggle - Positioned to match the App's ThemeToggle feel */}
      <button 
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
        className="fixed top-12 right-6 p-3.5 rounded-2xl border smart-glass transition-all z-[10000] active:scale-90"
      >
        {isDark ? (
          <Sun size={18} className="text-[rgb(var(--theme-primary))]" />
        ) : (
          <Moon size={18} className="text-[rgb(var(--theme-primary))]" />
        )}
      </button>

      {/* Logo Icon - Using Theme Primary for the base */}
      <div className="w-16 h-16 bg-[rgb(var(--theme-primary))] rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3 shadow-[var(--theme-primary-glow)]">
        <MapPin size={32} className="text-white" />
      </div>

      <h1 className="text-4xl font-black mb-10 tracking-tighter italic uppercase">
        UrbanRadar<span className="text-[rgb(var(--theme-primary))]">.</span>
      </h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* GOOGLE BUTTON - Light glass style */}
        <button 
          onClick={() => handleLogin('google')} 
          className="flex items-center justify-center gap-3 bg-white text-zinc-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-zinc-50 transition-all border border-zinc-200 active:scale-95"
        >
          <Chrome size={20} className="text-[rgb(var(--theme-primary))]" />
          Continue with Google
        </button>

        {/* GITHUB BUTTON - Dark/Solid style */}
        <button 
          onClick={() => handleLogin('github')} 
          className="flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all border border-white/10 active:scale-95"
        >
          <Github size={20} />
          Continue with GitHub
        </button>
      </div>

      <div className="mt-12 flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
          Free Secure Auth via Supabase
        </p>
        {/* Visual indicator of active theme name */}
        <div className="px-3 py-1 rounded-full border border-current opacity-20 text-[8px] uppercase font-bold tracking-tighter">
          Engine: {theme}
        </div>
      </div>
    </div>
  );
}
