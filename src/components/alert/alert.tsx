import localFont from 'next/font/local';
import styles from './alert.module.scss';
import { useEffect } from 'react';
import { vibrate } from '@/utils/vibrate';

interface IProps {
  closeAlert: () => void;
  text: string;
}

const Alert: React.FC<IProps> = ({ closeAlert, text }) => {
  const handleWrapperClick = () => {
    closeAlert();
  };

  const playReceiveSound = () => new Audio('/sounds/receive.mp3').play();
  const playCloseSound = () => new Audio('/sounds/close.mp3').play();

  useEffect(() => {
    vibrate(30);
    playReceiveSound();
    return () => {
      playCloseSound();
    };
  }, []);

  return (
    <section className={styles['alert-wrapper']} onClick={handleWrapperClick}>
      <article className={styles['cyber-tile']}>
        <label>{text}</label>
      </article>
    </section>
  );
};

export default Alert;
