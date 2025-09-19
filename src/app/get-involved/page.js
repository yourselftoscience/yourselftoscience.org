import { Suspense } from 'react';
import GetInvolvedClientPage from './GetInvolvedClientPage';
import NewsletterSignup from '../../components/NewsletterSignup';

export const metadata = {
  title: 'Get Involved | Yourself To Science',
  description: 'Help build the future of citizen science. Suggest a new service, contact us, join the community discussion, or contribute to the code.',
};

export default function GetInvolvedPage() {
  return (
    <Suspense>
      <GetInvolvedClientPage />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <NewsletterSignup />
      </div>
    </Suspense>
  );
} 