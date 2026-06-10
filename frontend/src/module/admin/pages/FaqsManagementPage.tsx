import { useState, useEffect } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import adminService from '../../../core/services/admin.service';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export const FaqsManagementPage = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  
  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('General');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFaqs();
  }, []);

  useEffect(() => {
    filterAndSearchFaqs();
  }, [faqs, searchQuery, selectedCategory]);

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.listFaqsAdmin();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSearchFaqs = () => {
    let result = [...faqs];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(faq => faq.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.category.toLowerCase().includes(query)
      );
    }

    // Sort by order
    result.sort((a, b) => a.order - b.order);
    setFilteredFaqs(result);
  };

  const handleOpenAddModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory('General');
    setOrder(faqs.length > 0 ? Math.max(...faqs.map(f => f.order)) + 1 : 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || 'General');
    setOrder(faq.order || 0);
    setIsActive(faq.isActive);
    setIsModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      alert('Question and Answer are required');
      return;
    }

    try {
      setIsSaving(true);
      const faqData = { question, answer, category, order, isActive };

      if (editingFaq) {
        // Update FAQ
        const updated = await adminService.updateFaq(editingFaq._id, faqData);
        setFaqs(prev => prev.map(f => (f._id === editingFaq._id ? updated : f)));
      } else {
        // Create FAQ
        const created = await adminService.createFaq(faqData);
        setFaqs(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('Failed to save FAQ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) return;

    try {
      await adminService.deleteFaq(faqId);
      setFaqs(prev => prev.filter(f => f._id !== faqId));
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  const handleToggleActive = async (faq: FaqItem) => {
    try {
      const updated = await adminService.updateFaq(faq._id, {
        isActive: !faq.isActive
      });
      setFaqs(prev => prev.map(f => (f._id === faq._id ? updated : f)));
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      alert('Failed to update status');
    }
  };

  // Get unique categories for filtering
  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category || 'General')))];

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">FAQs Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Add, edit, or configure Frequently Asked Questions for customers</p>
            </div>
            
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-95 self-start md:self-auto"
            >
              <MaterialSymbol name="add" size={20} />
              Add New FAQ
            </button>
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by question, answer, category..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 focus:border-blue-500 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none w-full text-sm dark:text-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MaterialSymbol name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap uppercase tracking-wider">Category:</span>
              <select
                className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* FAQ Table Card */}
              <div className="bg-white dark:bg-[#151515] border border-gray-200/60 dark:border-gray-800/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#1d2327]/30 border-b border-gray-200 dark:border-gray-800">
                        <th className="p-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider w-16">Order</th>
                        <th className="p-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider w-32">Category</th>
                        <th className="p-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Question & Answer</th>
                        <th className="p-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider w-24 text-center">Status</th>
                        <th className="p-4 text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider w-32 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                      {filteredFaqs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <MaterialSymbol name="help_outline" size={40} className="text-gray-300" />
                              <span className="font-semibold text-sm">No FAQs found</span>
                              <span className="text-xs text-gray-400">Try matching filters or add a new FAQ.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredFaqs.map((faq) => (
                          <tr
                            key={faq._id}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors"
                          >
                            <td className="p-4 font-bold text-gray-800 dark:text-gray-300">
                              {faq.order}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                                {faq.category}
                              </span>
                            </td>
                            <td className="p-4 space-y-1 max-w-md">
                              <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                                {faq.question}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed truncate-2-lines">
                                {faq.answer}
                              </p>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleActive(faq)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                  faq.isActive
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                                    : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                                }`}
                              >
                                <span className={`size-1.5 rounded-full ${faq.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {faq.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(faq)}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  title="Edit FAQ"
                                >
                                  <MaterialSymbol name="edit" size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFaq(faq._id)}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  title="Delete FAQ"
                                >
                                  <MaterialSymbol name="delete" size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 flex items-center justify-center transition-colors"
              >
                <MaterialSymbol name="close" size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFaq} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Question */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</label>
                <input
                  type="text"
                  required
                  placeholder="Enter question..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm dark:text-white transition-all"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              {/* Answer */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Answer</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed answer..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm dark:text-white transition-all resize-y"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. General, Wallet, Chats"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm dark:text-white transition-all"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                {/* Order */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm dark:text-white transition-all"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-200/60 dark:border-gray-800/60">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Active Status</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Toggle whether this FAQ is visible to customers</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-md text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline styles for line truncations & keyframe animations */}
      <style>{`
        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
