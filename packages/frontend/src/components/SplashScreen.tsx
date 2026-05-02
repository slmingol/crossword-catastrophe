import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'show' | 'move' | 'complete'>('show');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Show logo for 3 seconds
    const showTimer = setTimeout(() => {
      setAnimationPhase('move');
    }, 3000);

    // Complete animation after move (1.5 seconds for animation)
    const completeTimer = setTimeout(() => {
      setAnimationPhase('complete');
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (animationPhase === 'complete') {
    return null;
  }

  const isMobile = windowWidth < 768;
  
  // Calculate the exact header logo position
  // Header padding is 0.75rem (12px) top, 2rem (32px) left
  // Plus the centered content with logo at position
  const headerLogoTop = isMobile ? '0.75rem' : '1.5rem';
  const headerLogoLeft = 'calc(50% - 12rem)'; // Center minus half of logo+text width
  
  // Responsive sizes
  const logoSizeLarge = isMobile ? `${windowWidth - 40}px` : '45rem'; // Full width minus padding on mobile
  const logoSizeSmall = isMobile ? '2rem' : '3.5rem';
  const textSizeLarge = isMobile ? '1.5rem' : '3rem';
  const textSizeSmall = isMobile ? '1rem' : '1.5rem';

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          opacity: animationPhase === 'move' ? 0 : 1,
          transition: 'opacity 1s ease-out',
          pointerEvents: animationPhase === 'move' ? 'none' : 'auto'
        }}
      />
      
      <div
        style={{
          position: 'fixed',
          top: animationPhase === 'move' ? headerLogoTop : '50%',
          left: animationPhase === 'move' ? headerLogoLeft : '50%',
          transform: animationPhase === 'move' 
            ? 'translate(0, -50%)' 
            : 'translate(-50%, -50%)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: animationPhase === 'move' ? 'row' : 'column',
          alignItems: 'center',
          gap: animationPhase === 'move' ? (isMobile ? '0.35rem' : '0.75rem') : '2rem',
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth: isMobile ? '95vw' : 'none',
          padding: isMobile ? '0 1rem' : '0'
        }}
      >
        <img
          src="/logo.png"
          alt="Crossword Cat-a-strophe"
          style={{
            width: animationPhase === 'move' ? logoSizeSmall : logoSizeLarge,
            maxWidth: isMobile ? '90vw' : 'none',
            height: 'auto',
            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <h1
          style={{
            color: 'white',
            fontSize: animationPhase === 'move' ? textSizeSmall : textSizeLarge,
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: isMobile ? 'normal' : 'nowrap',
            textAlign: 'center',
            maxWidth: isMobile ? '90vw' : 'none',
            opacity: animationPhase === 'move' ? 0 : 1,
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: animationPhase === 'show' ? 'fadeIn 0.8s ease-out 0.3s both' : 'none'
          }}
        >
          Crossword Cat-a-strophe
        </h1>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
