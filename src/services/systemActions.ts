// System Actions Service
// Handles all backend communication for the kiosk

import type { CartItem, OrderType } from '@/types/kiosk';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface OrderResult {
  success: boolean;
  orderNumber?: string;
  estimatedTime?: number;
  errorMessage?: string;
}

export interface PrintResult {
  success: boolean;
  errorMessage?: string;
}

class SystemActionsService {
  // [SYSTEM ACTION] payment.process(order)
  async processPayment(
    method: 'card' | 'contactless',
    amount: number,
    cart: CartItem[]
  ): Promise<PaymentResult> {
    console.log('[SYSTEM ACTION] payment.process() - Method:', method, 'Amount:', amount);
    
    // Simulate payment gateway communication
    await this.simulateNetworkDelay(1500, 2500);
    
    // Simulate 95% success rate
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      return {
        success: false,
        errorCode: 'PAYMENT_DECLINED',
        errorMessage: 'Payment was declined. Please try again or use a different card.',
      };
    }
  }

  // [SYSTEM ACTION] kds.publish(order)
  async publishToKDS(
    orderNumber: string,
    orderType: OrderType,
    cart: CartItem[]
  ): Promise<OrderResult> {
    console.log('[SYSTEM ACTION] kds.publish() - Order:', orderNumber);
    
    await this.simulateNetworkDelay(500, 1000);
    
    // Simulate 98% success rate
    const isSuccess = Math.random() > 0.02;
    
    if (isSuccess) {
      const estimatedTime = 5 + Math.floor(Math.random() * 10);
      return {
        success: true,
        orderNumber,
        estimatedTime,
      };
    } else {
      return {
        success: false,
        errorMessage: 'Failed to send order to kitchen. Please try again.',
      };
    }
  }

  // [SYSTEM ACTION] printer.print(order)
  async printReceipt(
    orderNumber: string,
    orderType: OrderType,
    cart: CartItem[],
    total: number
  ): Promise<PrintResult> {
    console.log('[SYSTEM ACTION] printer.print() - Order:', orderNumber);
    
    await this.simulateNetworkDelay(1000, 2000);
    
    // Simulate 99% success rate
    const isSuccess = Math.random() > 0.01;
    
    if (isSuccess) {
      return { success: true };
    } else {
      return {
        success: false,
        errorMessage: 'Printer error. Receipt will be available at counter.',
      };
    }
  }

  // [SYSTEM ACTION] pos.update(order)
  async updateCloudPOS(
    orderNumber: string,
    transactionId: string,
    cart: CartItem[],
    total: number
  ): Promise<{ success: boolean }> {
    console.log('[SYSTEM ACTION] pos.update() - Order:', orderNumber);
    
    await this.simulateNetworkDelay(300, 500);
    
    return { success: true };
  }

  // [SYSTEM ACTION] inventory.check(itemId)
  async checkInventory(itemId: string): Promise<{ available: boolean; quantity: number }> {
    console.log('[SYSTEM ACTION] inventory.check() - Item:', itemId);
    
    await this.simulateNetworkDelay(100, 200);
    
    // Simulate 98% availability
    const isAvailable = Math.random() > 0.02;
    
    return {
      available: isAvailable,
      quantity: isAvailable ? Math.floor(Math.random() * 50) + 1 : 0,
    };
  }

  // [SYSTEM ACTION] queue.publish(orderNumber)
  async publishToQueueScreen(orderNumber: string): Promise<{ success: boolean }> {
    console.log('[SYSTEM ACTION] queue.publish() - Order:', orderNumber);
    
    await this.simulateNetworkDelay(200, 400);
    
    return { success: true };
  }

  // Helper to simulate network delay
  private simulateNetworkDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Check network connectivity
  async checkNetworkStatus(): Promise<boolean> {
    try {
      // In production, would ping actual backend
      return navigator.onLine;
    } catch {
      return false;
    }
  }
}

export const systemActions = new SystemActionsService();
