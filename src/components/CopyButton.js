'use client';
import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

export default function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="ml-3 inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
        >
            {copied ? <FaCheck className="text-green-500 text-sm" /> : <FaCopy className="text-sm" />}
        </button>
    );
}
