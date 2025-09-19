import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Yourself To Science',
  description:
    'This Privacy Policy describes how yourselftoscience.org collects, uses, and shares your personal information when you use our website.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl bg-white p-10 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600 mb-4">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p className="text-gray-700 mb-8">
          Welcome to Yourself To Science (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, yourselftoscience.org.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Information We Collect</h2>
          <p className="text-gray-700 mb-4">We collect information that you voluntarily provide to us and information that is automatically collected when you use our site.</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>
              <strong>Newsletter Subscription:</strong> When you subscribe to our newsletter, we collect your email address. You may also voluntarily provide additional information, such as your first name, country or region, gender, year of birth, and topics of interest in research. Providing this additional information is completely optional and is used to help us tailor our content to your interests.
            </li>
            <li>
              <strong>Contact Form:</strong> If you contact us through our contact form or by email, we collect your name, email address, and any other information you choose to provide in your message.
            </li>
            <li>
              <strong>Hosting and Analytics:</strong> This website is hosted by Cloudflare Pages. We use privacy-focused analytics from two services: Umami (hosted on EU servers) and Cloudflare Web Analytics. Both services provide us with aggregated, anonymous data about our visitors without using cookies or tracking you across sites.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the information we collect for the following purposes:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>To send you our newsletter and other updates if you have subscribed.</li>
            <li>To personalize the newsletter content based on the optional interests you provide. This may include sponsored content relevant to your interests.</li>
            <li>To respond to your questions, comments, and requests.</li>
            <li>To analyze website traffic and user behavior to improve our website and services.</li>
            <li>To maintain the security and integrity of our site.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Sharing Your Information</h2>
          <p className="text-gray-700 mb-4">We do not sell, rent, or trade your personal information. We may share your information with third-party service providers only in the ways that are described in this privacy policy:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>
              <strong>Email Marketing Provider:</strong> We use Mailchimp to manage our newsletter and send emails. When you subscribe, your email address and any other information you provide are shared with Mailchimp for the purpose of sending you the newsletter. You can review Mailchimp&apos;s privacy policy for more information on how they handle data.
            </li>
            <li>
              <strong>Aggregated and Anonymized Data:</strong> We may share aggregated, anonymous statistical information with our partners to report on audience demographics and interests (e.g., &quot;we have X subscribers in country Y interested in topic Z&quot;). This data does not contain any personally identifiable information.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your information if required to do so by law.
            </li>
          </ul>
        </section>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">International Data Transfers</h2>
          <p className="text-gray-700">
            Our service providers, such as Cloudflare and Mailchimp, are global companies. Your information may be stored and processed in any country where they have facilities. We rely on their robust legal and security frameworks to ensure that your data is protected with a level of security that is compliant with international privacy laws, including GDPR.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Your Data Protection Rights</h2>
          <p className="text-gray-700 mb-4">We believe in providing the highest standard of privacy protection to all our users. Therefore, we extend the rights guaranteed under major data protection regulations (like Europe&apos;s GDPR and California&apos;s CCPA) to everyone, regardless of your location. These rights include:</p>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li><strong>The right to know</strong> what personal information we collect about you and how it is used and shared.</li>
            <li><strong>The right to access, update or delete</strong> the information we have on you.</li>
            <li>The right of <strong>rectification</strong> (to correct inaccurate information).</li>
            <li>The right to <strong>object</strong> to our processing of your personal data.</li>
            <li>The right of <strong>restriction</strong> (to limit how we use your data).</li>
            <li>The right to <strong>data portability</strong> (to receive a copy of your data in a machine-readable format).</li>
            <li>The right to <strong>withdraw consent</strong> at any time.</li>
          </ul>
          <p className="text-gray-700 mt-4">
            We do not sell or share your personal information. You can unsubscribe from our newsletter at any time by clicking the &quot;unsubscribe&quot; link in the footer of our emails. To exercise any other rights, please contact us at <a href="mailto:hello@yourselftoscience.org" className="text-blue-600 hover:underline">hello@yourselftoscience.org</a>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Data Security</h2>
          <p className="text-gray-700">
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Business Transfers</h2>
          <p className="text-gray-700">
            If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. The new entity will be required to honor the commitments we have made in this Privacy Policy. We will notify you via a prominent notice on our website of any change in ownership or uses of your personal information, as well as any choices you may have regarding your personal information.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:hello@yourselftoscience.org" className="text-blue-600 hover:underline">hello@yourselftoscience.org</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
