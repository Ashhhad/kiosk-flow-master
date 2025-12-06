// Cart Persistence Hook - localStorage + optimistic server sync
import { useEffect, useRef, useCallback } from 'react';
import { useKioskStore } from '@/store/kioskStore';
import { analyticsService } from '@/services/analyticsService';

const CART_STORAGE_KEY = 'kiosk_cart';
const SESSION_STORAGE_KEY = 'kiosk_session';
const SYNC_DEBOUNCE_MS = 3000;
const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PersistedSession {
  sessionId: string | null;
  cart: ReturnType<typeof useKioskStore.getState>['cart'];
  orderType: string | null;
  businessType: string | null;
  timestamp: number;
  version: number;
}

export const useCartPersistence = () => {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const lastSyncRef = useRef<number>(0);
  
  const sessionId = useKioskStore((s) => s.sessionId);
  const cart = useKioskStore((s) => s.cart);
  const orderType = useKioskStore((s) => s.orderType);
  const businessType = useKioskStore((s) => s.businessType);
  const setError = useKioskStore((s) => s.setError);
  const clearError = useKioskStore((s) => s.clearError);

  // Save to localStorage immediately (optimistic)
  const saveToLocal = useCallback(() => {
    if (!sessionId) return;
    
    const session: PersistedSession = {
      sessionId,
      cart,
      orderType,
      businessType,
      timestamp: Date.now(),
      version: 1,
    };
    
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      console.log('[PERSISTENCE] Saved to localStorage:', { itemCount: cart.length });
    } catch (e) {
      console.error('[PERSISTENCE] Failed to save to localStorage:', e);
      // Storage might be full - try to clear old data
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Ignore - local persistence failed but session continues
      }
    }
  }, [sessionId, cart, orderType, businessType]);

  // Sync to server (debounced, batched)
  const syncToServer = useCallback(async () => {
    if (!sessionId || !isOnlineRef.current) {
      if (!isOnlineRef.current) {
        analyticsService.trackEvent('offline_mode_entered', { sessionId });
      }
      return;
    }

    // Prevent rapid syncs
    const now = Date.now();
    if (now - lastSyncRef.current < 1000) {
      return;
    }
    lastSyncRef.current = now;

    try {
      // [SYSTEM ACTION] sync.push(session_id, cart)
      console.log('[SYSTEM ACTION] sync.push() - Syncing cart to server', {
        sessionId,
        itemCount: cart.length,
        total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
      });
      
      // In production: 
      // await fetch('/api/cart/sync', { 
      //   method: 'POST', 
      //   body: JSON.stringify({ sessionId, cart, orderType, timestamp: Date.now() }) 
      // });
      
      clearError();
    } catch (e) {
      console.error('[PERSISTENCE] Server sync failed:', e);
      setError({
        type: 'network',
        message: 'Changes saved locally. Will sync when online.',
        retryAction: syncToServer,
      });
    }
  }, [sessionId, cart, clearError, setError]);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return;

    try {
      const session: PersistedSession = JSON.parse(stored);
      const isRecent = Date.now() - session.timestamp < SESSION_TTL_MS;
      
      if (isRecent && session.cart.length > 0 && session.sessionId) {
        console.log('[PERSISTENCE] Found restorable session:', {
          sessionId: session.sessionId,
          itemCount: session.cart.length,
          age: Math.round((Date.now() - session.timestamp) / 1000) + 's',
        });
        
        analyticsService.trackEvent('session_restore_available', { 
          sessionId: session.sessionId,
          cartItemCount: session.cart.length,
          ageMs: Date.now() - session.timestamp,
        });
        
        // Note: In real implementation, would call:
        // store.restoreSession(session);
        // And show "We restored your cart — please review" banner
      } else {
        // Clear stale session
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('[PERSISTENCE] Failed to restore session:', e);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  // Save on every cart change with debounced server sync
  useEffect(() => {
    // Immediate local save
    saveToLocal();
    
    // Debounced server sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(syncToServer, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cart, sessionId, saveToLocal, syncToServer]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[PERSISTENCE] Network restored');
      isOnlineRef.current = true;
      clearError();
      
      // Reconcile with server
      syncToServer();
      
      analyticsService.trackEvent('connection_restored', { sessionId });
    };

    const handleOffline = () => {
      console.log('[PERSISTENCE] Network lost');
      isOnlineRef.current = false;
      
      setError({
        type: 'network',
        message: "You're offline. Changes saved locally.",
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
  }, [sessionId, clearError, setError, syncToServer]);

  // Clear session data on reset
  useEffect(() => {
    if (!sessionId) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  return {
    isOnline: isOnlineRef.current,
    forceSave: saveToLocal,
    forceSync: syncToServer,
  };
};