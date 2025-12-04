import { useKioskStore } from '@/store/kioskStore';
import { AnimatePresence } from 'framer-motion';
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

export const KioskApp = () => {
  const currentScreen = useKioskStore((state) => state.currentScreen);
  const error = useKioskStore((state) => state.error);

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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Main Screen */}
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
      
      {/* Inactivity Monitor */}
      <InactivityMonitor />
      
      {/* Error Modal */}
      {error.type && <ErrorModal />}
    </div>
  );
};
