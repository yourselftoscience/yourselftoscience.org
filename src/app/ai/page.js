"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaRobot, FaCheckCircle, FaNetworkWired, FaCode, FaFileAlt, FaDatabase, FaArrowRight } from 'react-icons/fa';

export default function AIPage() {
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
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold mb-6">
            <FaRobot className="text-purple-600" />
            <span>AI-Native Knowledge Graph</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-apple-primary-text mb-6 leading-tight"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Agents & AI.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-apple-secondary-text mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            Yourself to Science isn't just a static website—it's a machine-readable ecosystem. We expose our entire open-source catalogue directly to AI models, IDEs, and autonomous agents using global standards like MCP.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <a href="https://mcp.yourselftoscience.org/mcp" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md hover:shadow-lg">
              <FaNetworkWired /> Connect MCP Server
            </a>
            <Link href="/llms.txt" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-apple-primary-text bg-white border border-apple-divider hover:bg-gray-50 rounded-xl transition-all shadow-sm">
              <FaFileAlt /> View llms.txt
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. MCP Integration */}
      <section className="mb-24">
        <motion.div
          className="rounded-3xl border border-apple-divider bg-white p-8 md:p-12 shadow-sm"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-apple-primary-text mb-4">Model Context Protocol (MCP)</h2>
          <p className="text-lg text-apple-secondary-text mb-8 leading-relaxed max-w-4xl">
            We natively support the <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Model Context Protocol</a>, the new open standard for connecting AI assistants to data sources. By connecting our MCP server to your AI platform, your agent gains live, semantic search capabilities across our entire catalogue of clinical trials, biobanks, and scientific participation opportunities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 border border-apple-divider p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><FaCode className="text-gray-500" /> Developer IDEs</h3>
              <p className="text-apple-secondary-text mb-4">
                Instantly connect the catalogue directly into your coding environment to augment your research and development workflows. Built for developers, bio-informatics researchers, and open-source contributors building the next generation of health platforms.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> <strong>Cursor</strong></li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> <strong>Roo Code / VS Code</strong></li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> <strong>Windsurf</strong></li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-apple-divider p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><FaRobot className="text-gray-500" /> Chat Assistants & Agents</h3>
              <p className="text-apple-secondary-text mb-4">
                Use our MCP with consumer chatbots to query the database conversationally. Perfect for citizens finding ways to participate, researchers discovering comparable studies, and anyone exploring the scientific landscape.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> <strong>Claude Desktop</strong></li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> <strong>ChatGPT (App / Deep Research)</strong></li>
                <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> <strong>LibreChat & Custom Gemini clients</strong></li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 text-gray-300 p-6 rounded-2xl font-mono text-sm overflow-x-auto">
            <p className="text-gray-400 mb-2">// How to add to your Claude Desktop config (claude_desktop_config.json)</p>
            <code>
              {`{
  "mcpServers": {
    "yourselftoscience": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/inspector", "https://mcp.yourselftoscience.org/mcp"]
    }
  }
}`}
            </code>
          </div>
        </motion.div>
      </section>

      {/* 3. llms.txt standard */}
      <section className="mb-24">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <div className="w-16 h-16 mx-auto bg-purple-50 border border-purple-200 rounded-full flex items-center justify-center mb-5">
            <FaFileAlt className="text-2xl text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-apple-primary-text mb-4">Built-in /llms.txt</h2>
          <p className="text-lg text-apple-secondary-text">
            For web-crawling bots and standard LLM scraping, we officially support the <code>/llms.txt</code> standard. 
            All documentation and metadata is perfectly formatted for AI digestion, reducing hallucination and improving RAG (Retrieval-Augmented Generation) outcomes.
          </p>
        </motion.div>
      </section>

    </main>
  );
}
