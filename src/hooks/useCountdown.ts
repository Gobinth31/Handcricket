import { useEffect, useRef, useCallback, useState } from 'react';

interface UseCountdownOptions {
  initialTime: number;
  onTick?: (time: number) => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useCountdown({
  initialTime,
  onTick,
  onComplete,
  autoStart = false,
}: UseCountdownOptions) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);

  onCompleteRef.current = onComplete;
  onTickRef.current = onTick;

  const start = useCallback(() => {
    setTime(initialTime);
    setIsRunning(true);
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setTime(initialTime);
  }, [initialTime, stop]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        const next = prev - 1;
        onTickRef.current?.(next);

        if (next <= 0) {
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return { time, isRunning, start, stop, reset };
}
