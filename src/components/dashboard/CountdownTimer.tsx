'use client';

import { useState, useEffect } from 'react';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(targetDate: Date): TimeLeft | null {
  const difference = +targetDate - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return null;
}

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <div className="text-center text-2xl font-bold">¡El sorteo ha comenzado!</div>;
  }
  
  const timeUnits = [
    { value: timeLeft.days, label: 'Días' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 text-center w-full max-w-md">
      {timeUnits.map((unit, index) => (
         <div key={unit.label} className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/20 backdrop-blur-sm">
            <span className="text-3xl md:text-5xl font-bold tracking-tighter">
                {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-xs md:text-sm font-medium uppercase opacity-80">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
