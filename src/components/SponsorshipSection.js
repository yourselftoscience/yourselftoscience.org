import React from 'react';
import Link from 'next/link';
import { FaGithub, FaHeart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

// SiPolar seems to be causing build issues with barrel optimization or version mismatch.
// Using custom SVG for Polar.

function PolarIcon(props) {
    return (
        <svg
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M66.4284 274.26C134.876 320.593 227.925 302.666 274.258 234.219C320.593 165.771 302.666 72.7222 234.218 26.3885C165.77 -19.9451 72.721 -2.0181 26.3873 66.4297C-19.9465 134.877 -2.01938 227.927 66.4284 274.26ZM47.9555 116.67C30.8375 169.263 36.5445 221.893 59.2454 256.373C18.0412 217.361 7.27564 150.307 36.9437 92.318C55.9152 55.2362 87.5665 29.3937 122.5 18.3483C90.5911 36.7105 62.5549 71.8144 47.9555 116.67ZM175.347 283.137C211.377 272.606 244.211 246.385 263.685 208.322C293.101 150.825 282.768 84.4172 242.427 45.2673C264.22 79.7626 269.473 131.542 252.631 183.287C237.615 229.421 208.385 265.239 175.347 283.137ZM183.627 266.229C207.945 245.418 228.016 210.604 236.936 168.79C251.033 102.693 232.551 41.1978 195.112 20.6768C214.97 47.3945 225.022 99.2902 218.824 157.333C214.085 201.724 200.814 240.593 183.627 266.229ZM63.7178 131.844C49.5155 198.43 68.377 260.345 106.374 280.405C85.9962 254.009 75.5969 201.514 81.8758 142.711C86.5375 99.0536 99.4504 60.737 116.225 35.0969C92.2678 55.983 72.5384 90.4892 63.7178 131.844ZM199.834 149.561C200.908 217.473 179.59 272.878 152.222 273.309C124.853 273.742 101.797 219.039 100.724 151.127C99.6511 83.2138 120.968 27.8094 148.337 27.377C175.705 26.9446 198.762 81.648 199.834 149.561Z"
                fill="currentColor"
            />
        </svg>
    );
}

const SPONSOR_DATA = [
    {
        key: 'polar',
        title: 'Direct Contribution',
        description: 'The easiest way to support our work. Your contribution helps us keep the platform open and free.',
        url: 'https://buy.polar.sh/polar_cl_lA99AchQEcjUGKPRr1QxQ2gbcED7rjUBgWVby2vIGU0',
        icon: PolarIcon,
        colorClass: 'text-blue-600',
        btnClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        btnText: 'Support on Polar',
        recommended: true,
    },
    {
        key: 'github',
        title: 'GitHub Sponsors',
        description: 'Ideal if you already have a GitHub account. GitHub sponsors charges zero fees for individuals, so 100% goes to the project.',
        url: 'https://github.com/sponsors/yourselftoscience',
        icon: FaGithub,
        colorClass: 'text-gray-800',
        btnClass: 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-700',
        btnText: 'Sponsor on GitHub',
    }
];

const SUPPORTERS = [
    // { name: 'Name', tier: 'Gold', avatar: '...' }
    // Placeholder for now
];

export default function SponsorshipSection() {
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
        <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <FaHeart className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Support the Project
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    Yourself to Science is an open-source initiative. Your support helps us maintain the platform and expand our ecosystem.
                </p>
            </div>

            <motion.div
                className="grid gap-8 md:grid-cols-2 md:gap-12 max-w-4xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
            >
                {SPONSOR_DATA.map((data) => {
                    const Icon = data.icon;
                    return (
                        <motion.div
                            key={data.key}
                            variants={itemVariants}
                            className={`flex flex-col rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 relative group ${data.recommended
                                ? 'border-2 border-blue-500 ring-4 ring-blue-50'
                                : 'border border-gray-200'
                                }`}
                        >
                            {data.recommended && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                                    EASIEST
                                </div>
                            )}
                            <div className="flex-1 p-8 flex flex-col justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-3 rounded-full transition-colors ${data.recommended ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                            <Icon className={`h-8 w-8 ${data.colorClass}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">{data.title}</h3>
                                    </div>
                                    <p className="mt-6 text-base text-gray-600 leading-relaxed">
                                        {data.description}
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <Link
                                        href={data.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 ${data.btnClass}`}
                                    >
                                        <FaHeart className="mr-2 h-4 w-4" />
                                        {data.btnText}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Corporate Invite */}
            <div className="mt-12 text-center">
                <p className="text-gray-600">
                    Representing a company, non-profit, university, or public institution?{' '}
                    <a href="#contact-us" className="text-blue-600 font-medium hover:text-blue-500 hover:underline">
                        Contact us
                    </a>
                    {' '}for partnership opportunities.
                </p>
            </div>

            {/* Supporters List */}
            <div className="mt-16 max-w-4xl mx-auto text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Our Supporters</h3>
                {SUPPORTERS.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {SUPPORTERS.map((supporter, index) => (
                            <div key={index} className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-900">{supporter.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">
                        Be the first to appear here!
                    </p>
                )}
            </div>
        </div>
    );
}
