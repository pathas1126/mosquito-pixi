import dynamic from 'next/dynamic';
import Alert from '@/components/alert/alert';
import Skeleton from 'react-loading-skeleton';
import useMobile from '@/hooks/useMobile';
import useSeconds, { getFormattedTime } from '@/hooks/useSeconds';
import styles from '@/styles/home.module.scss';
import dayjs from 'dayjs';
import { GetServerSidePropsContext } from 'next';
import localFont from 'next/font/local';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Rank } from './api/rank';

const DynamicMosquito = dynamic(() => import('@/components/mosquito/mosquito'), {
  loading: () => (
    <div style={{ height: '100%' }}>
      <Skeleton height="100%" />
    </div>
  ),
});
const fontCyberpunk = localFont({ src: './fonts/Cyberpunk.ttf' });
const fontBlenderProBook = localFont({ src: './fonts/BlenderPro-Book.woff2' });

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
  const [mosquitoes, setMosquitoes] = useState<{ length: number; index: number; backgroundImage: string; title: string; buttonClassName: string }[]>([]);
  const [totalMosquitoLength, setTotalMosquitoLength] = useState(0);
  const [killedMosquitoLength, setKilledMosquitoLength] = useState(0);
  const [loading, setLoading] = useState(false);

  const refTime = useRef(0);

  const seconds = useSeconds({ start: killedMosquitoLength > 0, end: killedMosquitoLength === totalMosquitoLength });
  // console.log('🚀 ~ file: index.tsx:34 ~ seconds:', seconds);

  const [date, setDate] = useState('');

  const [alertText, setAlertText] = useState('');

  const refMosquitoSlide = useRef<HTMLDivElement | null>(null);

  const isMobile = useMobile();

  useEffect(() => {
    if (!mosquitoStatus) return;

    setDate(mosquitoStatus.MOSQUITO_DATE);

    const { mosquitoesLength: mosquitoesParkLength, index: mosquitoesParkIndex } = getMosquitoesLength(mosquitoStatus.MOSQUITO_VALUE_PARK);
    const { mosquitoesLength: mosquitoesWaterLength, index: mosquitoesWaterIndex } = getMosquitoesLength(mosquitoStatus.MOSQUITO_VALUE_WATER);
    const { mosquitoesLength: mosquitoesHouseLength, index: mosquitoesHouseIndex } = getMosquitoesLength(mosquitoStatus.MOSQUITO_VALUE_HOUSE);

    setTotalMosquitoLength(mosquitoesParkLength + mosquitoesWaterLength + mosquitoesHouseLength);

    setMosquitoes([
      { title: 'Park', length: mosquitoesParkLength, index: mosquitoesParkIndex, backgroundImage: 'grid_park.png', buttonClassName: 'bg-green' },
      { title: 'Water', length: mosquitoesWaterLength, index: mosquitoesWaterIndex, backgroundImage: 'grid_water.png', buttonClassName: 'bg-blue' },
      { title: 'Residence', length: mosquitoesHouseLength, index: mosquitoesHouseIndex, backgroundImage: 'grid_residence.png', buttonClassName: 'bg-purple' },
    ]);
  }, [mosquitoStatus]);

  useEffect(() => {
    if (!killedMosquitoLength) return;

    switch (killedMosquitoLength) {
      case 1:
        playBackgroundSound();
        if (killedMosquitoLength !== totalMosquitoLength) return setAlertText('Mission: Catch all mosquitoes.');
      case totalMosquitoLength:
        playCompleteSound();
        let completeText = `Mission Complete In ${getFormattedTime(refTime.current)}`;
        setLoading(true);
        fetch(`/api/rank?record=${refTime.current}&date=${date}`)
          .then((res) => res.json())
          .then((result: { data: Rank }) => {
            const {
              data: { isMe, ip, record },
            } = result;

            const formattedRecord = getFormattedTime(record);
            const winner = isMe ? 'You' : 'Someone';

            completeText += `\r\n\r\nToday's Champion`;
            completeText += `\r\n> `;
            completeText += `[${winner}] ${formattedRecord}`;

            setAlertText(completeText);
          })
          .catch((error) => {
            console.error(error);
            setAlertText(completeText);
          })
          .finally(() => setLoading(false));
        return;
    }
  }, [killedMosquitoLength, totalMosquitoLength, date]);

  useEffect(() => {
    refTime.current = seconds.value;
  }, [seconds]);

  const playBackgroundSound = () => {
    const audio = new Audio('/sounds/stars.mp3');
    audio.volume = 0.4;
    audio.loop = true;
    audio.play();
  };
  const playCompleteSound = () => new Audio('/sounds/complete.mp3').play();

  const getMosquitoesLength = (indexString: string) => {
    const index = Number(indexString);
    const roundedIndex = Math.round(index);
    return { mosquitoesLength: roundedIndex, index };
  };

  const getTileBackgroundClassName = (index: number) => {
    if (index >= 75) return 'horrible';
    if (index >= 50) return 'attention';
    if (index >= 25) return 'concern';
    return 'good';
  };

  const closeAlert = () => setAlertText((prev) => '');

  const killMosquito = useCallback(() => {
    setKilledMosquitoLength((prev) => prev + 1);
  }, []);

  const leftMosquitoLength = totalMosquitoLength - killedMosquitoLength;
  const title = !!killedMosquitoLength ? (leftMosquitoLength ? leftMosquitoLength : 'Mission Clear') : 'We-ing We-ing';

  return (
    <main className={styles.main} id="home">
      {!!alertText && <Alert closeAlert={closeAlert} text={alertText} />}
      <header className={styles.header}>
        {loading ? (
          <h2 className={[fontCyberpunk.className, styles['cyber-glitch-4']].join(' ')}>Loading...</h2>
        ) : (
          <h2 className={fontCyberpunk.className}>{title}</h2>
        )}
        <h6 className={fontBlenderProBook.className}>
          {date || ''} Seoul Mosquito Index<span className={styles['cyber-glitch']}>_</span>
          {!!seconds.value && seconds.formatted}
        </h6>
      </header>
      <div className={styles['section-wrapper']}>
        <div className={`${styles.palette} ${fontBlenderProBook.className}`}>
          {['Good', 'Concern', 'Attention', 'Horrible'].map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        {mosquitoStatus ? (
          isMobile ? (
            <div className={styles['mosquito-section-mobile']}>
              <div className={styles['mosquito-slide-button-wrapper']}>
                {mosquitoes.map(({ title, buttonClassName }, index) => (
                  <button
                    key={title}
                    className={`${styles['cyber-button']} ${styles[buttonClassName]}`}
                    onClick={() => {
                      if (!refMosquitoSlide.current) return;
                      const moveWidth = refMosquitoSlide.current.children[0]?.clientWidth;
                      refMosquitoSlide.current.style.left = `-${index * moveWidth}px`;
                    }}
                  >
                    {title}
                    <span className={styles['glitch-text']}>throw err;</span>
                    <span className={styles.tag} />
                  </button>
                ))}
              </div>
              <div className={styles['mosquito-slide-wrapper']} ref={refMosquitoSlide}>
                {mosquitoes.map((mosquito, index) => (
                  <div key={index} className={styles['mosquito-mobile-wrapper']}>
                    <article className={`${styles['mosquito-mobile']} ${styles[getTileBackgroundClassName(mosquito.index)]}`}>
                      <div className={styles['mosquito-rectangle']}>
                        <DynamicMosquito mosquitoLength={mosquito.length} backgroundImage={mosquito.backgroundImage} onKillMosquito={killMosquito} />
                      </div>
                      <span className={styles['mosquito-info']} data-title={mosquito.title}>
                        Mosquito Index: {mosquito.index}
                      </span>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <section className={styles['mosquito-section']}>
              {mosquitoes.map((mosquito, index) => (
                <article className={`${styles['mosquito-wrapper']} ${styles[getTileBackgroundClassName(mosquito.index)]}`} key={index}>
                  <div className={styles['mosquito-rectangle']}>
                    <DynamicMosquito mosquitoLength={mosquito.length} backgroundImage={mosquito.backgroundImage} onKillMosquito={killMosquito} />
                  </div>
                  <span className={styles['mosquito-info']} data-title={mosquito.title}>
                    Mosquito Index: {mosquito.index}
                  </span>
                </article>
              ))}
            </section>
          )
        ) : (
          <section className={`${styles['mosquito-section-no-data']} ${fontCyberpunk.className}`}>
            <h2>Something{"'"}s Going Wrong</h2>
            {dayjs().month() < 4 || dayjs().month() > 9 ? <p>Only available in summer(5~10)</p> : ''}
          </section>
        )}
      </div>
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

export async function getServerSideProps(context: GetServerSidePropsContext): Promise<{ props: { mosquitoStatus: IMosquitoStatus | null } }> {
  const today = dayjs().format('YYYY-MM-DD');

  // return {
  //   props: { mosquitoStatus: { MOSQUITO_DATE: '2023-04-13', MOSQUITO_VALUE_HOUSE: '1', MOSQUITO_VALUE_PARK: '0', MOSQUITO_VALUE_WATER: '0' } },
  // };

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
