import '@/styles/globals.css';
import Layout from '@/components/layout/layout';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Noto_Sans_KR, Noto_Serif_KR, Oxanium } from 'next/font/google';
import localFont from 'next/font/local';

const blenderProBook = localFont({ src: './fonts/BlenderPro-Book.woff2' });

const notoSansKr = Noto_Sans_KR({ weight: ['400', '500', '700'], subsets: ['latin'] });
const notoSerifKr = Noto_Serif_KR({ weight: ['200', '300', '400', '500', '600'], subsets: ['latin'] });
const oxanium = Noto_Serif_KR({ weight: ['200', '300', '400', '500', '600'], subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>위잉위잉</title>
        <meta name="description" content="서울 모기 지수를 확인하고 간단한 게임을 해볼 수 있는 사이트입니다." />
        <meta name="keywords" content="서울, 모기, 위잉, 위잉위잉, 게임" />
        <meta name="author" content="pathas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="위잉위잉" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mosquito-pixi.vercel.app/" />
        <meta property="og:image" content="https://mosquito-pixi.vercel.app/thumbnail.png" />
        <meta property="og:description" content="오늘 서울 모기지수는?" />
        <meta property="og:article:author" content="위잉위잉" />
        <link rel="icon" href="/mosquito.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2911304837243701" crossOrigin="anonymous" />
      </Head>
      <Layout className={`${notoSansKr.className} ${notoSerifKr} ${blenderProBook} ${oxanium}`}>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
