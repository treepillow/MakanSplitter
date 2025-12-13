'use client';

import React, { useEffect, useState } from 'react';
import { Colors } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.3);
  const [slideY, setSlideY] = useState(50);

  useEffect(() => {
    // Animate in sequence using CSS transitions
    const timer1 = setTimeout(() => {
      setOpacity(1);
      setScale(1);
    }, 100);

    const timer2 = setTimeout(() => {
      setSlideY(0);
    }, 800);

    const timer3 = setTimeout(() => {
      setOpacity(0);
    }, 2000);

    const timer4 = setTimeout(() => {
      onFinish();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onFinish]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: Colors.background }}
    >
      <div
        className="mb-8 transition-all duration-600"
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div className="text-[120px]">🍜</div>
      </div>

      <div
        className="flex flex-col items-center transition-all duration-400"
        style={{
          opacity,
          transform: `translateY(${slideY}px)`,
        }}
      >
        <h1
          className="text-[42px] font-extrabold mb-2 tracking-tight"
          style={{ color: Colors.primary }}
        >
          MakanSplit
        </h1>
        <p
          className="text-base font-medium"
          style={{ color: Colors.textLight }}
        >
          Split bills, not friendships
        </p>
      </div>
    </div>
  );
}
