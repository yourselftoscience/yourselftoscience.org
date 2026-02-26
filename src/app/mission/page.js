"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, animate, useInView } from 'framer-motion';
import { resources } from '@/data/resources';
import { FaHeart, FaGlobe, FaHandshake, FaChartLine, FaGithub, FaBolt, FaUsers, FaSearch, FaShieldAlt, FaCheckCircle, FaStethoscope, FaUniversity, FaRocket, FaUniversalAccess, FaRobot, FaArrowRight, FaMapMarkerAlt, FaDatabase, FaMoneyBillWave, FaProjectDiagram } from 'react-icons/fa';

export default function MissionPage() {
  const totalResources = resources.length;
  const totalDataTypes = new Set();
  resources.forEach(r => (r.dataTypes || []).forEach(d => totalDataTypes.add(d)));
  const totalDataTypesCount = totalDataTypes.size;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animated counter for the opportunities stat
  function AnimatedNumber({ value }) {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [display, setDisplay] = React.useState(0);

    React.useEffect(() => {
      if (isInView) {
        const controls = animate(0, value, {
          duration: 1.5,
          ease: 'easeOut',
          onUpdate: (v) => setDisplay(Math.floor(v)),
        });
        return () => controls.stop();
      }
    }, [isInView, value]);

    return <span ref={ref}>{display}</span>;
  }

  return (
    <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-12 md:py-20">

      {/* 1. The Hook (Hero) */}
      <section className="mb-20 md:mb-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
        <motion.div
          className="flex-1"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-semibold mb-6">
            <FaRocket className="text-blue-600" />
            <span>Open Source Catalogue</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-apple-primary-text mb-6 leading-tight"
          >
            Building the simplest way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">contribute to science.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-apple-secondary-text mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            A unified, public catalogue of clinical trials, registries, databases, and programs where people contribute their own data or samples—including paid, donation, and volunteer options.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Link href="/get-involved" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-apple-accent hover:bg-blue-600 rounded-xl transition-all shadow-md hover:shadow-lg">
              Get involved
            </Link>
            <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-apple-primary-text bg-white border border-apple-divider hover:bg-gray-50 rounded-xl transition-all shadow-sm">
              Explore catalogue <FaArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          className="flex-1 hidden lg:block relative"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          {/* Decorative visual for the hero */}
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-60"></div>
            <div className="relative h-full w-full border border-apple-divider bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden p-6 flex flex-col justify-center gap-4">
              <div className="bg-white border border-apple-divider p-4 rounded-xl shadow-md transform -rotate-2 hover:rotate-0 transition-transform">
                <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><FaDatabase className="text-blue-600" /></div><div className="h-4 w-24 bg-gray-300 rounded"></div></div>
                <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white border border-apple-divider p-4 rounded-xl shadow-md transform rotate-1 lg:translate-x-8 hover:translate-x-4 transition-transform z-10">
                <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><FaHeart className="text-indigo-600" /></div><div className="h-4 w-32 bg-gray-300 rounded"></div></div>
                <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white border border-apple-divider p-4 rounded-xl shadow-md transform -rotate-1 lg:-translate-x-4 hover:translate-x-0 transition-transform">
                <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><FaMoneyBillWave className="text-green-600" /></div><div className="h-4 w-20 bg-gray-300 rounded"></div></div>
                <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. The Status Quo (The Problem) */}
      <section className="mb-24">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-apple-primary-text mb-4">The Challenge</h2>
          <p className="text-lg text-apple-secondary-text">Many programs already exist&mdash;but without shared infrastructure, it&apos;s hard for people to navigate the full landscape. We believe everyone benefits when information is unified and accessible.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {[
            { icon: FaSearch, title: 'Scattered Landscape', desc: 'Registries, donation portals, directories, databases, and services all exist independently\u2014spanning data types from genomes and clinical trials to wearables and microbiome donations\u2014making it hard for anyone to see the full picture.' },
            { icon: FaGlobe, title: 'Geographic Complexity', desc: 'Understanding where an opportunity is available\u2014whether globally or in a specific country\u2014often takes effort. A simple, normalized view would help everyone.' },
            { icon: FaShieldAlt, title: 'Missing Context', desc: 'Details like the nature of an organization—academic, non-profit, government, or commercial—its location, and compensation structure are valuable but not always easy to find or compare.' },
            { icon: FaProjectDiagram, title: 'No Shared Catalogue', desc: 'There is no standardized, open catalogue that describes all these programs in one place\u2014with structured, machine-readable information that anyone can access, reuse, and build upon.' }
          ].map((item, idx) => (
            <motion.div key={idx} variants={fadeUp} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center text-xl mb-6 shadow-sm">
                  <item.icon />
                </div>
                <h3 className="text-xl font-bold text-apple-primary-text mb-3">{item.title}</h3>
                <p className="text-apple-secondary-text leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 3. Our Solution */}
      <section className="mb-24">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Solution: A Unified, Open Catalogue</h2>
              <p className="text-blue-100/80 text-lg mb-8 leading-relaxed">
                By standardizing descriptions—normalizing country, data types, organization, and compensation—we make discovering and comparing opportunities frictionless.
                <br /><br />
                A clear, structured catalogue helps people find the right programs, helps researchers gain visibility, and makes science participatory for everyone.
              </p>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-blue-500/30">
                <div>
                  <p className="text-4xl font-extrabold text-white mb-2"><AnimatedNumber value={totalResources} />+</p>
                  <p className="text-sm text-blue-200 font-medium">Curated Opportunities</p>
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-white mb-2"><AnimatedNumber value={totalDataTypesCount} />+</p>
                  <p className="text-sm text-blue-200 font-medium">Data Types Covered</p>
                </div>
                <div className="col-span-2">
                  <Link href="/stats" className="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors font-medium">
                    And growing &mdash; View Stats <FaArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-blue-800/40 p-10 md:p-16 flex items-center justify-center border-l border-blue-500/20">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/10 space-y-4">
                {/* Mockup filter UI */}
                <div className="flex gap-2">
                  <div className="h-8 flex-1 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-20 bg-white/20 border border-white/20 rounded-lg"></div>
                </div>
                {/* Mockup cards */}
                {[
                  { badge: 'PAID', color: 'bg-green-400/20 text-green-300' },
                  { badge: 'DONATION', color: 'bg-blue-400/20 text-blue-300' },
                  { badge: 'MIXED', color: 'bg-amber-400/20 text-amber-300' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/30 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-4 w-1/2 bg-white/20 rounded"></div>
                      <div className={`h-4 w-16 text-[10px] font-bold uppercase flex items-center justify-center rounded ${item.color}`}>{item.badge}</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-white/15 rounded-full"></div>
                      <div className="h-6 w-20 bg-white/15 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Open Dataset */}
      <section className="mb-24">
        <motion.div
          className="rounded-3xl border border-apple-divider bg-white p-8 md:p-12 shadow-sm relative overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-apple-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
                <FaDatabase /> Public Good
              </div>
              <h2 className="text-3xl font-bold text-apple-primary-text mb-4">An Open Dataset for Everyone</h2>
              <p className="text-lg text-apple-secondary-text mb-6 leading-relaxed">
                We believe science data should be free. Unlike closed platforms, our entire catalogue is available as an <strong>Open Dataset published under the CC0 1.0 Universal license</strong> (Public Domain).
              </p>
              <ul className="space-y-5 mb-8">
                <li className="flex items-start gap-3 text-apple-secondary-text">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" />
                  <span><strong>Downloadable:</strong> Access the full dataset in multiple structured formats (JSON, CSV, Markdown) directly from our Data Portal.</span>
                </li>
                <li className="flex items-start gap-3 text-apple-secondary-text">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" />
                  <span><strong>No Restrictions:</strong> Researchers, platforms, and AI systems can use, modify, and distribute the data without asking permission.</span>
                </li>
                <li className="flex items-start gap-3 text-apple-secondary-text">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" />
                  <span><strong>Community Verified:</strong> Data is continuously vetted and expanded through public GitHub contributions.</span>
                </li>
                <li className="flex items-start gap-3 text-apple-secondary-text">
                  <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" />
                  <span><strong>Wikidata Aligned:</strong> Each resource is mapped to Wikidata QIDs, making the dataset interoperable with the global knowledge graph.</span>
                </li>
              </ul>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/data"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <FaDatabase /> Access the Data
                </Link>
                <Link
                  href="/stats"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-apple-primary-text bg-white border border-apple-divider rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FaChartLine /> View Data Insights
                </Link>
              </div>
            </div>

            {/* Visual representation of data */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-full max-w-[280px]">
                <div className="absolute inset-0 bg-blue-100 rounded-2xl transform rotate-6"></div>
                <div className="absolute inset-0 bg-indigo-100 rounded-2xl transform -rotate-3"></div>
                <div className="relative bg-white border border-apple-divider rounded-2xl p-6 shadow-md font-mono text-xs overflow-hidden">
                  <div className="text-gray-400 mb-2">{`// resources.json`}</div>
                  <div className="text-blue-600">{`[{`}</div>
                  <div className="pl-4 text-purple-600">{`"title": `}<span className="text-green-600">&quot;All of Us&quot;</span>,</div>
                  <div className="pl-4 text-purple-600">{`"wikidataId": `}<span className="text-green-600">&quot;Q25004683&quot;</span>,</div>
                  <div className="pl-4 text-purple-600">{`"compensationType": `}<span className="text-green-600">&quot;mixed&quot;</span>,</div>
                  <div className="pl-4 text-purple-600">{`"entityCategory": `}<span className="text-green-600">&quot;Government&quot;</span>,</div>
                  <div className="pl-4 text-blue-600">{`"dataTypes": `}[</div>
                  <div className="pl-8 text-green-600">&quot;Genome&quot;, &quot;Health data&quot;</div>
                  <div className="pl-4 text-blue-600">]</div>
                  <div className="text-blue-600">{`}]`}</div>

                  {/* Fade out effect at the bottom */}
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Who We Empower (Audiences) */}
      <section className="mb-24">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-apple-primary-text mb-4">Who This Empowers</h2>
          <p className="text-lg text-apple-secondary-text">An open catalogue benefits everyone. We bring together the information that helps people find the right programs and helps programs find the right people.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: FaUsers, title: 'Individuals & Communities', desc: 'Browse opportunities by location, data type, and interest\u2014from volunteer participation to paid compensation.', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
            { icon: FaStethoscope, title: 'Researchers & Clinicians', desc: 'Gain visibility for your study. A structured, open catalogue makes it easier for potential participants to discover your program.', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
            { icon: FaRocket, title: 'Platforms & Innovators', desc: 'Increase discoverability by being listed alongside other programs in a standardized, open, and machine-readable catalogue.', color: 'from-orange-500 to-pink-500', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700' },
            { icon: FaUniversity, title: 'Academic & Public Institutions', desc: 'Gain visibility for your programs in a comprehensive catalogue accessible across geographic boundaries.', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="group rounded-2xl border border-apple-divider bg-white p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative overflow-hidden"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${item.color}`}></div>
              <div className={`w-14 h-14 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center mb-6`}>
                <item.icon className={`text-2xl ${item.text}`} />
              </div>
              <h3 className="text-xl font-bold text-apple-primary-text mb-3">{item.title}</h3>
              <p className="text-apple-secondary-text leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Our Core Principles */}
      <section className="mb-24">
        <div className="rounded-3xl border border-apple-divider bg-gradient-to-br from-gray-50 to-white p-8 md:p-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-apple-primary-text mb-4">Our Core Principles</h2>
            <p className="text-lg text-apple-secondary-text">Science belongs to everyone. We are built on foundations of transparency, access, and community.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaGlobe, title: 'Radically Open', desc: 'Dataset (CC0 1.0), content (CC BY-SA), and code (AGPL-3) are openly licensed.' },
              { icon: FaUsers, title: 'Community-Driven', desc: 'A collaborative ecosystem welcoming contributions from a global base.' },
              { icon: FaUniversalAccess, title: 'Accessible', desc: 'Built for everyone. Maintained with a perfect Lighthouse Accessibility score.' },
              { icon: FaRobot, title: 'AI-Ready', desc: 'Open data (CC0), open-source code, and an llms.txt file make the catalogue fully accessible to AI systems and LLMs.' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <div className="w-16 h-16 mx-auto bg-white border border-apple-divider rounded-full flex items-center justify-center mb-5 shadow-sm">
                  <item.icon className="text-2xl text-apple-primary-text" />
                </div>
                <h3 className="font-bold text-apple-primary-text mb-2">{item.title}</h3>
                <p className="text-sm text-apple-secondary-text">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. The Roadmap */}
      <section className="mb-24">
        <motion.div
          className="max-w-3xl mx-auto mb-16 text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-apple-primary-text mb-4">The Roadmap Ahead</h2>
          <p className="text-lg text-apple-secondary-text">We are continuously iterating to expand our reach and impact.</p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical timeline line */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-px bg-apple-divider md:-translate-x-1/2"></div>

          <div className="space-y-12">
            {[
              { phase: 'Phase 1', title: 'Trusted Central Hub', desc: 'Becoming the go-to reference for citizens, researchers, academia, and public institutions.', icon: FaProjectDiagram },
              { phase: 'Phase 2', title: 'Personalized Alerts', desc: 'Rollout of tailored newsletter updates based on country, data-type preference, and compensation models.', icon: FaBolt },
              { phase: 'Phase 3', title: 'Broadening Citizen Science', desc: 'Expanding beyond personal data to environmental data collection, image classification, and crowd-sourced field research.', icon: FaSearch },
              { phase: 'Phase 4', title: 'Multi-Language Integration', desc: 'Translating the catalogue natively so science is universally accessible regardless of spoken language.', icon: FaGlobe }
            ].map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={idx}
                  className={`relative flex items-center justify-between md:justify-normal gap-8 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 rounded-full bg-white border-4 border-apple-accent transform -translate-x-1/2 z-10 flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 rounded-full bg-apple-accent"></div>
                  </div>

                  {/* Content Box */}
                  <div className="w-full pl-12 md:pl-0 md:w-5/12">
                    <div className="bg-white border border-apple-divider p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-xs font-bold uppercase tracking-wider text-apple-accent mb-2 block">{step.phase}</span>
                      <h3 className="text-xl font-bold text-apple-primary-text mb-2 flex items-center gap-2">
                        <step.icon className="text-apple-secondary-text hidden sm:inline-block" />
                        {step.title}
                      </h3>
                      <p className="text-apple-secondary-text">{step.desc}</p>
                    </div>
                  </div>
                  {/* Empty space for opposite side on desktop */}
                  <div className="hidden md:block md:w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Call To Action */}
      <section className="mb-10">
        <motion.div
          className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 md:p-16 text-center lg:text-left lg:flex lg:items-center lg:justify-between gap-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="max-w-2xl mb-8 lg:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Mission</h2>
            <p className="text-blue-100/90 text-lg">
              We&apos;re building a public good and welcome contributors, funders, and partners of all kinds. Connect with us to list an initiative or help build the catalogue.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link href="/get-involved#contact-us" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-700 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-lg hover:shadow-xl">
              <FaHandshake /> Partner With Us
            </Link>
            <Link href="/get-involved" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm">
              <FaGithub /> Contribute Code
            </Link>
          </div>
        </motion.div>
      </section>

    </main>
  );
}
