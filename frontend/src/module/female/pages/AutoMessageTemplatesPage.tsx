// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { useFemaleNavigation } from '../hooks/useFemaleNavigation';
import type { AutoMessageTemplate } from '../types/female.types';
import autoMessageService from '../../../core/services/autoMessage.service';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const AutoMessageTemplatesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [templates, setTemplates] = useState<AutoMessageTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await autoMessageService.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorLoadTemplates'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) return;
    try {
      const created = await autoMessageService.createTemplate({
        name: newTemplate.name,
        content: newTemplate.content,
        isEnabled: false,
      });
      setTemplates([created, ...templates]);
      setIsCreateModalOpen(false);
      setNewTemplate({ name: '', content: '' });
    } catch (err: any) { console.error(err); }
  };

  const handleUpdateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content || !editingTemplateId) return;
    try {
      const updated = await autoMessageService.updateTemplate(editingTemplateId, {
        name: newTemplate.name,
        content: newTemplate.content,
      });
      setTemplates(templates.map((t) => (t.id === editingTemplateId ? updated : t)));
      setIsEditModalOpen(false);
      setEditingTemplateId(null);
      setNewTemplate({ name: '', content: '' });
    } catch (err: any) { console.error(err); }
  };

  const handleToggleTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    try {
      const updated = await autoMessageService.updateTemplate(id, { isEnabled: !template.isEnabled });
      setTemplates(templates.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) { console.error(err); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm(t('templateDeleteConfirm'))) return;
    try {
      await autoMessageService.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err: any) { console.error(err); }
  };

  return (
    <div className="font-display text-slate-800 antialiased selection:bg-pink-500 selection:text-white min-h-screen relative overflow-hidden flex flex-col bg-[#fdfafb] pb-24">
      
      {/* Header - Light Mode */}
      <header className="relative z-30 flex items-center justify-between px-4 pb-6 pt-10 bg-white/70 backdrop-blur-3xl border-b border-slate-100 shadow-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 active:scale-90 transition-all"
          >
            <MaterialSymbol name="arrow_back" size={24} />
          </button>
          <div className="space-y-0.5">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">{t('automation')}</h1>
            <h2 className="text-xl font-black tracking-tight text-slate-800">{t('autoMessages')}</h2>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 h-12 rounded-2xl bg-pink-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <MaterialSymbol name="add" size={18} />
          {t('addNew')}
        </button>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 space-y-6">
        <div className="bg-white/50 rounded-[2rem] p-6 border border-slate-100">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-relaxed text-center">
             {t('autoMessagesDesc')}
          </p>
        </div>

        {/* Templates List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 opacity-40">
                <div className="size-24 rounded-[2.5rem] flex items-center justify-center bg-slate-100 border border-slate-200">
                  <MaterialSymbol name="forum" size={48} className="text-slate-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t('noTemplatesYet')}
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="group relative overflow-hidden bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-8 rounded-xl flex items-center justify-center bg-pink-50 text-pink-500">
                           <MaterialSymbol name="auto_awesome" size={16} filled />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 truncate">{template.name}</h3>
                        <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${
                          template.isEnabled 
                            ? 'bg-green-50 border-green-100 text-green-600' 
                            : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}>
                          {template.isEnabled ? t('enabled') : t('disabled')}
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-4 line-clamp-3">
                        {template.content}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setEditingTemplateId(template.id);
                          setNewTemplate({ name: template.name, content: template.content });
                          setIsEditModalOpen(true);
                        }}
                        className="size-10 rounded-xl flex items-center justify-center bg-slate-50 text-blue-500 active:scale-90 transition-all border border-slate-100"
                      >
                        <MaterialSymbol name="edit" size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleTemplate(template.id)}
                        className="size-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 active:scale-90 transition-all"
                      >
                        <MaterialSymbol
                          name={template.isEnabled ? 'toggle_on' : 'toggle_off'}
                          size={24}
                          className={template.isEnabled ? 'text-pink-500' : 'text-slate-300'}
                          filled
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="size-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-red-500 active:scale-90 transition-all"
                      >
                        <MaterialSymbol name="delete" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Light Mode Pop-up Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <>
          <div 
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setEditingTemplateId(null);
            }} 
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
            <div 
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                 <div className="size-12 rounded-2xl flex items-center justify-center bg-pink-50 text-pink-500 border border-pink-100">
                    <MaterialSymbol name={isCreateModalOpen ? "add_circle" : "edit_note"} size={28} filled />
                 </div>
                 <h2 className="text-xl font-black tracking-tight text-slate-800">
                   {isCreateModalOpen ? t('createTemplate') : t('editTemplate')}
                 </h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">{t('templateName')}</label>
                  <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full bg-transparent border-none text-slate-800 px-4 py-3 placeholder-slate-300 focus:ring-0 text-sm font-bold"
                      placeholder="e.g., Morning Greeting"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-4">{t('messageContent')}</label>
                  <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      rows={4}
                      className="w-full bg-transparent border-none text-slate-600 px-4 py-3 placeholder-slate-300 focus:ring-0 text-sm font-medium leading-relaxed resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingTemplateId(null);
                  }}
                  className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all border border-slate-100"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={isCreateModalOpen ? handleCreateTemplate : handleUpdateTemplate}
                  className="flex-1 h-12 rounded-xl bg-pink-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  {isCreateModalOpen ? t('continue') : t('update')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />
    </div>
  );
};
