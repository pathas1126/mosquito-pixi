import Mosquito from '@/components/mosquito/mosquito';
import styles from '@/styles/home.module.scss';
import dayjs from 'dayjs';
import { GetServerSidePropsContext } from 'next';
import { useEffect, useRef, useState } from 'react';
import localFont from 'next/font/local';
import useMobile from '@/hooks/useMobile';

const cyberpunk = localFont({ src: './fonts/Cyberpunk.ttf' });
const blenderProBook = localFont({ src: './fonts/BlenderPro-Book.woff2' });

const references = [
  { url: 'http://data.seoul.go.kr/dataList/OA-13285/S/1/datasetView.do', title: 'Seoul Mosquito Index', platform: 'Seoul' },
  {
    url: 'https://www.vecteezy.com/free-png/grid',
    title: 'Grid PNGs',
    platform: 'Vecteezy',
  },
  { url: 'https://www.flaticon.com/free-icons/entomology', title: 'Mosquito  Icon', author: 'AbtoCreative', platform: 'Flaticon' },
  { url: 'https://www.pngkey.com/detail/u2a9o0i1q8t4a9t4_orange-watercolor-drop-hd-blood-drop-transparent-free/', title: 'Blood PNG', platform: 'Pngkey' },
];
interface IProps {
  mosquitoStatus: IMosquitoStatus;
}

const Home: React.FC<IProps> = ({ mosquitoStatus }) => {
  const [mosquitos, setMosquitos] = useState<{ length: number; index: number; backgroundImage: string; title: string }[]>([]);
  const [date, setDate] = useState('');
  const refMosquitoSection = useRef<HTMLDivElement>(null);

  const isMobile = useMobile();

  useEffect(() => {
    if (!mosquitoStatus) return;

    setDate(mosquitoStatus.MOSQUITO_DATE);

    const { mosquitosLength: mosquitosParkLength, index: mosquitosParkIndex } = getMosquitosLength(mosquitoStatus.MOSQUITO_VALUE_PARK);
    const { mosquitosLength: mosquitosWaterLength, index: mosquitosWaterIndex } = getMosquitosLength(mosquitoStatus.MOSQUITO_VALUE_WATER);
    const { mosquitosLength: mosquitosHouseLength, index: mosquitosHouseIndex } = getMosquitosLength(mosquitoStatus.MOSQUITO_VALUE_HOUSE);

    setMosquitos([
      { title: 'Park', length: mosquitosParkLength, index: mosquitosParkIndex, backgroundImage: 'grid_park.png' },
      { title: 'Water', length: mosquitosWaterLength, index: mosquitosWaterIndex, backgroundImage: 'grid_water.png' },
      { title: 'Residence', length: mosquitosHouseLength, index: mosquitosHouseIndex, backgroundImage: 'grid_residence.png' },
    ]);
  }, [mosquitoStatus]);

  const getMosquitosLength = (indexString: string) => {
    const index = Number(indexString);
    const roundedIndex = Math.round(index);
    return { mosquitosLength: roundedIndex, index };
  };

  const getBackgroundClassName = (index: number) => {
    if (index >= 75) return 'horrible';
    if (index >= 50) return 'attention';
    if (index >= 25) return 'concern';
    return 'good';
  };

  return (
    <main className={styles.main} id="home">
      <header className={styles.header}>
        <h2 className={cyberpunk.className} style={{ fontSize: isMobile ? '2rem' : '2.5rem' }}>
          We-ing We-ing
        </h2>
        <h6 className={blenderProBook.className}>{date || '-'} Seoul Mosquito Index</h6>
      </header>
      {mosquitoStatus ? (
        <section className={styles['mosquito-section']} ref={refMosquitoSection}>
          <div className={`${styles.palette} ${blenderProBook.className}`}>
            {['Good', 'Concern', 'Attention', 'Horrible'].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
          {mosquitos.map((mosquito, index) => (
            <article className={`${styles['mosquito-wrapper']} ${styles[getBackgroundClassName(mosquito.index)]}`} key={index}>
              <div className={styles['mosquito-rectangle']}>
                <Mosquito mosquitoLength={mosquito.length} backgroundImage={mosquito.backgroundImage} />
              </div>
              <span className={styles['mosquito-info']} data-title={mosquito.title}>
                {/* <h3>{mosquito.title}</h3> */}
                Mosquito Index: {mosquito.index}
              </span>
            </article>
          ))}
        </section>
      ) : (
        <section className={`${styles['mosquito-section-no-data']} ${cyberpunk.className}`}>
          <h2>Something{"'"}s Going Wrong</h2>
        </section>
      )}
      <footer className={styles.footer}>
        <div data-title="References" className={styles.reference}>
          <div>
            {references.map((reference) => {
              let linkText = `@${reference.title}`;
              if (reference.author) linkText += ` by ${reference.author}`;
              if (reference.platform) linkText += ` on ${reference.platform}`;

              return (
                <a key={reference.title} href={reference.url} target="_blank">
                  {linkText}
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;

/** getServerSideProps */

const RESPONSE_SUCCESS_CODE = 'INFO-000';

interface IMosquitoStatus {
  //YYYY-MM-DD
  MOSQUITO_DATE: string;
  MOSQUITO_VALUE_WATER: string;
  MOSQUITO_VALUE_HOUSE: string;
  MOSQUITO_VALUE_PARK: string;
}
interface IMosquitoStatusSuccessResponse {
  MosquitoStatus: {
    list_total_count?: number;
    RESULT: { CODE: string; MESSAGE: string };
    row: IMosquitoStatus[];
  };
}

interface IMosquitoStatusFailResponse {
  RESULT: { CODE: string; MESSAGE: string };
}

const getMosquitoStatusURL = (dateString: string) => {
  return `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_DATA_API_KEY}/json/MosquitoStatus/1/1/${dateString}`;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const today = dayjs().format('YYYY-MM-DD');

  try {
    const resToday = await fetch(getMosquitoStatusURL(today));
    const dataToday = (await resToday.json()) as IMosquitoStatusSuccessResponse;

    const successedToday = dataToday?.MosquitoStatus?.RESULT.CODE === RESPONSE_SUCCESS_CODE;

    if (successedToday)
      return {
        props: { mosquitoStatus: dataToday.MosquitoStatus.row[0] },
      };

    const yesterday = dayjs().subtract(1, 'd').format('YYYY-MM-DD');
    const resYesterday = await fetch(getMosquitoStatusURL(yesterday));
    const dataYesterday = (await resYesterday.json()) as IMosquitoStatusSuccessResponse;

    const successedYesterday = dataYesterday?.MosquitoStatus?.RESULT.CODE === RESPONSE_SUCCESS_CODE;

    if (successedYesterday)
      return {
        props: { mosquitoStatus: dataYesterday.MosquitoStatus.row[0] },
      };

    return {
      props: { mosquitoStatus: null },
    };
  } catch (error) {
    console.log(error);
    return {
      props: { mosquitoStatus: null },
    };
  }
}
