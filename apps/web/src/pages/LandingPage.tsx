import React from 'react';
import { Feather, Compass, ShieldCheck, Heart, Sparkles, BookOpen, Lock, ArrowRight, Quote } from 'lucide-react';
import { LiteraryCanvas } from '../components/three/LiteraryCanvas';

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const featuredSamples = [
    {
      title: "खामोशी का शोर",
      type: "Shayari",
      language: "Hindi",
      mood: "Silence",
      author: "काव्यात्मक मन",
      excerpt: "कुछ बातें खामोशी में ही पूरी होती हैं,\nहर लफ़्ज़ को आवाज़ की ज़रूरत नहीं होती।\nजो समझ सके दिल की धड़कनों का तराना,\nउसके लिए दूरियां भी कभी दूरी नहीं होती।",
    },
    {
      title: "Solitude at 2 A.M.",
      type: "Poem",
      language: "English",
      mood: "Heartbreak",
      author: "Aria Thorne",
      excerpt: "The stars do not gossip with the night;\nthey burn in ancient silence.\nAnd in this paper cup of shadows,\nI learn to forgive my own unwritten endings.",
    },
    {
      title: "Zindagi Ki Dhoop",
      type: "Reflection",
      language: "Hinglish",
      mood: "Life",
      author: "Sameer V.",
      excerpt: "Waqt ke sath sab badalta hai dost,\nbas ek kitaab ke panne hain jo sach bolte hain.\nKhwahishein to bepanah thin,\npar sukoon purani shayriyon me mila.",
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* 3D Atmospheric Background */}
      <LiteraryCanvas />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-verse-violet/30 bg-verse-violet/10 backdrop-blur-md mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-verse-violet" />
          <span className="text-xs font-medium text-ivory-100 tracking-wide">
            The Digital Sanctuary for Literary Minds
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ivory-50 max-w-4xl mx-auto leading-tight sm:leading-[1.15]">
          Where Thoughts Turn to Poetry, and Words Find a Soul.
        </h1>

        <p className="mt-6 font-serif text-lg sm:text-xl text-ivory-300 max-w-2xl mx-auto italic font-normal">
          "हर जज़्बात को एक पन्ना चाहिए, हर एहसास को एक आवाज़।"
        </p>

        <p className="mt-4 text-sm sm:text-base text-ivory-400 max-w-2xl mx-auto leading-relaxed">
          A distraction-free writing studio and community for Shayari, poetry, quotes, and quiet reflections. Designed with total privacy, warm editorial typography, and multilingual dignity.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('studio')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-verse-violet via-verse-indigo to-verse-rose text-ivory-50 font-medium text-base shadow-xl shadow-verse-violet/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Feather className="w-5 h-5" />
            <span>Start Writing</span>
          </button>

          <button
            onClick={() => onNavigate('explore')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-ivory-200 font-medium text-base hover:text-ivory-50 hover:bg-charcoal-800/60 border border-charcoal-700/80 transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-5 h-5 text-verse-violet" />
            <span>Explore Literature</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl glass-panel border border-charcoal-800">
            <Lock className="w-5 h-5 text-verse-violet mb-2" />
            <h3 className="text-sm font-semibold text-ivory-100">Private by Default</h3>
            <p className="text-xs text-ivory-400 mt-1">Drafts stay strictly private until you explicitly choose to publish.</p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-charcoal-800">
            <Feather className="w-5 h-5 text-verse-rose mb-2" />
            <h3 className="text-sm font-semibold text-ivory-100">Frictionless Studio</h3>
            <p className="text-xs text-ivory-400 mt-1">Live autosave, stanza typography, mood tags, and draft revision history.</p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-charcoal-800">
            <BookOpen className="w-5 h-5 text-verse-amber mb-2" />
            <h3 className="text-sm font-semibold text-ivory-100">Hindi & Devanagari</h3>
            <p className="text-xs text-ivory-400 mt-1">Tailored typography for Devanagari Shayari, English verse, and Hinglish.</p>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-charcoal-800">
            <ShieldCheck className="w-5 h-5 text-verse-teal mb-2" />
            <h3 className="text-sm font-semibold text-ivory-100">Creator Ownership</h3>
            <p className="text-xs text-ivory-400 mt-1">Export full JSON archives of your words anytime with zero lock-in.</p>
          </div>
        </div>
      </section>

      {/* Featured Literature Showcase */}
      <section className="relative z-10 py-16 bg-charcoal-900/50 border-t border-b border-charcoal-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold text-ivory-50 tracking-tight">
              Voices of Verseora
            </h2>
            <p className="text-sm text-ivory-400 mt-2">
              Discover raw reflections and crafted lines from contemporary poets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSamples.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl glass-panel p-6 border border-charcoal-800/80 flex flex-col justify-between hover:border-verse-violet/40 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-verse-violet/10 text-verse-violet border border-verse-violet/20">
                      {item.type} · {item.mood}
                    </span>
                    <Quote className="w-4 h-4 text-ivory-400 group-hover:text-verse-rose transition-colors" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-ivory-100 mb-3 group-hover:text-verse-violet transition-colors">
                    {item.title}
                  </h3>

                  <p className="font-serif text-sm text-ivory-300 leading-loose whitespace-pre-line italic">
                    {item.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-ivory-400">
                  <span className="font-medium text-ivory-300">— {item.author}</span>
                  <button
                    onClick={() => onNavigate('explore')}
                    className="flex items-center space-x-1 text-verse-violet hover:underline"
                  >
                    <span>Read more</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy & Privacy Banner */}
      <section className="relative z-10 py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-charcoal-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-verse-violet/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-verse-rose/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ivory-50 mb-4">
            A sanctuary, not an algorithm.
          </h2>
          <p className="text-sm sm:text-base text-ivory-300 max-w-2xl mx-auto leading-relaxed">
            Verseora is built without sensationalism, infinite noise, or algorithmic rage. Here, writing is celebrated as an intimate art form. Save personal thoughts for your own eyes, or share them gently with readers who cherish meaningful lines.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('auth', { mode: 'register' })}
              className="px-6 py-3 rounded-xl bg-verse-violet text-ivory-50 font-medium text-sm hover:bg-verse-violet/90 transition shadow-lg shadow-verse-violet/20"
            >
              Join the Literary Community
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

