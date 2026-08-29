import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
    <LanguageProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Gujarati:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </LanguageProvider>
    </ErrorBoundary>
  );
}
