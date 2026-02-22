import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkStatusModal() {
  const { isOnline } = useNetworkStatus();
  const [showOffline, setShowOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setWasOffline(true);
    } else {
      setShowOffline(false);
      if (wasOffline) {
        toast.success('Connection restored!', {
          icon: <Wifi className="w-4 h-4 text-success" />,
        });
        setWasOffline(false);
      }
    }
  }, [isOnline, wasOffline]);

  return (
    <Dialog open={showOffline} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm text-center" hideCloseButton>
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <WifiOff className="w-8 h-8 text-destructive" />
          </div>
          <DialogTitle>No Internet Connection</DialogTitle>
          <DialogDescription>
            Please check your internet connection and try again. 
            The application will automatically reconnect when online.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Waiting for connection...
        </div>
      </DialogContent>
    </Dialog>
  );
}
