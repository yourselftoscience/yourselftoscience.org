'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { FaDna, FaHeartbeat, FaMicroscope, FaArrowRight, FaGlobeAmericas, FaBuilding } from 'react-icons/fa';
import { motion } from 'framer-motion';

const DataTypeIcon = ({ type }) => {
    if (type.includes('Genome') || type.includes('DNA')) return <FaDna className="text-rose-500" />;
    if (type.includes('Health')) return <FaHeartbeat className="text-blue-500" />;
    return <FaMicroscope className="text-purple-500" />;
};

export default function GeneticProgramCard({ resource }) {
    const isCommercial = resource.entityCategory === 'Commercial';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative flex flex-col bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
        >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                            {resource.title}
                        </h3>
                        {resource.organizations && (
                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                <FaBuilding className="mr-1.5 opacity-60" />
                                {resource.organizations.map(o => o.name).join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Origin Badge */}
                    {resource.origin && (
                        <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-50/50 px-2 py-1 rounded-full border border-gray-100">
                            <FaGlobeAmericas className="mr-1" />
                            {resource.originCode || resource.origin}
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {resource.description}
                </p>

                {/* Tags / Data Types */}
                <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {resource.dataTypes?.slice(0, 3).map((type, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                <span className="mr-1.5"><DataTypeIcon type={type} /></span>
                                {type}
                            </span>
                        ))}
                        {resource.dataTypes?.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold text-gray-400">
                                +{resource.dataTypes.length - 3} more
                            </span>
                        )}
                    </div>

                    {/* Action Button */}
                    <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group-hover:from-blue-500 group-hover:to-indigo-500"
                    >
                        Participate
                        <FaArrowRight className="ml-2 text-sm" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}

GeneticProgramCard.propTypes = {
    resource: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        link: PropTypes.string,
        organizations: PropTypes.array,
        origin: PropTypes.string,
        originCode: PropTypes.string,
        dataTypes: PropTypes.array,
        entityCategory: PropTypes.string,
    }).isRequired,
};
