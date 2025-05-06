import React, { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';

interface SplashscreenProps {
  onFinish: () => void;
}

const Splashscreen: React.FC<SplashscreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Attendre la fin de l'animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-teal-600 transition-opacity duration-500 ${
        !isVisible ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-3 text-white">
          <Gift size={40} className="animate-bounce" />
          <h1 className="text-3xl font-bold">Birthdate</h1>
        </div>
      </div>
    </div>
  );
};

export default Splashscreen;