'use client';

import Link from 'next/link';
import { FaReddit, FaGithub, FaEnvelope } from 'react-icons/fa';
import { useScroll, useMotionValueEvent, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import SponsorshipSection from '@/components/SponsorshipSection';

export default function GetInvolvedClientPage() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > 10;
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });

  const redditSuggestUrl = `https://www.reddit.com/r/YourselfToScience/submit?title=Suggestion%3A%20New%20Service%20-%20[Service%20Title]&text=Please%20fill%20out%20the%20following%20information%20as%20completely%20as%20possible.%0A%0A**Service%20Title%3A**%20[Service%20Link%3A**%0A%0A**Data%20Types%3A**%20(e.g.%2C%20Genome%2C%20Health%20data%2C%20Fitbit%20data%2C%20etc.)%0A%0A**Countries%20Available%3A**%20(e.g.%2C%20Worldwide%2C%20United%20States%2C%20etc.)%0A%0A**Why%20it's%20a%20good%20fit%20for%20the%20catalogue%3A**`;
  const githubSuggestUrl = `https://github.com/yourselftoscience/yourselftoscience.org/issues/new?template=suggest-a-service.md&title=Suggestion:%20New%20Service%20-%20[Service%20Title]`;

  const searchParams = useSearchParams();
  const [formStatus, setFormStatus] = useState({ submitted: false, error: false });
  const contactFormRef = useRef(null);

  useEffect(() => {
    const submitted = searchParams.get('submitted') === 'true';
    const error = searchParams.get('error') === 'true';
    if (submitted || error) {
      setFormStatus({ submitted, error });
      // Scroll to the contact form section after a short delay
      // to ensure the DOM is updated before the success/error message appears.
      setTimeout(() => {
        contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [searchParams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="flex-grow bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-4">
            <span className="block">Get Involved</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Help us build an open ecosystem for everyone.
          </p>
        </div>

        {/* Sticky Sub-navigation */}
        <div className={`sticky top-[80px] z-40 transition-all duration-300 pointer-events-none mb-12 flex justify-center ${isScrolled ? 'py-2' : 'py-6'}`}>
          <motion.div
            className="pointer-events-auto bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-full px-2 py-1.5 flex items-center space-x-1"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { y: -20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  staggerChildren: 0.1,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {[
              { href: "#contribute", label: "Contribute" },
              { href: "#support", label: "Support" },
              { href: "#contact-us", label: "Contact" }
            ].map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="px-6 py-2.5 rounded-full text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.a>
            ))}
          </motion.div>
        </div>

        <motion.div
          id="contribute"
          className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12 scroll-mt-32"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >

          {/* Option 1: Reddit */}
          {/* Option 1: Reddit */}
          <motion.div variants={itemVariants} className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-reddit-orange/30 hover:-translate-y-1 group">
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-reddit-orange/10 rounded-full group-hover:bg-reddit-orange/20 transition-colors">
                    <FaReddit className="h-8 w-8 text-reddit-orange" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Join the Discussion</h2>
                </div>
                <p className="mt-6 text-base text-gray-600 leading-relaxed">
                  The best place to start. Suggest new services, share ideas, and get feedback from the community. Perfect for all users.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href={redditSuggestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-reddit-orange hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all shadow-md hover:shadow-lg"
                >
                  Suggest on Reddit
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Option 2: GitHub */}
          {/* Option 2: GitHub */}
          <motion.div variants={itemVariants} className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-gray-400 group">
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                    <FaGithub className="h-8 w-8 text-gray-800" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Go Direct</h2>
                </div>
                <p className="mt-6 text-base text-gray-600 leading-relaxed">
                  For developers and those comfortable with GitHub. Use our template to add your suggestion directly to our project tracker.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href={githubSuggestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all shadow-md hover:shadow-lg"
                >
                  Suggest on GitHub
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>


        {/* Sponsorship Section */}
        <motion.div
          id="support"
          className="scroll-mt-32"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SponsorshipSection />
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          id="contact-us"
          ref={contactFormRef}
          className="mt-16 pt-12 border-t border-gray-200 scroll-mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Contact Us</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Have a question, suggestion, or collaboration idea? We’d love to hear from you.
            </p>
          </div>

          <div className="mt-12 max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {formStatus.submitted && (
              <div className="mb-6 p-4 text-center text-green-800 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                <p className="font-semibold text-lg">Thank you!</p>
                <p className="text-sm mt-1">Your message has been sent successfully. We&apos;ll get back to you soon.</p>
              </div>
            )}
            {formStatus.error && (
              <div className="mb-6 p-4 text-center text-red-800 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <p className="font-semibold">Something went wrong.</p>
                <p className="text-sm mt-1">Please try again later.</p>
              </div>
            )}
            <form
              name="contact"
              action="/api/contact"
              method="POST"
              className="grid grid-cols-1 gap-y-6"
            >
              {/* Honeypot field for spam prevention */}
              <input type="text" name="honeypot" style={{ display: 'none' }} />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" id="name" required autoComplete="name" className="block w-full shadow-sm py-3 px-4 text-gray-900 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input id="email" name="email" type="email" required autoComplete="email" className="block w-full shadow-sm py-3 px-4 text-gray-900 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="block w-full shadow-sm py-3 px-4 pr-8 text-gray-900 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
                  >
                    <option>General Question</option>
                    <option>Collaboration Proposal</option>
                    <option>Press / Media Inquiry</option>
                    <option>Suggest a Correction</option>
                    <option>Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><title>Chevron Down</title><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" name="message" rows="4" required className="block w-full shadow-sm py-3 px-4 text-gray-900 bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"></textarea>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:bg-gray-400 transition-all hover:shadow-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <div className="mt-12 text-center text-gray-600">
          <p className="flex items-center justify-center space-x-2">
            <FaEnvelope className="h-5 w-5 text-gray-400" />
            <span>Prefer to email directly?</span>
            <a href="mailto:hello@yourselftoscience.org" className="font-medium text-blue-600 hover:text-blue-500">
              hello@yourselftoscience.org
            </a>
          </p>
        </div>

        <div className="mt-20 text-center text-gray-500">
          <p>
            Want to help in other ways? Explore our{' '}
            <Link
              href="https://github.com/yourselftoscience/yourselftoscience.org"
              className="font-medium text-blue-600 hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              project repository
            </Link>{' '}
            for documentation, code, and more.
          </p>
        </div>
      </main>
    </div >
  );
}
