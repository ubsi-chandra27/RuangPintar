"use client";

import * as React from "react";

export interface AnimatedCounterProps {
  value: number;
  duration?: number; // Durasi dalam detik, default 1.2s
  decimals?: number; // Jumlah desimal di belakang koma (misal 1 untuk 96.4%)
  prefix?: string; // Misal "Rp " atau "$"
  suffix?: string; // Misal "%", " Siswa", dll
  className?: string;
  delay?: number; // Penundaan dalam milidetik
}

/**
 * Kurva ease-out exponential (melesat cepat di awal, melambat anggun di akhir)
 * Mirip dengan motion pada video DotKrafts.
 */
function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  delay = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState<number>(
    process.env.NODE_ENV === "test" ? value : 0
  );
  const startTimestampRef = React.useRef<number | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "test" || value === 0) {
      return;
    }

    let timer: NodeJS.Timeout;

    const startAnimation = () => {
      startTimestampRef.current = null;

      const step = (timestamp: number) => {
        if (!startTimestampRef.current) startTimestampRef.current = timestamp;
        const progress = Math.min((timestamp - startTimestampRef.current) / (duration * 1000), 1);
        const easedProgress = easeOutExpo(progress);

        const currentVal = easedProgress * value;
        setDisplayValue(currentVal);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timer = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [value, duration, delay]);

  // Format angka ke locale Indonesia (titik untuk ribuan, koma untuk desimal)
  const formatted = React.useMemo(() => {
    return displayValue.toLocaleString("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [displayValue, decimals]);

  return (
    <span className={`tabular-nums transition-colors duration-150 inline-block ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
