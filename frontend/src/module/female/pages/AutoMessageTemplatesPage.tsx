// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import { FemaleTopNavbar } from '../components/FemaleTopNavbar';
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

  // Fetch templates on mount
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
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert(t('somethingWentWrong')); // Generic error or detailed
      return;
    }

    if (newTemplate.content.length > 500) {
      alert(t('somethingWentWrong')); // Content too long
      return;
    }

    try {
      const created = await autoMessageService.createTemplate({
        name: newTemplate.name,
        content: newTemplate.content,
        isEnabled: false, // New templates start disabled
      });

      setTemplates([created, ...templates]);
      setIsCreateModalOpen(false);
      setNewTemplate({ name: '', content: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || t('somethingWentWrong'));
      console.error('Error creating template:', err);
    }
  };

  const handleEditTemplate = (template: AutoMessageTemplate) => {
    setEditingTemplateId(template.id);
    setNewTemplate({
      name: template.name,
      content: template.content,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content || !editingTemplateId) {
      alert(t('somethingWentWrong'));
      return;
    }

    if (newTemplate.content.length > 500) {
      alert(t('somethingWentWrong'));
      return;
    }

    try {
      const updated = await autoMessageService.updateTemplate(editingTemplateId, {
        name: newTemplate.name,
        content: newTemplate.content,
      });

      setTemplates(
        templates.map((t) => (t.id === editingTemplateId ? updated : t))
      );

      setIsEditModalOpen(false);
      setEditingTemplateId(null);
      setNewTemplate({ name: '', content: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || t('somethingWentWrong'));
      console.error('Error updating template:', err);
    }
  };

  const handleToggleTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;

    try {
      const updated = await autoMessageService.updateTemplate(id, {
        isEnabled: !template.isEnabled,
      });

      setTemplates(
        templates.map((t) => (t.id === id ? updated : t))
      );
    } catch (err: any) {
      alert(err.response?.data?.error || t('somethingWentWrong'));
      console.error('Error toggling template:', err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm(t('templateDeleteConfirm'))) {
      return;
    }

    try {
      await autoMessageService.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || t('somethingWentWrong'));
      console.error('Error deleting template:', err);
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Top Navbar */}
      <FemaleTopNavbar />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('autoMessages')}</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <MaterialSymbol name="add" />
          {t('addNew')}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <p className="text-sm text-gray-500 dark:text-[#cbbc90] mb-4">
          {t('autoMessagesDesc')}
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchTemplates}
              className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
            >
              {t('tryAgain')}
            </button>
          </div>
        )}

        {/* Templates List */}
        {!isLoading && !error && (
          <div className="space-y-3">{templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-[#cbbc90]">
                {t('noTemplatesYet')}
              </p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${template.isEnabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                      >
                        {template.isEnabled ? t('enabled') : t('disabled')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-2">{template.content}</p>
                    {template.stats && template.stats.sentCount > 0 && (
                      <p className="text-xs text-gray-500 dark:text-[#cbbc90]">
                        {t('sentTimes', { count: template.stats.sentCount })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-blue-500"
                      title={t('edit')}
                    >
                      <MaterialSymbol name="edit" />
                    </button>
                    <button
                      onClick={() => handleToggleTemplate(template.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors"
                      title={template.isEnabled ? t('disabled') : t('enabled')}
                    >
                      <MaterialSymbol
                        name={template.isEnabled ? 'toggle_on' : 'toggle_off'}
                        className={template.isEnabled ? 'text-primary' : 'text-gray-400'}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-red-500"
                      title={t('delete')}
                    >
                      <MaterialSymbol name="delete" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('createTemplate')}</h2>
              <input
                type="text"
                placeholder={t('templateName')}
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <textarea
                placeholder={t('messageContent')}
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewTemplate({ name: '', content: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="flex-1 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg"
                >
                  {t('continue')} {/* Or 'Create' */}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingTemplateId(null);
              setNewTemplate({ name: '', content: '' });
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('editTemplate')}</h2>
              <input
                type="text"
                placeholder={t('templateName')}
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <textarea
                placeholder={t('messageContent')}
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTemplateId(null);
                    setNewTemplate({ name: '', content: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleUpdateTemplate}
                  className="flex-1 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg"
                >
                  {t('update')}
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

