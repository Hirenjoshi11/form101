import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FormsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#services-catalog');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Services Catalog...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-500">
        Loading Gujarat Services Catalog...
      </div>
    </>
  );
}
