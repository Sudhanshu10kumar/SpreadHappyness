import React, { useState, useEffect, useRef } from 'react';
import {
  Feather,
  Save,
  Send,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Globe,
  Share2,
  CheckCircle2,
  Clock,
  Type,
  Maximize2,
  Minimize2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ContentType, Language, Mood, Visibility } from '@verseora/shared-types';

interface StudioPageProps {
  postId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const StudioPage: React.FC<StudioPageProps> = ({ postId, onNavigate }) => {
  const { user } = useAuth();

  // Document state
  const [currentPostId, setCurrentPostId] = useState<string | undefined>(postId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<ContentType>('poem');
  const [language, setLanguage] = useState<Language>('hindi');
  const [mood, setMood] = useState<Mood>('silence');
  const [tagsInput, setTagsInput] = useState('');
  const [fontFamily, setFontFamily] = useState<'serif' | 'devanagari' | 'sans'>('serif');
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // UI state
  const [isPreview, setIsPreview] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [chosenVisibility, setChosenVisibility] = useState<Visibility>('public');
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing post if editing
  useEffect(() => {
    if (postId) {
      api.getPost(postId).then(post => {
        setTitle(post.title);
        setContent(post.content.replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/?[^>]+(>|$)/g, ''));
        setContentType(post.content_type as ContentType);
        setLanguage(post.language as Language);
        if (post.mood) setMood(post.mood as Mood);
        if (post.tags) setTagsInput(post.tags.join(', '));
        setCurrentPostId(post.id);
        setSaveStatus('saved');
      }).catch(err => {
        console.error('Could not load draft for editing', err);
      });
    }
  }, [postId]);

  // Autosave mechanism
  const triggerAutoSave = (newTitle: string, newContent: string) => {
    setSaveStatus('unsaved');
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(async () => {
      if (!newTitle.trim() && !newContent.trim()) return;

      setSaveStatus('saving');
      try {
        const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        const htmlFormatted = newContent.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`).join('');

        if (currentPostId) {
          // Update existing
          await api.updatePost(currentPostId, {
            title: newTitle || 'Untitled Draft',
            content: htmlFormatted,
            content_type: contentType,
            language,
            mood,
            tags,
          });
        } else {
          // Create initial private draft
          const created = await api.createDraft({
            title: newTitle || 'Untitled Draft',
            content: htmlFormatted,
            content_type: contentType,
            language,
            mood,
            tags,
          });
          setCurrentPostId(created.id);
        }

        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        setSaveStatus('unsaved');
      }
    }, 2000);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutoSave(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerAutoSave(title, val);
  };

  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const htmlFormatted = content.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`).join('');

      if (currentPostId) {
        await api.updatePost(currentPostId, {
          title: title || 'Untitled Draft',
          content: htmlFormatted,
          content_type: contentType,
          language,
          mood,
          tags,
        });
      } else {
        const created = await api.createDraft({
          title: title || 'Untitled Draft',
          content: htmlFormatted,
          content_type: contentType,
          language,
          mood,
          tags,
        });
        setCurrentPostId(created.id);
      }
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveStatus('unsaved');
    }
  };

  const handleConfirmPublish = async () => {
    if (!title.trim()) {
      alert('Please provide a title before publishing.');
      return;
    }
    if (!content.trim()) {
      alert('Please write some content before publishing.');
      return;
    }

    setPublishing(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const htmlFormatted = content.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`).join('');

      let targetId = currentPostId;
      if (!targetId) {
        const created = await api.createDraft({
          title: title.trim(),
          content: htmlFormatted,
          content_type: contentType,
          language,
          mood,
          tags,
        });
        targetId = created.id;
        setCurrentPostId(created.id);
      }

      // Update with explicit status="published" and author-selected visibility
      const published = await api.updatePost(targetId!, {
        title: title.trim(),
        content: htmlFormatted,
        content_type: contentType,
        language,
        mood,
        tags,
        status: 'published',
        visibility: chosenVisibility,
      });

      setPublishModalOpen(false);

      // Celebrate publish action
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b7cf6', '#f43f5e', '#faf8f5', '#fbbf24']
      });

      // Navigate to reader or dashboard
      setTimeout(() => {
        onNavigate('reading', { slug: published.slug || published.id });
      }, 1200);

    } catch (err: any) {
      alert(err.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  // Metrics
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className={`min-h-screen transition-all ${isDistractionFree ? 'bg-charcoal-950 p-4 sm:p-12' : 'max-w-5xl mx-auto px-4 sm:px-6 py-8'}`}>
      {/* Studio Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-charcoal-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-verse-violet/10 text-verse-violet flex items-center justify-center border border-verse-violet/20">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-ivory-50 tracking-tight">Writing Studio</h1>
            <div className="flex items-center space-x-2 text-[11px] text-ivory-400">
              {saveStatus === 'saving' && (
                <span className="text-verse-amber flex items-center space-x-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>Saving draft...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-verse-teal flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Autosaved {lastSavedTime ? `at ${lastSavedTime}` : ''}</span>
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="text-ivory-400">Unsaved changes</span>
              )}
              <span>•</span>
              <span className="text-verse-amber flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Private Draft</span>
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center space-x-2">
          {/* Distraction Free Toggle */}
          <button
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            title={isDistractionFree ? 'Exit distraction free mode' : 'Distraction free mode'}
            className="p-2 rounded-lg glass-panel hover:bg-charcoal-800 text-ivory-400 hover:text-ivory-50 transition"
          >
            {isDistractionFree ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-panel transition ${
              isPreview ? 'text-verse-violet border-verse-violet/40' : 'text-ivory-300 hover:text-ivory-50'
            }`}
          >
            {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Edit Mode' : 'Reading Preview'}</span>
          </button>

          {/* Manual Save */}
          <button
            onClick={handleManualSave}
            className="p-2 rounded-lg glass-panel hover:bg-charcoal-800 text-ivory-300 hover:text-ivory-50 transition"
            title="Save Draft"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Publish Trigger */}
          <button
            onClick={() => setPublishModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-verse-violet to-verse-indigo text-ivory-50 text-xs font-medium shadow-md shadow-verse-violet/20 hover:opacity-95 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Verse</span>
          </button>
        </div>
      </div>

      {/* Editor Configuration Options Bar (Hidden in preview or full distraction free) */}
      {!isPreview && !isDistractionFree && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl glass-panel border border-charcoal-800 mb-6 text-xs">
          {/* Content Type */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-ivory-400 mb-1">Genre / Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-ivory-200 focus:outline-none focus:border-verse-violet"
            >
              <option value="poem">Poem (कविता)</option>
              <option value="shayari">Shayari (शायरी)</option>
              <option value="thought">Thought (विचार)</option>
              <option value="quote">Quote (उद्धरण)</option>
              <option value="reflection">Reflection (मनन)</option>
              <option value="story">Story (लघुकथा)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-ivory-400 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-ivory-200 focus:outline-none focus:border-verse-violet"
            >
              <option value="hindi">Hindi (हिंदी)</option>
              <option value="english">English</option>
              <option value="hinglish">Hinglish</option>
              <option value="urdu">Urdu (उर्दू)</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-ivory-400 mb-1">Mood / Emotion</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value as Mood)}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-ivory-200 focus:outline-none focus:border-verse-violet"
            >
              <option value="silence">Silence (खामोशी)</option>
              <option value="love">Love (इश्क)</option>
              <option value="heartbreak">Heartbreak (दर्द)</option>
              <option value="hope">Hope (उम्मीद)</option>
              <option value="life">Life (ज़िंदगी)</option>
              <option value="motivation">Motivation (हौसला)</option>
              <option value="spirituality">Spirituality (रूहानियत)</option>
              <option value="friendship">Friendship (दोस्ती)</option>
            </select>
          </div>

          {/* Typography Family */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-ivory-400 mb-1">Script Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-ivory-200 focus:outline-none focus:border-verse-violet"
            >
              <option value="serif">Classic Serif (Playfair)</option>
              <option value="devanagari">Devanagari Literary (Noto)</option>
              <option value="sans">Clean Editorial (Sans)</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Writing Canvas / Preview Area */}
      {isPreview ? (
        <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-charcoal-800 shadow-2xl max-w-3xl mx-auto">
          <div className="text-center mb-10 pb-6 border-b border-charcoal-800/60">
            <span className="text-[11px] font-sans uppercase tracking-widest text-verse-violet px-3 py-1 rounded-full bg-verse-violet/10 border border-verse-violet/20 mb-3 inline-block">
              {contentType} · {language} · {mood}
            </span>
            <h1 className={`text-3xl sm:text-5xl font-bold text-ivory-50 tracking-tight ${
              fontFamily === 'devanagari' ? 'font-devanagari' : fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}>
              {title || 'Untitled Writing'}
            </h1>
            <p className="text-xs text-ivory-400 mt-3 font-sans">
              by {user?.full_name} (@{user?.username}) · {readingTime} min read
            </p>
          </div>

          <div className={`poem-body text-ivory-200 leading-loose whitespace-pre-line text-center text-lg sm:text-xl ${
            fontFamily === 'devanagari' ? 'font-devanagari' : fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          }`}>
            {content || 'No verse written yet.'}
          </div>

          {tagsInput && (
            <div className="mt-12 pt-6 border-t border-charcoal-800/80 flex flex-wrap gap-2 justify-center">
              {tagsInput.split(',').map((t, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-charcoal-800 text-ivory-400 border border-charcoal-700">
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Title of your poem, shayari, or reflection..."
            className={`w-full bg-transparent text-2xl sm:text-4xl font-bold text-ivory-50 placeholder:text-ivory-500 focus:outline-none border-b border-charcoal-800/80 pb-3 transition ${
              fontFamily === 'devanagari' ? 'font-devanagari' : fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
          />

          {/* Stanzas Textarea */}
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`Pour your stanzas or thoughts here...\n\n(Tip: Press Enter twice between stanzas for beautiful poem spacing)`}
            rows={16}
            className={`w-full bg-transparent text-lg sm:text-xl text-ivory-100 placeholder:text-ivory-500 focus:outline-none resize-none leading-relaxed poem-body ${
              fontFamily === 'devanagari' ? 'font-devanagari' : fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
          />

          {/* Tags Input */}
          <div className="pt-4 border-t border-charcoal-800">
            <label className="block text-[11px] font-sans uppercase tracking-wider text-ivory-400 mb-1.5">
              Tags (comma separated, e.g. dard, mohabbat, raat, zindagi)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                triggerAutoSave(title, content);
              }}
              placeholder="love, midnight, ghazal, thoughts"
              className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-ivory-200 focus:outline-none focus:ring-1 focus:ring-verse-violet"
            />
          </div>
        </div>
      )}

      {/* Editor Bottom Stats Bar */}
      <div className="mt-8 pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-ivory-400">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
          <span>•</span>
          <span>~{readingTime} min read</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span className="inline-block w-2 h-2 rounded-full bg-verse-teal animate-pulse" />
          <span>Distraction-free environment</span>
        </div>
      </div>

      {/* Explicit Publish Modal (Mandatory Privacy Choice) */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md w-full border border-charcoal-700 shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-ivory-50 mb-2">
              Publish Your Writing
            </h3>
            <p className="text-xs text-ivory-400 mb-6 leading-relaxed">
              Confirm how your verse should be shared. New entries are private until you explicitly choose public or unlisted visibility.
            </p>

            <div className="space-y-3 mb-6">
              {/* Option 1: Public */}
              <div
                onClick={() => setChosenVisibility('public')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  chosenVisibility === 'public'
                    ? 'border-verse-violet bg-verse-violet/10'
                    : 'border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-verse-violet flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ivory-100">Public Community Feed</h4>
                    <p className="text-xs text-ivory-400 mt-0.5">
                      Visible in explore feeds, search, and your public author profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Unlisted */}
              <div
                onClick={() => setChosenVisibility('unlisted')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  chosenVisibility === 'unlisted'
                    ? 'border-verse-violet bg-verse-violet/10'
                    : 'border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Share2 className="w-5 h-5 text-verse-amber flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ivory-100">Unlisted (Secret Link)</h4>
                    <p className="text-xs text-ivory-400 mt-0.5">
                      Not indexed or shown in public feeds. Accessible only via its direct link.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Private */}
              <div
                onClick={() => setChosenVisibility('private')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  chosenVisibility === 'private'
                    ? 'border-verse-violet bg-verse-violet/10'
                    : 'border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-verse-rose flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-ivory-100">Private to Me</h4>
                    <p className="text-xs text-ivory-400 mt-0.5">
                      Only visible in your personal journal. Blocked from all public APIs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-ivory-400 hover:text-ivory-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={handleConfirmPublish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-verse-violet to-verse-rose text-ivory-50 text-xs font-medium shadow-md hover:opacity-95 disabled:opacity-50 transition"
              >
                {publishing ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
