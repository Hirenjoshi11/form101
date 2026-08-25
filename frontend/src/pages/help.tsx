import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function HelpRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/feedback');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Citizen Feedback &amp; Help...</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-500">
        Redirecting to FormSeva Citizen Feedback &amp; Help...
      </div>
    </>
  );
}
