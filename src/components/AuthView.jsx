import React from 'react';
import { MapPin } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const AuthView = ({ colors, supabase, themeProps }) => (
  <div className={`min-h-screen flex flex-col items-center justify-center ${colors.bg} p-6 relative`}>
    <ThemeToggle {...themeProps} />
    <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 rotate-3">
      <MapPin size={32} className="text-white" />
    </div>
    <h1 className={`text-3xl font-bold mb-8 tracking-tight ${colors.text}`}>SpotHunt</h1>
    <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} 
      className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
      Sign in with GitHub
    </button>
  </div>
);

export default AuthView;
