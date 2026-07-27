"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaCheckCircle,
  FaCode,
  FaDatabase,
  FaFileAlt,
  FaGlobe,
  FaNetworkWired,
  FaRobot,
  FaSearch,
} from 'react-icons/fa';

const interfaces = [
  {
    title: 'MCP Server',
    description: 'A public, authless Streamable HTTP server with catalogue search, retrieval, facets, statistics, and citation-oriented tools.',
    href: 'https://mcp.yourselftoscience.org/mcp',
    label: 'Connect to MCP',
    icon: FaNetworkWired,
  },
  {
    title: 'A2A Agent',
    description: 'A callable A2A 1.0 JSON-RPC agent for ranked natural-language search and structured resource retrieval.',
    href: '/.well-known/agent-card.json',
    label: 'View Agent Card',
    icon: FaRobot,
  },
  {
    title: 'OpenAPI',
    description: 'An OpenAPI 3.1 description for the datasets, public health endpoint, and A2A interface.',
    href: '/openapi.json',
    label: 'View OpenAPI',
    icon: FaCode,
  },
  {
    title: 'Agent Skill',
    description: 'A digest-verified Agent Skills discovery entry explaining how agents should search, interpret, and cite the catalogue.',
    href: '/.well-known/agent-skills/index.json',
    label: 'View Skills Index',
    icon: FaFileAlt,
  },
  {
    title: 'API Catalog',
    description: 'An RFC 9727 linkset that ties together service descriptions, documentation, health, linked data, and agent interfaces.',
    href: '/.well-known/api-catalog',
    label: 'View API Catalog',
    icon: FaSearch,
  },
  {
    title: 'Open Dataset',
    description: 'The complete catalogue is available without authentication as JSON, CSV, RDF/Turtle, a Data Package, and VoID metadata.',
    href: '/data',
    label: 'Explore Data Access',
    icon: FaDatabase,
  },
];

const discoveryEndpoints = [
  ['API catalog', '/.well-known/api-catalog'],
  ['MCP Server Card', '/.well-known/mcp/server-card.json'],
  ['MCP registry manifest', '/.well-known/mcp.json'],
  ['A2A Agent Card', '/.well-known/agent-card.json'],
  ['Agent Skills index', '/.well-known/agent-skills/index.json'],
  ['Authentication policy', '/auth.md'],
  ['LLM documentation index', '/llms.txt'],
  ['OpenAPI specification', '/openapi.json'],
  ['Health endpoint', '/api/health'],
];

export default function AIPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-12 md:py-20">
      <section className="mb-20 md:mb-28 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
        <motion.div
          className="flex-1"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold mb-6">
            <FaRobot className="text-purple-600" />
            <span>Open, machine-readable, agent-callable</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-apple-primary-text mb-6 leading-tight"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">AI and agents.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-apple-secondary-text mb-8 max-w-3xl mx-auto md:mx-0 leading-relaxed">
            Yourself to Science exposes its public catalogue through open data, linked data, Markdown negotiation, MCP, A2A, OpenAPI, WebMCP, Agent Skills, and standards-based discovery. No account, API key, OAuth token, or registration is required for read-only access.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <a href="https://mcp.yourselftoscience.org/mcp" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg">
              <FaNetworkWired /> Connect MCP Server
            </a>
            <Link href="/.well-known/api-catalog" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-apple-primary-text bg-white border border-apple-divider hover:bg-gray-50 rounded-xl transition-all shadow-sm">
              <FaSearch /> Discover Interfaces
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="mb-24">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-apple-primary-text mb-4">Choose the interface your agent understands</h2>
          <p className="text-lg text-apple-secondary-text">
            Every interface reads from the same open catalogue and returns canonical resource identifiers and URLs.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {interfaces.map(({ title, description, href, label, icon: Icon }) => (
            <motion.article key={title} variants={fadeUp} className="bg-white border border-apple-divider rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-5">
                <Icon className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-apple-primary-text mb-3">{title}</h3>
              <p className="text-apple-secondary-text leading-relaxed mb-6 flex-1">{description}</p>
              <Link href={href} className="inline-flex items-center gap-2 text-purple-700 font-semibold hover:underline">
                {label} <FaArrowRight className="text-sm" />
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="mb-24">
        <motion.div
          className="rounded-3xl border border-apple-divider bg-white p-8 md:p-12 shadow-sm"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-green-700 font-semibold mb-4">
                <FaGlobe /> Open by design
              </div>
              <h2 className="text-3xl font-bold text-apple-primary-text mb-4">No artificial access barriers</h2>
              <p className="text-lg text-apple-secondary-text mb-7 leading-relaxed">
                Public machine interfaces are read-only, cross-origin accessible, and authentication-free. Automated retrieval, search, AI input, indexing, and model training are explicitly permitted. The dataset is dedicated to the public domain under CC0 1.0.
              </p>
              <ul className="space-y-3 text-apple-secondary-text">
                {[
                  'All crawlers and AI user agents are allowed in robots.txt',
                  'HTML pages return Markdown when Accept: text/markdown is requested',
                  'WebMCP tools are registered directly in supporting browsers',
                  'Canonical JSON, CSV, RDF/Turtle, Data Package, and VoID files are public',
                  'CORS permits independent agents and research tools to retrieve public data',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 text-slate-200 rounded-2xl p-6 overflow-x-auto">
              <p className="text-slate-400 text-sm mb-4">Primary discovery endpoints</p>
              <div className="space-y-3 font-mono text-sm min-w-max">
                {discoveryEndpoints.map(([label, endpoint]) => (
                  <div key={endpoint}>
                    <span className="text-purple-300">{label}</span>
                    <br />
                    <a href={endpoint} className="text-slate-200 hover:text-white hover:underline">https://yourselftoscience.org{endpoint}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mb-12">
        <motion.div
          className="rounded-3xl border border-blue-200 bg-blue-50 p-8 md:p-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-4">For developers and agent builders</h2>
          <p className="text-blue-900 leading-relaxed mb-6 max-w-4xl">
            Start with MCP for tool calling, A2A for agent-to-agent messaging, OpenAPI for ordinary HTTP clients, or the raw CC0 dataset for local analysis and retrieval. The API catalog provides a single standards-based discovery entry point.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/.well-known/api-catalog" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800">
              Open API Catalog <FaArrowRight />
            </Link>
            <Link href="/auth.md" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-blue-300 text-blue-900 font-semibold hover:bg-blue-100">
              Read Access Policy
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
