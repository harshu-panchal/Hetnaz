import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register Service Worker for PWA/Android App support
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // In development mode, unregister any active service worker to prevent caching stale dev assets
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        if (registration.active && registration.active.scriptURL.includes('sw.js')) {
          registration.unregister().then(success => {
            if (success) {
              console.log('Successfully unregistered stale development service worker for sw.js');
              window.location.reload(); // Reload to fetch fresh assets
            }
          });
        }
      }
    });
  }
}
