import React from 'react';
import { Feather, Heart, Globe, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-charcoal-800 bg-charcoal-950/80 backdrop-blur-md text-ivory-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-verse-violet to-verse-rose flex items-center justify-center">
              <Feather className="w-4 h-4 text-ivory-50" />
            </div>
            <span className="font-serif text-xl font-bold text-ivory-50 tracking-tight">Verseora</span>
          </div>
          <p className="text-sm max-w-md text-ivory-300 leading-relaxed font-serif italic">
            "शब्दों का सफ़र, एहसासों की मंज़िल।"
          </p>
          <p className="text-xs text-ivory-400 leading-relaxed max-w-sm">
            A sanctuary for poets, shayari composers, and reflective minds. Crafted with privacy first, editorial dignity, and multilingual harmony.
          </p>
          <div className="flex items-center space-x-4 text-xs pt-2">
            <span className="flex items-center space-x-1 text-verse-violet">
              <Globe className="w-3.5 h-3.5" />
              <span>Hindi · English · Hinglish · Unicode</span>
            </span>
            <span className="flex items-center space-x-1 text-verse-rose">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy-First Architecture</span>
            </span>
          </div>
        </div>

        {/* Discovery & Reading */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ivory-200 mb-3 font-sans">
            Literature & Moods
          </h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('explore')} className="hover:text-verse-violet transition">Shayari (शायरी)</button></li>
            <li><button onClick={() => onNavigate('explore')} className="hover:text-verse-violet transition">Contemporary Poems</button></li>
            <li><button onClick={() => onNavigate('explore')} className="hover:text-verse-violet transition">Midnight Reflections</button></li>
            <li><button onClick={() => onNavigate('explore')} className="hover:text-verse-violet transition">Nazm & Ghazal</button></li>
            <li><button onClick={() => onNavigate('explore')} className="hover:text-verse-violet transition">Micro-Thoughts & Quotes</button></li>
          </ul>
        </div>

        {/* Platform & Trust */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ivory-200 mb-3 font-sans">
            Principles & Trust
          </h4>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('settings')} className="hover:text-verse-violet transition">Data Privacy & Export</button></li>
            <li><button onClick={() => onNavigate('landing')} className="hover:text-verse-violet transition">Community Guidelines</button></li>
            <li><button onClick={() => onNavigate('landing')} className="hover:text-verse-violet transition">Anti-Spam & Moderation</button></li>
            <li><button onClick={() => onNavigate('landing')} className="hover:text-verse-violet transition">Open Architecture</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-charcoal-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-400">
        <p>© {new Date().getFullYear()} Verseora. Built with devotion to the written word.</p>
        <p className="flex items-center space-x-1 mt-2 sm:mt-0">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-verse-rose fill-verse-rose" />
          <span>for creators everywhere.</span>
        </p>
      </div>
    </footer>
  );
};

