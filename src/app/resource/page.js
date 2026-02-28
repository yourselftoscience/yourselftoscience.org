import { redirect } from 'next/navigation';

export default function ResourceIndexPage() {
  // Gracefully redirect users who accidentally drop the slug from the URL
  redirect('/resources');
}
