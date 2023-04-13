import { useEffect, useRef, useState } from 'react';

interface IProps {
  start: boolean;
  end: boolean;
}

const addFrontZero = (time: number) => {
  const numericString = String(time);
  return numericString.padStart(2, '0');
};

export const getFormattedTime = (time: number) => {
  const seconds = Math.ceil(time / 1000);
  const formatted = `${addFrontZero(seconds)}s ${addFrontZero((time % 1000) / 10)}`;
  return formatted;
};

const useSeconds = ({ start, end }: IProps) => {
  const [time, setTime] = useState(0);
  const timer = useRef<NodeJS.Timer>();

  useEffect(() => {
    if (start) {
      timer.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }
  }, [start]);

  useEffect(() => {
    if (end && !!timer.current) {
      clearInterval(timer.current);
    }
  }, [end]);

  return { value: time, formatted: getFormattedTime(time) };
};

export default useSeconds;
