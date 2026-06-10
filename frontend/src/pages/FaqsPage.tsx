import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../core/hooks/useTranslation';
import { MaterialSymbol } from '../shared/components/MaterialSymbol';
import userService from '../core/services/user.service';
import { MeshBackground } from '../shared/components/auth/AuthLayoutComponents';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export const FaqsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme check: Adapt colors dynamically based on customer path
  const isFemale = location.pathname.startsWith('/female');
  const accentColor = isFemale ? 'text-pink-500' : 'text-primary';
  const bgAccent = isFemale ? 'bg-pink-500/10' : 'bg-primary/10';
  const focusRing = isFemale ? 'focus:ring-pink-500/20' : 'focus:ring-primary/20';
  const spinnerBorder = isFemale ? 'border-pink-500' : 'border-primary';

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFaqs();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [faqs, searchQuery, activeCategory]);

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getFaqs();
      setFaqs(data || []);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFaqs = () => {
    let result = [...faqs];

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(faq => faq.category === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    // Sort by order
    result.sort((a, b) => (a.order || 0) - (b.order || 0));
    setFilteredFaqs(result);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category || 'General')))];

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="text-slate-900 dark:text-white font-display antialiased min-h-screen relative overflow-x-hidden bg-background-light dark:bg-[#0a0a0a]">
      {/* Dynamic Aura Background */}
      <MeshBackground />
      {isFemale && (
        <div className="absolute inset-0 bg-pink-500/5 blur-[80px] rounded-full opacity-30 pointer-events-none z-0" />
      )}

      {/* Main Content container (constrained width for app frame) */}
      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col pb-24">
        
        {/* Custom Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-background-light/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={handleBackClick}
            className={`skeuo-button size-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400`}
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back" size={20} />
          </button>
          
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">
            {t('faqs')}
          </h1>
          
          {/* Empty spacer to center title */}
          <div className="w-10" />
        </header>

        {/* Content Body */}
        <main className="p-4 space-y-6">
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl skeuo-inset bg-white/40 dark:bg-black/20 border border-white/60 dark:border-white/5 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 ${focusRing} outline-none transition-all dark:text-white`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MaterialSymbol
              name="search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600"
              size={18}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 hover:text-slate-900"
              >
                <MaterialSymbol name="close" size={16} />
              </button>
            )}
          </div>

          {/* Category Chips Carousel */}
          {!isLoading && categories.length > 2 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {categories.map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`snap-start px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? isFemale
                          ? 'skeuo-button bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                          : 'skeuo-button bg-primary text-white shadow-lg shadow-primary/20'
                        : 'skeuo-inset bg-gray-50/50 dark:bg-black/20 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Accordion Questions List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className={`relative z-10 animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${spinnerBorder}`} />
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest animate-pulse">Loading FAQ Vault...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="skeuo-card rounded-[2rem] bg-mesh-glass border-white/60 dark:border-white/5 p-8 text-center shadow-xl space-y-4">
              <div className={`skeuo-inset size-16 rounded-full flex items-center justify-center bg-transparent dark:bg-black/25 mx-auto ${accentColor}`}>
                <MaterialSymbol name="help_outline" size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">No FAQs Match</p>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Try updating your search query or switching categories.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map(faq => {
                const isExpanded = expandedId === faq._id;
                return (
                  <div
                    key={faq._id}
                    className={`skeuo-card rounded-2xl bg-mesh-glass border-white/60 dark:border-white/5 overflow-hidden transition-all duration-300 shadow-lg ${
                      isExpanded ? 'ring-1 ring-slate-200/50 dark:ring-white/5' : ''
                    }`}
                  >
                    {/* Header Trigger */}
                    <button
                      onClick={() => toggleExpand(faq._id)}
                      className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/10 dark:hover:bg-white/5"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <span className={`skeuo-inset size-7 rounded-lg flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0 ${bgAccent} ${accentColor}`}>
                          ?
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                          {faq.question}
                        </span>
                      </div>
                      <MaterialSymbol
                        name="expand_more"
                        size={20}
                        className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Collapsible Answer */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-5 pb-5 pl-16 border-t border-slate-100/50 dark:border-white/5 pt-3">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
