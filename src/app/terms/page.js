import Link from 'next/link';

export const metadata = {
    title: 'Terms of Use & Disclaimer | Yourself to Science',
    description:
        'Legal terms, conditions, and disclaimers for using yourselftoscience.org and participating in research programs.',
};

export default function TermsPage() {
    return (
        <div className="bg-slate-50 py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-slate-200">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Use & Disclaimer</h1>
                <p className="text-slate-500 font-medium mb-10 pb-6 border-b border-slate-100">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">

                    <p className="text-lg text-slate-700">
                        Welcome to Yourself to Science (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By accessing or using yourselftoscience.org (the &quot;Site&quot;), you agree to be bound by these Terms of Use and our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>. If you do not agree with any part of these terms, please do not use our website.
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 m-0">1. Informational Purposes Only (No Medical or Legal Advice)</h2>
                        <p>
                            Yourself to Science is an aggregated, open-source catalogue designed to connect individuals with research opportunities. <strong>We do not provide medical diagnosis, treatment, or legal advice.</strong> The content on this Site—including text, graphics, links to third-party studies, and informational summaries—is for educational and informational purposes only. The Site is provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis, without warranties of any kind.
                        </p>
                        <p>
                            Under no circumstances should the information on this Site be used as a substitute for professional medical advice or legal counsel. Always consult with a qualified healthcare provider before making any decisions regarding your health, participating in a clinical trial, or donating or providing data or samples, whether for compensation or as a volunteer.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 m-0">2. Personal Responsibility and Risk Acknowledgment</h2>
                        <p>
                            Participating in research, clinical trials, or donating or providing data/samples for compensation or otherwise involves inherent and potentially unforeseen risks, including but not limited to physical, mental, emotional, psychological, ethical, legal, or financial consequences. By using our Site to find and engage with these independent opportunities, you acknowledge and agree that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>You are solely responsible</strong> for evaluating the risks and benefits of any opportunity listed on this Site.</li>
                            <li><strong>We do not endorse, guarantee, or legally verify</strong> the safety, efficacy, ethical standards, privacy practices, or outcomes of any third-party organization, clinical trial, or research program listed on our Site.</li>
                            <li>You should thoroughly read the informed consent documents and privacy policies of any third-party program before participating.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 m-0">3. Third-Party Risk, Privacy, and Data Security</h2>
                        <p>
                            We strive to list verifiable organizations; however, we cannot control what happens to your data or biological samples once interacting with a third-party. You acknowledge that engaging with external organizations carries risks, including but not limited to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-4">
                            <li><strong>Data Breaches & Malicious Actors:</strong> External organizations may suffer cyberattacks, data breaches, or unauthorized access, resulting in the exposure of your data.</li>
                            <li><strong>Cross-Border Data Transfers:</strong> Participating in international programs may result in your data being transferred to jurisdictions with different or less stringent data protection and privacy laws than your home country (including outside of the European Union/EEA).</li>
                            <li><strong>Secondary Uses of Data:</strong> Organizations or their partners may use your data in ways you did not anticipate, including commercialization or sharing with other unauthorized third parties.</li>
                        </ul>
                        <p className="mt-4 font-semibold text-slate-800">
                            Yourself to Science disclaims all liability for any damages, privacy violations, or harms resulting from your interaction with or data transfer to any third party discovered via our Site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 m-0">4. Newsletter and Communications</h2>
                        <p>
                            By opting into our newsletter, you consent to receive our newsletter and curated opportunities (including surveys, clinical trials, and partner research programs) based on your interests. We may personalize this content based on optional preferences you provide.
                        </p>
                        <p>
                            You may unsubscribe at any time using the link provided in the emails. We manage your subscription data in accordance with our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 m-0">5. Funding, Sponsorships, and Objectivity</h2>
                        <p>
                            To maintain and grow this open-source project, Yourself to Science may be supported by grants, funding, or collaborations with verified partners.
                        </p>
                        <p>
                            We may highlight specific research programs, partner initiatives, or curated studies. We are committed to providing a useful catalogue, and the presence of highlighted partner content or specific funding sources does not constitute a blank endorsement of those entities&apos; practices, nor does it override the inherent risks outlined in Sections 2 and 3 of these terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by applicable law, including under US and European Union regulations, Yourself to Science, its creators, contributors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, special, or exemplary damages—including but not limited to physical harm, mental or emotional distress, psychological impact, loss of privacy, ethical compromises, legal liabilities, financial loss, or data exposure—arising out of or in connection with your use of the Site or your reliance on any information or third-party links provided herein.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Indemnification</h2>
                        <p>
                            You agree to indemnify, defend, and hold harmless Yourself to Science, its creators, and affiliates from and against any claims, liabilities, damages, and expenses (including legal fees) arising out of your use of the Site, your interaction with any listed third party, or your violation of these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Changes to These Terms</h2>
                        <p>
                            We reserve the right to modify or replace these Terms of Use at any time. We will indicate changes by updating the &quot;Last Updated&quot; date at the top of this page. Your continued use of the Site following the posting of any changes constitutes acceptance of those changes.
                        </p>
                    </section>

                    <section className="bg-slate-100 p-6 rounded-2xl mt-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Contact Us</h2>
                        <p className="text-slate-700 m-0">
                            If you have any questions or concerns regarding these Terms of Use, please contact us at: <a href="mailto:hello@yourselftoscience.org" className="text-blue-600 hover:underline hover:text-blue-800 font-medium">hello@yourselftoscience.org</a>.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
