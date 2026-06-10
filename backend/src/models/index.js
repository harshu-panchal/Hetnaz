/**
 * Models Index - Import all hooks
 * @owner: Sujal (Shared - Both review)
 * @purpose: Ensure all model hooks are loaded
 */

// Import models (this loads the hooks)
import './hooks/userHooks.js';
import './hooks/transactionHooks.js';
import './hooks/chatHooks.js';

// Export models
export { default as User } from './User.js';
export { default as Chat } from './Chat.js';
export { default as Message } from './Message.js';
export { default as Transaction } from './Transaction.js';
export { default as CoinPlan } from './CoinPlan.js';
export { default as Withdrawal } from './Withdrawal.js';
export { default as PayoutSlab } from './PayoutSlab.js';
export { default as Gift } from './Gift.js';
export { default as Notification } from './Notification.js';
export { default as AuditLog } from './AuditLog.js';
export { default as AppSettings } from './AppSettings.js';
export { default as AutoMessageTemplate } from './AutoMessageTemplate.js';
export { default as AutoMessageLog } from './AutoMessageLog.js';
export { default as Faq } from './Faq.js';

