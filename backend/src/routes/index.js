/**
 * Route Index - Export all routes
 * @owner: Sujal (Shared - Both review)
 * @purpose: Central route exports
 */

// Routes will be imported here as they are created
// Routes will be imported here as they are created
import authRoutes from './auth/routes.js';
import userRoutes from './users/routes.js';
import adminRoutes from './admin/routes.js';
import walletRoutes from './wallet/routes.js';
import paymentRoutes from './payment/routes.js';
import chatRoutes from './chat/routes.js';
import rewardRoutes from './reward/routes.js';
import uploadRoutes from './upload/routes.js';
import fcmRoutes from './fcm/routes.js';
// import maleRoutes from './male/routes.js';
// import femaleRoutes from './female/routes.js';

export {
    authRoutes,
    userRoutes,
    adminRoutes,
    walletRoutes,
    paymentRoutes,
    chatRoutes,
    rewardRoutes,
    uploadRoutes,
    fcmRoutes,
    //   maleRoutes,
    //   femaleRoutes,
};



