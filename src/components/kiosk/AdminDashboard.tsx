// Admin/Diagnostics Dashboard - Kiosk Health Monitoring
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { analyticsService } from '@/services/analyticsService';

interface SystemStatus {
  network: 'online' | 'offline' | 'checking';
  printer: 'ready' | 'error' | 'offline' | 'checking';
  paymentReader: 'connected' | 'disconnected' | 'error' | 'checking';
  kds: 'connected' | 'disconnected' | 'error' | 'checking';
  lastHeartbeat: number;
  pendingSyncCount: number;
  failCounters: {
    payment: number;
    print: number;
    kds: number;
    network: number;
  };
}

interface EventLog {
  id: string;
  type: 'payment' | 'print' | 'kds' | 'network' | 'error' | 'info';
  message: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [status, setStatus] = useState<SystemStatus>({
    network: 'checking',
    printer: 'checking',
    paymentReader: 'checking',
    kds: 'checking',
    lastHeartbeat: Date.now(),
    pendingSyncCount: 0,
    failCounters: { payment: 0, print: 0, kds: 0, network: 0 },
  });

  const [logs, setLogs] = useState<EventLog[]>([]);
  const [logFilter, setLogFilter] = useState<string>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Simulate health checks
  useEffect(() => {
    const checkHealth = async () => {
      // [SYSTEM ACTION] health.check()
      console.log('[SYSTEM ACTION] health.check() - Running diagnostics');
      
      // Simulate network check
      setStatus(prev => ({
        ...prev,
        network: navigator.onLine ? 'online' : 'offline',
        lastHeartbeat: Date.now(),
      }));

      // Simulate other checks (in production, these would be real API calls)
      setTimeout(() => {
        setStatus(prev => ({
          ...prev,
          printer: Math.random() > 0.1 ? 'ready' : 'error',
          paymentReader: Math.random() > 0.05 ? 'connected' : 'error',
          kds: Math.random() > 0.1 ? 'connected' : 'disconnected',
        }));
      }, 500);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load logs from analytics
  useEffect(() => {
    const events = analyticsService.getEvents();
    const formatted: EventLog[] = events.slice(-200).map((event, index) => ({
      id: `log-${index}`,
      type: event.eventName.includes('error') ? 'error' :
            event.eventName.includes('payment') ? 'payment' :
            event.eventName.includes('print') ? 'print' :
            event.eventName.includes('kds') ? 'kds' :
            event.eventName.includes('network') || event.eventName.includes('offline') ? 'network' : 'info',
      message: event.eventName,
      timestamp: event.timestamp,
      details: event.properties,
    }));
    setLogs(formatted.reverse());
  }, []);

  const filteredLogs = logFilter === 'all' 
    ? logs 
    : logs.filter(log => log.type === logFilter);

  const handleRestartKiosk = () => {
    analyticsService.trackEvent('admin_restart_kiosk', {});
    window.location.reload();
  };

  const handleClearSession = () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      return;
    }
    localStorage.clear();
    sessionStorage.clear();
    analyticsService.clearEvents();
    setShowConfirmClear(false);
    analyticsService.trackEvent('admin_clear_session', {});
  };

  const handleRetryPendingPushes = () => {
    analyticsService.trackEvent('admin_retry_pending', {});
    // [SYSTEM ACTION] sync.reconcile() - Force sync
    console.log('[SYSTEM ACTION] sync.reconcile() - Retrying pending pushes');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'ready':
      case 'connected':
        return 'bg-success text-success-foreground';
      case 'offline':
      case 'disconnected':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const StatusBadge = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
      <span className="text-kiosk-base text-muted-foreground">{label}</span>
      <span className={`px-3 py-1 rounded-full text-kiosk-sm font-semibold ${getStatusColor(value)}`}>
        {value.toUpperCase()}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <header className="p-4 border-b border-border flex items-center justify-between bg-card">
        <h1 className="text-kiosk-2xl font-bold text-foreground">
          🔧 Kiosk Diagnostics
        </h1>
        <Button variant="kiosk-ghost" size="kiosk" onClick={onClose}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* System Status */}
          <section>
            <h2 className="text-kiosk-xl font-bold text-foreground mb-4">System Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatusBadge label="Network" value={status.network} />
              <StatusBadge label="Printer" value={status.printer} />
              <StatusBadge label="Payment Reader" value={status.paymentReader} />
              <StatusBadge label="Kitchen Display" value={status.kds} />
            </div>
            <div className="mt-4 p-4 bg-secondary/50 rounded-xl">
              <div className="flex justify-between text-kiosk-sm text-muted-foreground">
                <span>Last Heartbeat</span>
                <span>{new Date(status.lastHeartbeat).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between text-kiosk-sm text-muted-foreground mt-2">
                <span>Pending Sync Items</span>
                <span>{status.pendingSyncCount}</span>
              </div>
            </div>
          </section>

          {/* Fail Counters */}
          <section>
            <h2 className="text-kiosk-xl font-bold text-foreground mb-4">Error Counters</h2>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(status.failCounters).map(([key, count]) => (
                <div key={key} className="text-center p-4 bg-card rounded-xl border border-border">
                  <div className={`text-kiosk-3xl font-bold ${count > 0 ? 'text-destructive' : 'text-success'}`}>
                    {count}
                  </div>
                  <div className="text-kiosk-sm text-muted-foreground capitalize">{key}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section>
            <h2 className="text-kiosk-xl font-bold text-foreground mb-4">Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="kiosk-secondary" size="kiosk-lg" onClick={handleRestartKiosk}>
                🔄 Restart Kiosk
              </Button>
              <Button variant="kiosk-secondary" size="kiosk-lg" onClick={handleRetryPendingPushes}>
                ⬆️ Retry Pending
              </Button>
              <Button variant="kiosk-secondary" size="kiosk-lg">
                🖨️ Reprint Last Receipt
              </Button>
              <Button 
                variant={showConfirmClear ? 'destructive' : 'kiosk-secondary'} 
                size="kiosk-lg" 
                onClick={handleClearSession}
              >
                {showConfirmClear ? '⚠️ Confirm Clear' : '🗑️ Clear Local Session'}
              </Button>
            </div>
          </section>

          {/* Event Logs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-kiosk-xl font-bold text-foreground">Event Logs</h2>
              <select 
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-secondary text-foreground px-4 py-2 rounded-lg border border-border"
              >
                <option value="all">All Events</option>
                <option value="payment">Payment</option>
                <option value="print">Print</option>
                <option value="kds">KDS</option>
                <option value="network">Network</option>
                <option value="error">Errors</option>
              </select>
            </div>
            <div className="bg-card border border-border rounded-xl max-h-80 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No events logged
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 flex items-start gap-3">
                      <span className={`
                        w-2 h-2 rounded-full mt-2 flex-shrink-0
                        ${log.type === 'error' ? 'bg-destructive' : 
                          log.type === 'payment' ? 'bg-primary' :
                          log.type === 'print' ? 'bg-accent' :
                          log.type === 'kds' ? 'bg-success' :
                          log.type === 'network' ? 'bg-warning' : 'bg-muted-foreground'}
                      `} />
                      <div className="flex-1 min-w-0">
                        <div className="text-kiosk-sm font-medium text-foreground truncate">
                          {log.message}
                        </div>
                        <div className="text-kiosk-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Build Info */}
          <section className="text-center text-kiosk-sm text-muted-foreground pb-8">
            <p>Kiosk Version: 1.0.0 | Build: {new Date().toISOString().split('T')[0]}</p>
            <p>Last Update: {new Date().toLocaleString()}</p>
          </section>
        </div>
      </main>
    </motion.div>
  );
};
