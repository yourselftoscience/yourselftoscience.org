import { Suspense } from 'react';
import GetInvolvedClientPage from './GetInvolvedClientPage';

export const metadata = {
  title: 'Get Involved - Yourself To Science',
  description: 'Help build the future of citizen science. Suggest a new service, contact us, join the community discussion, or contribute to the code.',
};

export default function GetInvolvedPage() {
  return (
    <Suspense>
      <GetInvolvedClientPage />
    </Suspense>
  );
} 