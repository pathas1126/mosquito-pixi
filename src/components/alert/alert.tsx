import localFont from 'next/font/local';
import styles from './alert.module.scss';

interface IProps {
  closeAlert: () => void;
  text: string;
}

const Alert: React.FC<IProps> = ({ closeAlert, text }) => {
  const handleWrapperClick = () => {
    closeAlert();
  };

  return (
    <section className={styles['alert-wrapper']} onClick={handleWrapperClick}>
      <article className={styles['cyber-tile']}>
        <label>{text}</label>
      </article>
    </section>
  );
};

export default Alert;
