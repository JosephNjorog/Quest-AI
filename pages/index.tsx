import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../components/Layout/MainLayout';

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    </MainLayout>
  );
};

export default Home;