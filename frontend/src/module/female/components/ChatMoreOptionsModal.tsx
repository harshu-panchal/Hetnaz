import { useState } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface ChatMoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  onViewProfile?: () => void;
  userName?: string;
  isBlocked?: boolean;
}

export const ChatMoreOptionsModal = ({
  isOpen,
  onClose,
  onBlock,
  onReport,
  onDelete,
  onViewProfile,
  userName,
  isBlocked = false,
}: ChatMoreOptionsModalProps) => {
  const { t } = useTranslation();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete?.();
      handleClose();
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleBlock = () => {
    if (showConfirmBlock) {
      onBlock?.();
      handleClose();
    } else {
      setShowConfirmBlock(true);
    }
  };

  const handleClose = () => {
    setShowConfirmDelete(false);
    setShowConfirmBlock(false);
    onClose();
  };

  const OptionButton = ({ onClick, icon, label, variant = 'default' }: { onClick: () => void; icon: string; label: string; variant?: 'default' | 'danger' }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 active:scale-95 transition-all group shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div className={`size-10 rounded-xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-slate-200/50 text-slate-500'}`}>
          <MaterialSymbol name={icon as any} size={22} />
        </div>
        <span className={`text-sm font-bold tracking-tight ${variant === 'danger' ? 'text-red-500' : 'text-slate-700'}`}>
          {label}
        </span>
      </div>
      <MaterialSymbol name="chevron_right" size={20} className="text-slate-300" />
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" 
        onClick={handleClose} 
      />
      
      {/* Pop-up Modal Container */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
          
          {/* Header */}
          <div className="p-6 pb-2 text-center">
             <div className="size-16 rounded-[1.5rem] bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 mx-auto mb-4">
                <MaterialSymbol name="security" size={32} filled />
             </div>
             <h3 className="text-xl font-black tracking-tight text-slate-900 leading-tight">{t('vaultOptions')}</h3>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{userName}</p>
          </div>

          {/* Action Area */}
          <div className="p-6 pt-2 space-y-2">
            {showConfirmDelete ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-sm font-bold text-center text-slate-600 leading-relaxed px-4">{t('confirmDeleteChatDesc') || 'Delete this conversation?'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-500 text-xs font-black uppercase tracking-widest"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 h-12 bg-red-500 rounded-xl text-white text-xs font-black uppercase tracking-widest"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ) : showConfirmBlock ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <p className="text-sm font-bold text-center text-slate-600 leading-relaxed px-4">{t('confirmBlockUserDesc', { name: userName })}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmBlock(false)}
                    className="flex-1 h-12 bg-slate-100 rounded-xl text-slate-500 text-xs font-black uppercase tracking-widest"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleBlock}
                    className="flex-1 h-12 bg-red-500 rounded-xl text-white text-xs font-black uppercase tracking-widest"
                  >
                    {isBlocked ? t('unblock') : t('block')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {onViewProfile && (
                  <OptionButton 
                     onClick={() => { onViewProfile(); handleClose(); }} 
                     icon="person" 
                     label={t('viewProfile')} 
                  />
                )}
                {onBlock && (
                  <OptionButton 
                     onClick={() => setShowConfirmBlock(true)} 
                     icon={isBlocked ? 'check_circle' : 'block'} 
                     label={isBlocked ? (t('unblockUser') || 'Unblock User') : (t('blockUser') || 'Block User')} 
                  />
                )}
                {onReport && (
                  <OptionButton 
                     onClick={() => { onReport(); handleClose(); }} 
                     icon="flag" 
                     label={t('reportUser')} 
                  />
                )}
                {onDelete && (
                  <OptionButton 
                     onClick={() => setShowConfirmDelete(true)} 
                     icon="delete" 
                     label={t('deleteChat')} 
                     variant="danger"
                  />
                )}
              </div>
            )}
          </div>

          {/* Close Handle */}
          <button
            onClick={handleClose}
            className="w-full h-14 bg-slate-50 border-t border-slate-100 text-slate-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors"
          >
            {t('closeOptions') || 'Close'}
          </button>
        </div>
      </div>
    </>
  );
};
