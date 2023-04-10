import React, { ReactNode } from 'react';
import styles from './layout.module.css';

interface IProps {
  children: ReactNode;
  className: string;
}

const Layout: React.FC<IProps> = ({ children, className }) => {
  return <main className={!!className ? `${styles.main} ${className}` : styles.main}>{children}</main>;
};

export default Layout;
