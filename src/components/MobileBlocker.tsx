import { useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

/**
 * MobileBlocker Component
 * Blocks access from mobile devices and shows a message to use desktop browser
 */
export const MobileBlocker = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
        'windows phone', 'opera mini', 'iemobile', 'mobile', 'tablet'
      ];
      
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileWidth = window.innerWidth < 1024;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileDevice = isMobileUA || (isMobileWidth && isTouchDevice);
      
      setIsMobile(isMobileDevice);
      setIsChecking(false);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="text-zinc-500">Memuat...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Smartphone className="w-16 h-16 text-zinc-600" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✕</span>
              </div>
            </div>
          </div>

          {/* Text */}
          <h1 className="text-xl font-semibold text-white mb-3">
            Desktop Only
          </h1>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto mb-8">
            Dashboard ini hanya dapat diakses melalui komputer atau laptop.
          </p>

          {/* Supported */}
          <div className="flex justify-center items-center gap-2 text-zinc-500 text-xs">
            <Monitor className="w-4 h-4" />
            <span>Gunakan perangkat desktop</span>
          </div>

          {/* Footer */}
          <div className="mt-12 text-zinc-600 text-xs">
            SintaNagari.cloud
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileBlocker;
