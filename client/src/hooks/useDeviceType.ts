import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      // Check for mobile devices
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const smallScreen = width < 768;
      
      setIsMobile(mobileCheck || smallScreen);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}