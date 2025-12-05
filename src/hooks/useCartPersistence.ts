// Cart Persistence Hook - Saves cart to localStorage + server sync
import { useEffect, useRef } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { analyticsService } from '@/services/analyticsService';

const CART_STORAGE_KEY = 'kiosk_cart';
const SESSION_STORAGE_KEY = 'kiosk_session';
const SYNC_DEBOUNCE_MS = 3000;

interface PersistedSession {
  sessionId: string | null;
  cart: typeof useKioskStore.getState.prototype.cart;
  orderType: string | null;
  businessType: string | null;
  timestamp: number;
}

export const useCartPersistence = () => {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);
  
  const {
    sessionId,
    cart,
    orderType,
    businessType,
    setError,
    clearError,
  } = useKioskStore();

  // Save to localStorage immediately (optimistic)
  const saveToLocal = () => {
    if (!sessionId) return;
    
    const session: PersistedSession = {
      sessionId,
      cart,
      orderType,
      businessType,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('[PERSISTENCE] Failed to save to localStorage:', e);
    }
  };

  // Sync to server (debounced)
  const syncToServer = async () => {
    if (!sessionId || !isOnlineRef.current) {
      if (!isOnlineRef.current) {
        analyticsService.trackEvent('offline_mode_entered', { sessionId });
      }
      return;
    }

    try {
      // [SYSTEM ACTION] sync.push(session_id, cart)
      console.log('[SYSTEM ACTION] sync.push() - Syncing cart to server');
      // In production: await fetch('/api/cart/sync', { method: 'POST', body: JSON.stringify({ sessionId, cart }) });
      clearError();
    } catch (e) {
      console.error('[PERSISTENCE] Server sync failed:', e);
      setError({
        type: 'network',
        message: 'Changes saved locally. Will sync when online.',
        retryAction: syncToServer,
      });
    }
  };

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const session: PersistedSession = JSON.parse(stored);
        // Only restore if session is recent (< 5 minutes)
        const isRecent = Date.now() - session.timestamp < 5 * 60 * 1000;
        if (isRecent && session.cart.length > 0) {
          console.log('[PERSISTENCE] Restoring session:', session.sessionId);
          analyticsService.trackEvent('session_restored', { 
            sessionId: session.sessionId,
            cartItemCount: session.cart.length,
          });
          // Note: In real implementation, would call store.restoreSession(session)
        }
      } catch (e) {
        console.error('[PERSISTENCE] Failed to restore session:', e);
      }
    }
  }, []);

  // Save on every cart change
  useEffect(() => {
    saveToLocal();
    
    // Debounce server sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(syncToServer, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cart, sessionId]);

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      clearError();
      syncToServer();
      analyticsService.trackEvent('connection_restored', { sessionId });
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      setError({
        type: 'network',
        message: 'You\'re offline. Changes saved locally.',
        retryAction: null,
      });
      analyticsService.trackEvent('offline_mode_entered', { sessionId });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sessionId]);

  return {
    isOnline: isOnlineRef.current,
    forceSave: saveToLocal,
    forceSync: syncToServer,
  };
};
