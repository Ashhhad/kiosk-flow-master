// KioskApp - Main app wrapper with all global features
import { useKioskStore } from '@/store/kioskStore';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { IdleScreen } from './IdleScreen';
import { OrderTypeScreen } from './OrderTypeScreen';
import { MenuScreen } from './MenuScreen';
import { ItemDetailScreen } from './ItemDetailScreen';
import { CartReviewScreen } from './CartReviewScreen';
import { UpsellScreen } from './UpsellScreen';
import { PaymentScreen } from './PaymentScreen';
import { ConfirmationScreen } from './ConfirmationScreen';
import { InactivityMonitor } from './InactivityModal';
import { ErrorModal } from './ErrorModal';
import { OfflineBanner } from './OfflineBanner';
import { AdminDashboard } from './AdminDashboard';
import { useCartPersistence } from '@/hooks/useCartPersistence';
import { analyticsService } from '@/services/analyticsService';

// Secret tap sequence to open admin: tap top-left corner 5 times rapidly
const useAdminAccess = () => {
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleAdminTap = (e: React.MouseEvent) => {
    // Check if tap is in top-left corner (60x60 area)
    if (e.clientX < 60 && e.clientY < 60) {
      const now = Date.now();
      if (now - lastTapTime < 500) {
        const newCount = tapCount + 1;
        setTapCount(newCount);
        if (newCount >= 5) {
          setShowAdmin(true);
          setTapCount(0);
          analyticsService.trackEvent('admin_access_opened', {});
        }
      } else {
        setTapCount(1);
      }
      setLastTapTime(now);
    }
  };

  return { showAdmin, setShowAdmin, handleAdminTap };
};

export const KioskApp = () => {
  const currentScreen = useKioskStore((state) => state.currentScreen);
  const error = useKioskStore((state) => state.error);
  
  // Initialize cart persistence
  useCartPersistence();
  
  // Admin access
  const { showAdmin, setShowAdmin, handleAdminTap } = useAdminAccess();

  // Prevent zoom and other gestures
  useEffect(() => {
    // Prevent pinch zoom
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'idle':
        return <IdleScreen />;
      case 'order-type':
        return <OrderTypeScreen />;
      case 'menu':
        return <MenuScreen />;
      case 'item-detail':
        return <ItemDetailScreen />;
      case 'cart':
        return <CartReviewScreen />;
      case 'upsell':
        return <UpsellScreen />;
      case 'payment':
        return <PaymentScreen />;
      case 'confirmation':
        return <ConfirmationScreen />;
      default:
        return <IdleScreen />;
    }
  };

  return (
    <div 
      className="h-screen w-screen bg-background overflow-hidden touch-manipulation"
      onClick={handleAdminTap}
    >
      {/* Offline Banner */}
      <OfflineBanner />
      
      {/* Main Screen */}
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
      
      {/* Inactivity Monitor */}
      <InactivityMonitor />
      
      {/* Error Modal */}
      {error.type && <ErrorModal />}
      
      {/* Admin Dashboard */}
      <AnimatePresence>
        {showAdmin && (
          <AdminDashboard onClose={() => setShowAdmin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
