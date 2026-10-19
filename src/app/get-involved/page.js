import { Suspense } from 'react';
import PageLoading from '@/components/PageLoading';
import GetInvolvedClientPage from './GetInvolvedClientPage';

export const metadata = {
  title: 'Get Involved',
  description: 'Help build the future of citizen science. Suggest a new service, contact us, join the community discussion, or contribute to the code.',
  alternates: {
    canonical: 'https://yourselftoscience.org/get-involved',
  },
};

export default function GetInvolvedPage() {
  return (
    <Suspense fallback={<PageLoading title="Get Involved" description="Suggest research opportunities, contribute to the catalogue, or contact Yourself to Science about collaboration." />}>
      <GetInvolvedClientPage />
    </Suspense>
  );
} 