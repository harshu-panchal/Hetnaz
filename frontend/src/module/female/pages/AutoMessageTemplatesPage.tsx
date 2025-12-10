import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../types/material-symbol';
import { FemaleBottomNavigation } from '../components/FemaleBottomNavigation';
import type { AutoMessageTemplate } from '../types/female.types';

// Mock data - replace with actual API calls
const mockTemplates: AutoMessageTemplate[] = [
  {
    id: '1',
    name: 'Welcome Message',
    content: 'Hi! Thanks for reaching out. How are you doing today?',
    triggerType: 'time_based',
    triggerCondition: 'first_message',
    isEnabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Thank You',
    content: 'Thank you for your message! I appreciate it. 😊',
    triggerType: 'keyword_based',
    triggerCondition: 'thank',
    isEnabled: false,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
];

const navigationItems = [
  { id: 'dashboard', icon: 'home', label: 'Home' },
  { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
  { id: 'earnings', icon: 'account_balance_wallet', label: 'Earnings' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

export const AutoMessageTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<AutoMessageTemplate[]>(mockTemplates);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', triggerType: 'time_based' as const, triggerCondition: '' });

  const handleNavigationClick = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/female/dashboard');
        break;
      case 'chats':
        navigate('/female/chats');
        break;
      case 'earnings':
        navigate('/female/earnings');
        break;
      case 'profile':
        navigate('/female/my-profile');
        break;
      default:
        break;
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      alert('Please fill in all required fields');
      return;
    }

    const template: AutoMessageTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      content: newTemplate.content,
      triggerType: newTemplate.triggerType,
      triggerCondition: newTemplate.triggerCondition || undefined,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates([...templates, template]);
    setIsCreateModalOpen(false);
    setNewTemplate({ name: '', content: '', triggerType: 'time_based', triggerCondition: '' });
  };

  const handleEditTemplate = (template: AutoMessageTemplate) => {
    setEditingTemplateId(template.id);
    setNewTemplate({
      name: template.name,
      content: template.content,
      triggerType: template.triggerType,
      triggerCondition: template.triggerCondition || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content || !editingTemplateId) {
      alert('Please fill in all required fields');
      return;
    }

    setTemplates(
      templates.map((t) =>
        t.id === editingTemplateId
          ? {
              ...t,
              name: newTemplate.name,
              content: newTemplate.content,
              triggerType: newTemplate.triggerType,
              triggerCondition: newTemplate.triggerCondition || undefined,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );

    setIsEditModalOpen(false);
    setEditingTemplateId(null);
    setNewTemplate({ name: '', content: '', triggerType: 'time_based', triggerCondition: '' });
  };

  const handleToggleTemplate = (id: string) => {
    setTemplates(
      templates.map((t) => (t.id === id ? { ...t, isEnabled: !t.isEnabled } : t))
    );
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="flex flex-col bg-background-light dark:bg-background-dark min-h-screen pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
          >
            <MaterialSymbol name="arrow_back" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auto Messages</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          <MaterialSymbol name="add" />
          New
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        <p className="text-sm text-gray-500 dark:text-[#cbbc90] mb-4">
          Create automated message templates that will be sent automatically based on triggers.
        </p>

        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-[#342d18] rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        template.isEnabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {template.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-[#cbbc90] mb-2">{template.content}</p>
                  <p className="text-xs text-gray-500 dark:text-[#cbbc90]">
                    Trigger: {template.triggerType.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-blue-500"
                    title="Edit template"
                  >
                    <MaterialSymbol name="edit" />
                  </button>
                  <button
                    onClick={() => handleToggleTemplate(template.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors"
                    title={template.isEnabled ? 'Disable template' : 'Enable template'}
                  >
                    <MaterialSymbol
                      name={template.isEnabled ? 'toggle_on' : 'toggle_off'}
                      className={template.isEnabled ? 'text-primary' : 'text-gray-400'}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-red-500"
                    title="Delete template"
                  >
                    <MaterialSymbol name="delete" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Template</h2>
              <input
                type="text"
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <textarea
                placeholder="Message content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                  Trigger Type
                </label>
                <select
                  value={newTemplate.triggerType}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      triggerType: e.target.value as 'time_based' | 'keyword_based' | 'manual',
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="time_based">Time Based</option>
                  <option value="keyword_based">Keyword Based</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              {newTemplate.triggerType !== 'manual' && (
                <input
                  type="text"
                  placeholder={
                    newTemplate.triggerType === 'time_based'
                      ? 'Trigger condition (e.g., first_message)'
                      : 'Keyword (e.g., thank you)'
                  }
                  value={newTemplate.triggerCondition}
                  onChange={(e) => setNewTemplate({ ...newTemplate, triggerCondition: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewTemplate({ name: '', content: '', triggerType: 'time_based', triggerCondition: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  className="flex-1 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg"
                >
                  Create
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
              setNewTemplate({ name: '', content: '', triggerType: 'time_based', triggerCondition: '' });
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Template</h2>
              <input
                type="text"
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <textarea
                placeholder="Message content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#cbbc90] mb-2">
                  Trigger Type
                </label>
                <select
                  value={newTemplate.triggerType}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      triggerType: e.target.value as 'time_based' | 'keyword_based' | 'manual',
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="time_based">Time Based</option>
                  <option value="keyword_based">Keyword Based</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              {newTemplate.triggerType !== 'manual' && (
                <input
                  type="text"
                  placeholder={
                    newTemplate.triggerType === 'time_based'
                      ? 'Trigger condition (e.g., first_message)'
                      : 'Keyword (e.g., thank you)'
                  }
                  value={newTemplate.triggerCondition}
                  onChange={(e) => setNewTemplate({ ...newTemplate, triggerCondition: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2a2515] border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTemplateId(null);
                    setNewTemplate({ name: '', content: '', triggerType: 'time_based', triggerCondition: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTemplate}
                  className="flex-1 px-4 py-2 bg-primary text-slate-900 font-bold rounded-lg"
                >
                  Update
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

