import localFont from 'next/font/local';
import styles from './alert.module.scss';
import { useEffect } from 'react';
import { vibrate } from '@/utils/vibrate';

const Alert: React.FC = () => {
  return <section className={styles['loading-wrapper']}></section>;
};

export default Alert;
