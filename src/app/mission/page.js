"use client";
// src/app/mission/page.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, animate, useInView } from 'framer-motion';
import { resources } from '@/data/resources';
import { FaHeart, FaGlobe, FaHandshake, FaChartLine, FaGithub, FaBolt, FaUsers, FaSearch, FaShieldAlt, FaCheckCircle, FaStethoscope, FaUniversity, FaRocket, FaUniversalAccess, FaRobot } from 'react-icons/fa';

export default function MissionPage() {
  const totalResources = resources.length;
  const countries = new Set();
  resources.forEach(r => (r.countries || []).forEach(c => countries.add(c)));
  const totalCountries = countries.size;
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  // Animated counter for the opportunities stat
  function AnimatedNumber({ value }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [display, setDisplay] = React.useState(0);

    React.useEffect(() => {
      if (isInView) {
        const controls = animate(0, value, {
          duration: 1.2,
          ease: 'easeOut',
          onUpdate: (v) => setDisplay(Math.floor(v)),
        });
        return () => controls.stop();
      }
    }, [isInView, value]);

    return <span ref={ref}>{display}</span>;
  }

  return (
    <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-10 md:py-14">
      {/* Hero */}
      <motion.section
        className="rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-apple-divider p-6 md:p-10 mb-10 sd-scale"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-apple-primary-text">Our Mission</h1>
            <p className="mt-4 text-lg text-apple-secondary-text max-w-2xl">
              Building the world’s simplest way for anyone to contribute to science — starting now.
            </p>
            <p className="mt-2 text-base text-apple-secondary-text max-w-2xl">
              A unified, public catalogue of clinical trials, registries, datasets, and programs where people contribute their own data or samples/tissue — including paid and volunteer options.
            </p>
            <div className="mt-6">
              <div className="grid grid-cols-2 justify-items-center gap-3 md:grid-cols-6 md:gap-x-2 md:gap-y-3">
                <span className="md:col-start-1 md:col-span-2 inline-flex items-center justify-center text-center gap-2 px-3 py-1.5 rounded-full border border-apple-divider bg-white text-sm text-apple-primary-text"><FaBolt className="text-apple-accent"/> Fast to Explore</span>
                <span className="md:col-start-3 md:col-span-2 inline-flex items-center justify-center text-center gap-2 px-3 py-1.5 rounded-full border border-apple-divider bg-white text-sm text-apple-primary-text"><FaGithub/> Open Source & Data</span>
                <span className="md:col-start-5 md:col-span-2 inline-flex items-center justify-center text-center gap-2 px-3 py-1.5 rounded-full border border-apple-divider bg-white text-sm text-apple-primary-text"><FaUsers/> Community‑Driven</span>
                <span className="md:col-start-2 md:col-span-2 inline-flex items-center justify-center text-center gap-2 px-3 py-1.5 rounded-full border border-apple-divider bg-white text-sm text-apple-primary-text"><FaUniversalAccess/> Accessible for All</span>
                <span className="col-span-2 md:col-start-4 md:col-span-2 inline-flex items-center justify-center text-center gap-2 px-3 py-1.5 rounded-full border border-apple-divider bg-white text-sm text-apple-primary-text"><FaRobot/> AI & Machine-Readable</span>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Link href="/get-involved" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors">Get involved</Link>
              <a href="https://github.com/yourselftoscience/yourselftoscience.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"><FaGithub/> GitHub</a>
              <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors">Explore the catalogue</Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
              <Image src="/preview.png" alt="Site preview" width={1200} height={900} className="w-full h-auto" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* The problem we solve (full-width, prominent) */}
      <section className="mb-12 sd-fade">
        <motion.div className="rounded-2xl border border-apple-divider bg-apple-card p-6" initial={{opacity:0, y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.35}}>
          <h2 className="text-2xl font-bold text-apple-primary-text mb-3">The problem we solve</h2>
          <ul className="space-y-3 text-apple-primary-text">
            <li className="flex items-start gap-3"><FaSearch className="mt-1 text-apple-accent text-xl flex-shrink-0"/><span>There’s no single, reliable place to find all the ways to participate in science by contributing your own data or samples/tissue — across paid and volunteer opportunities.</span></li>
            <li className="flex items-start gap-3"><FaGlobe className="mt-1 text-apple-accent text-xl flex-shrink-0"/><span>Where an opportunity is available is often unclear (global vs country‑specific) and hard to verify.</span></li>
            <li className="flex items-start gap-3"><FaHandshake className="mt-1 text-apple-accent text-xl flex-shrink-0"/><span>What’s required is hard to scan across sites — people can’t quickly see the data needed or whether compensation exists.</span></li>
            <li className="flex items-start gap-3"><FaChartLine className="mt-1 text-apple-accent text-xl flex-shrink-0"/><span>Descriptions aren’t standardized — a normalized view (country, data type, organization, compensation) makes comparison fast.</span></li>
          </ul>
        </motion.div>
      </section>

      {/* Our approach */}
      <section className="mb-12 sd-fade-up">
        <div className="rounded-2xl border border-apple-divider bg-white p-6 sd-fade">
          <h2 className="text-xl font-semibold text-apple-primary-text">Why this matters</h2>
          <p className="mt-2 text-apple-secondary-text">A clear, trusted catalogue shortens time-to-recruit, helps people contribute safely and confidently, and makes participation in science easier for everyone.</p>
        </div>
      </section>

      {/* Who benefits (neutral, de‑polarized) */}
      <section className="mb-10 sd-fade-up">
        <h2 className="text-2xl font-bold text-apple-primary-text mb-4">Who benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div className="rounded-2xl border border-apple-divider bg-apple-card p-5" initial={{opacity:0, y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.35}}>
            <div className="flex items-center gap-3 text-apple-secondary-text"><FaUsers className="w-5 h-5 flex-shrink-0" /> <h3 className="font-semibold text-apple-primary-text benefit-title">Individuals & communities</h3></div>
            <p className="text-sm text-apple-secondary-text mt-1">Find trustworthy opportunities by country and topic — including volunteer and paid options.</p>
          </motion.div>
          <motion.div className="rounded-2xl border border-apple-divider bg-apple-card p-5" initial={{opacity:0, y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.35, delay:0.05}}>
            <div className="flex items-center gap-3 text-apple-secondary-text"><FaStethoscope className="w-5 h-5 flex-shrink-0" /> <h3 className="font-semibold text-apple-primary-text benefit-title">Researchers & Clinicians</h3></div>
            <p className="text-sm text-apple-secondary-text mt-1">Accelerate recruitment by connecting with engaged participants for studies and trials.</p>
          </motion.div>
          <motion.div className="rounded-2xl border border-apple-divider bg-apple-card p-5" initial={{opacity:0, y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.35, delay:0.08}}>
            <div className="flex items-center gap-3 text-apple-secondary-text"><FaRocket className="w-5 h-5 flex-shrink-0" /> <h3 className="font-semibold text-apple-primary-text benefit-title">Platforms & Science Innovators</h3></div>
            <p className="text-sm text-apple-secondary-text mt-1">Be discovered by people ready to participate — grow sign‑ups for your app, registry, or service.</p>
          </motion.div>
          <motion.div className="rounded-2xl border border-apple-divider bg-apple-card p-5" initial={{opacity:0, y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.35, delay:0.1}}>
            <div className="flex items-center gap-3 text-apple-secondary-text"><FaUniversity className="w-5 h-5 flex-shrink-0" /> <h3 className="font-semibold text-apple-primary-text benefit-title">Academic & Public Institutions</h3></div>
            <p className="text-sm text-apple-secondary-text mt-1">Increase participation in your studies and programs — reach people across countries.</p>
          </motion.div>
        </div>
      </section>

      {/* Where this goes next (moved up for visibility) */}
      <section className="mb-12 sd-fade-up">
        <h2 className="text-2xl font-bold text-apple-primary-text mb-4">Where this goes next</h2>
        <ul className="space-y-4">
          {[
            { title: 'Newsletter & Alerts', desc: 'Receive email updates with optional preferences like country, compensation (paid, volunteer, or no preference), and data types. You can also provide demographic details with your consent to receive more tailored alerts.' },
            { title: 'A Thriving Community', desc: 'Building a wide and active community to share ideas, provide feedback, and connect participants with researchers.' },
            { title: 'Trusted Central Hub', desc: 'Becoming the go-to meeting point for people, researchers, companies, academia, and public institutions.' },
            { title: 'Partnerships and Collaborations', desc: 'Building relationships across sectors to expand reach and impact.' },
            { title: 'Broadening Citizen Science', desc: 'In the future, we will expand our catalogue to include a dedicated section for a wider range of citizen science projects. This will feature opportunities for public participation in research that go beyond the contribution of personal data or samples, such as classifying images or collecting environmental data.' }
          ].map((s,idx)=> (
            <motion.li key={idx} className="flex items-start gap-3" initial={{opacity:0, y:6}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{duration:0.3, delay: idx*0.05}}>
              <FaCheckCircle className="mt-0.5 text-apple-accent text-xl flex-shrink-0"/>
              <div>
                <p className="font-semibold text-apple-primary-text">{s.title}</p>
                <p className="text-apple-secondary-text text-sm">{s.desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Key stat */}
      <section className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6 sd-fade">
        {[{label:'Opportunities', value: totalResources}].map((m, i) => (
          <motion.div
            key={i}
            className="rounded-2xl border border-apple-divider bg-apple-card p-5 text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.05 }}
          >
            <p className="text-3xl font-bold text-apple-primary-text leading-tight"><AnimatedNumber value={m.value} /></p>
            <p className="text-sm text-apple-secondary-text mt-1">{m.label}</p>
            <p className="text-xs text-apple-secondary-text mt-0.5">and growing • <Link href="/stats" className="text-blue-700 hover:underline">see stats</Link></p>
          </motion.div>
        ))}
      </section>

      {/* How we do it - REVISED */}
      <section className="mb-12 sd-fade-up">
        <h2 className="text-2xl font-bold text-apple-primary-text mb-4">How we do it</h2>
        <ul className="space-y-4">
          {[
            { icon: FaGlobe, title: 'Radically Open & Reusable', desc: 'The entire project is open source. The dataset (CC0), content (CC BY-SA 4.0), and code (AGPL-3.0) are openly licensed, creating a transparent and reusable foundation for everyone to build upon.' },
            { icon: FaUsers, title: 'Community-Driven', desc: 'We are building a collaborative ecosystem and welcome contributions to our code, content, and data from a global community.' },
            { icon: FaUniversalAccess, title: 'Accessible for All', desc: 'We are committed to creating a project that is usable by everyone, including people with disabilities, and continuously test to meet the highest standards—for example, every page maintains a perfect Lighthouse Accessibility score.' },
            { icon: FaRobot, title: 'AI & Machine-Readable', desc: 'We structure our content to be easily processed by AI and automated systems, following standards like llms.txt to maximize the accessibility and reusability of information.' }
          ].map((item, idx) => (
            <motion.li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-apple-card border border-apple-divider"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}>
               <item.icon className="text-apple-accent text-xl mt-1 flex-shrink-0" />
               <div>
                 <p className="font-semibold text-apple-primary-text">{item.title}</p>
                 <p className="text-apple-secondary-text text-sm">{item.desc}</p>
               </div>
             </motion.li>
            ))}
        </ul>
      </section>

      {/* Get Involved */}
      <section className="mt-12 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-apple-divider p-6 md:p-10 sd-fade-up">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-apple-primary-text">Join the mission</h2>
          <p className="text-apple-secondary-text max-w-xl mx-auto mt-1">We&apos;re building a public good and welcome contributors of all kinds.</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                icon: FaHandshake,
                title: 'For Partners & Institutions',
                desc: 'We are seeking collaborations with companies, academic institutions, and funders who share our vision. If you would like to list an initiative, discuss a partnership, or provide funding, please get in touch.',
                cta: 'Start a Conversation',
                href: '/get-involved#contact-us'
              },
              {
                icon: FaUsers,
                title: 'For Contributors & Community',
                desc: 'This is an open-source project built by and for the community. You can help by contributing to our code, suggesting new services, or joining the discussion.',
                cta: 'See how you can help',
                href: '/get-involved'
              }
            ].map((item, idx) => (
              <motion.div key={idx} className="rounded-2xl border border-apple-divider bg-white p-6 flex flex-col shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}>
                <div className="flex items-center gap-3">
                  <item.icon className="text-apple-accent text-xl" />
                  <h3 className="font-semibold text-apple-primary-text">{item.title}</h3>
                </div>
                <p className="text-apple-secondary-text text-sm mt-3 flex-grow">{item.desc}</p>
                <div className="mt-4">
                  <Link href={item.href} className="text-blue-700 hover:underline font-semibold text-sm">{item.cta}</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


