import { useKioskStore } from '@/store/kioskStore';
import { AnimatePresence } from 'framer-motion';
import { IdleScreen } from './IdleScreen';
import { OrderTypeScreen } from './OrderTypeScreen';
import { MenuScreen } from './MenuScreen';
import { UpsellScreen } from './UpsellScreen';
import { PaymentScreen } from './PaymentScreen';
import { ConfirmationScreen } from './ConfirmationScreen';

export const KioskApp = () => {
  const currentScreen = useKioskStore((state) => state.currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'idle':
        return <IdleScreen />;
      case 'order-type':
        return <OrderTypeScreen />;
      case 'menu':
        return <MenuScreen />;
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
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
};
