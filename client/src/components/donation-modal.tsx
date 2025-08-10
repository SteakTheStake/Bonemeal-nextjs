import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Coffee } from "lucide-react";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Load PayPal SDK script
    if (!document.getElementById('paypal-sdk-script')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk-script';
      script.src = 'https://www.paypal.com/sdk/js?client-id=BAA4chfuJOgsM92_WRqwB3YoEzHyuEx7Tg-e8dKs51gkpyD20daP_WYOkoFE7rTyyGITdyBVaKrbxF2O_Y&components=hosted-buttons&enable-funding=venmo&currency=USD';
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, [open]);

  useEffect(() => {
    if (!scriptLoaded || !open) return;

    // Wait for PayPal to be available
    const initPayPal = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        window.paypal.HostedButtons({
          hostedButtonId: "NDJTQ8ZHPASRW"
        }).render("#paypal-container-NDJTQ8ZHPASRW");
      } else {
        setTimeout(initPayPal, 100);
      }
    };

    initPayPal();
  }, [scriptLoaded, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card moss-texture">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-6 h-6"
              style={{ imageRendering: 'pixelated' }}
            />
            Support Bonemeal Development
            <Heart className="h-5 w-5 text-pink-500" />
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Coffee className="h-4 w-4" />
              <p>
                This app is developed and maintained as a passion project, 
                funded entirely by personal income.
              </p>
            </div>
            
            <p className="text-sm">
              Your support helps keep Bonemeal free and actively developed with new features. 
              Every contribution, no matter the size, makes a real difference in maintaining 
              and improving this tool for the Minecraft community.
            </p>

            <div className="bg-background/50 rounded-lg p-4 border border-border/50">
              <p className="text-xs text-muted-foreground mb-2">
                Thank you for considering a donation! 💚
              </p>
              <p className="text-xs text-muted-foreground">
                100% of donations go directly towards:
              </p>
              <ul className="text-xs text-muted-foreground ml-4 mt-1 space-y-1">
                <li>• Server hosting costs</li>
                <li>• Development time</li>
                <li>• New feature implementation</li>
                <li>• Community support</li>
              </ul>
            </div>

            {/* PayPal Button Container */}
            <div className="flex justify-center pt-4">
              <div id="paypal-container-NDJTQ8ZHPASRW"></div>
            </div>

            {!scriptLoaded && (
              <div className="text-center text-sm text-muted-foreground">
                Loading payment options...
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}