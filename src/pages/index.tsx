import Mosquito from '@/components/mosquito/mosquito';
import styles from '@/styles/home.module.scss';
import dayjs from 'dayjs';
import { GetServerSidePropsContext } from 'next';
import { useEffect, useRef, useState } from 'react';

const references = [
  {
    url: 'https://www.freepik.com/free-vector/green-grass-vector-seamless-texture-lawn-nature-meadow-plant-field-natural-outdoor-illustration_11059458.htm#query=seamless%20grass%20texture&position=2&from_view=keyword&track=ais',
    title: '풀 이미지',
    author: 'macrovector',
    platform: 'Freepik',
  },
  {
    url: 'https://www.freepik.com/free-photo/abstract-background-water-swimming-pool_1147933.htm#page=7&query=pond%20texture&position=4&from_view=search&track=ais',
    title: '물 이미지',
    author: 'Waewkidja',
    platform: 'Freepik',
  },
  { url: 'https://www.pngkey.com/detail/u2q8y3y3u2y3u2i1_mosquito-icon-mosquito-icon-png/', title: '모기 이미지', platform: 'Pngkey' },
  {
    url: 'https://www.freepik.com/free-vector/building-facade_785895.htm#query=apartment%20exture&position=3&from_view=search&track=ais',
    title: '건물 이미지',
    author: 'nucleartist',
    platform: 'Freepik',
  },
  { url: 'http://data.seoul.go.kr/dataList/OA-13285/S/1/datasetView.do', title: '서울 열린 데이터 광장', platform: '서울특별시' },
  { url: 'https://www.pngkey.com/detail/u2a9o0i1q8t4a9t4_orange-watercolor-drop-hd-blood-drop-transparent-free/', title: '피 이미지', platform: 'Pngkey' },
];
interface IProps {
  mosquitoStatus: IMosquitoStatus;
}

const Home: React.FC<IProps> = ({ mosquitoStatus }) => {
  const [mosquitos, setMosquitos] = useState<{ length: number; index: number; backgroundImage: string; title: string }[]>([]);
  const [date, setDate] = useState('');
  const [circleRadius, setCircleRaius] = useState(280);
  const refMosquitoSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mosquitoStatus) return;

    setDate(mosquitoStatus.MOSQUITO_DATE);

    const { mosquitosLength: mosquitosParkLength, index: mosquitosParkIndex } = getMosquitosLength(mosquitoStatus.MOSQUITO_VALUE_PARK);
    const { mosquitosLength: mosquitosWaterLength, index: mosquitosWaterIndex } = getMosquitosLength(mosquitoStatus.MOSQUITO_VALUE_WATER);
    const { mosquitosLength: mosquitosHouseLength, index: mosquitosHouseIndex } = getMosquitosLength(mosquitoStatus.MOSQUITO_VALUE_HOUSE);

    setMosquitos([
      { title: '공원', length: mosquitosParkLength, index: mosquitosParkIndex, backgroundImage: 'grass.jpg' },
      { title: '수변부', length: mosquitosWaterLength, index: mosquitosWaterIndex, backgroundImage: 'pool.jpg' },
      { title: '주거지', length: mosquitosHouseLength, index: mosquitosHouseIndex, backgroundImage: 'apartment.jpg' },
    ]);
  }, [mosquitoStatus]);

  useEffect(() => {
    const resizeCircleDiameter = () => {
      if (!refMosquitoSection.current?.offsetHeight) return;
      const radius = Math.floor(refMosquitoSection.current?.offsetHeight / 4);
      setCircleRaius(radius);
    };

    window.addEventListener('resize', resizeCircleDiameter);

    return () => window.removeEventListener('resize', resizeCircleDiameter);
  }, []);

  const getMosquitosLength = (indexString: string) => {
    const index = Number(indexString);
    const roundedIndex = Math.round(index);
    return { mosquitosLength: roundedIndex, index };
  };

  const getBackgroundColor = (index: number) => {
    if (index >= 75) return '#880E4F';
    if (index >= 50) return '#AD1457';
    if (index >= 25) return '#F06292';
    return '#F48FB1';
  };

  return (
    <main className={styles.main} id="home">
      <header className={styles.header}>
        <h2>위잉위잉</h2>
        <h6>{date || '-'} 서울 모기 지수</h6>
        <div className={styles.palette}>
          <div>쾌적</div>
          <div>관심</div>
          <div>주의</div>
          <div>불쾌</div>
        </div>
      </header>
      {mosquitoStatus ? (
        <section className={styles['mosquito-section']} ref={refMosquitoSection}>
          {mosquitos.map((mosquito, index) => (
            <article
              className={styles['mosquito-wrapper']}
              key={index}
              style={{
                background: getBackgroundColor(mosquito.index),
              }}
            >
              <div
                className={styles['mosquito-circle']}
                style={{
                  width: `${circleRadius}px`,
                  height: `${circleRadius}px`,
                  borderRadius: `${circleRadius}px`,
                }}
              >
                <Mosquito mosquitoLength={mosquito.length} backgroundImage={mosquito.backgroundImage} />
              </div>
              <div className={styles['mosquito-info']}>
                <h3>{mosquito.title}</h3>
                <p>모기지수: {mosquito.index}</p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className={styles['mosquito-section-no-data']}>
          <h2>모기 지수 데이터가 없습니다.</h2>
        </section>
      )}
      <footer className={styles.footer}>
        {references.map((reference) => (
          <div key={reference.title} className={styles.reference}>
            <div>
              <a href={reference.url} target="_blank">
                {reference.title}
              </a>
              {reference.author && <div>by {reference.author}</div>}
              {reference.platform && <div>on {reference.platform}</div>}
            </div>
          </div>
        ))}
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
    console.log('🚀 ~ file: index.tsx:151 ~ getServerSideProps ~ dataToday:', dataToday);

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
