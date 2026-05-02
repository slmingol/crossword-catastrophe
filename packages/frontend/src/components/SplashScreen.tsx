import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'show' | 'move' | 'complete'>('show');

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

  // Calculate the exact header logo position
  // Header padding is 0.75rem (12px) top, 2rem (32px) left
  // Plus the centered content with logo at position
  const headerLogoTop = '1.5rem'; // Approximation of centered position in header
  const headerLogoLeft = 'calc(50% - 12rem)'; // Center minus half of logo+text width

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
          gap: animationPhase === 'move' ? '0.75rem' : '2rem',
          transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <img
          src="/logo.png"
          alt="Crossword Catastrophe"
          style={{
            width: animationPhase === 'move' ? '3.5rem' : '45rem',
            height: 'auto',
            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <h1
          style={{
            color: 'white',
            fontSize: animationPhase === 'move' ? '1.5rem' : '3rem',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            opacity: animationPhase === 'move' ? 0 : 1,
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: animationPhase === 'show' ? 'fadeIn 0.8s ease-out 0.3s both' : 'none'
          }}
        >
          Crossword Catastrophe
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
