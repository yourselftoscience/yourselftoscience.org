// src/app/stats/page.js
'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { resources } from '@/data/resources';
import { EU_COUNTRIES } from '@/data/constants';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaDatabase, FaMoneyBillWave, FaChartBar, FaChevronDown, FaBuilding } from 'react-icons/fa';
import Link from 'next/link';

const StatCard = ({ title, value, icon, children }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className="bg-apple-card border border-apple-divider rounded-2xl p-6 shadow-sm"
  >
    <div className="flex items-center text-apple-secondary-text">
      {icon}
      <h2 className="text-lg font-medium ml-3">{title}</h2>
    </div>
    {value && <p className="text-5xl font-bold mt-4 text-apple-accent">{value}</p>}
    {children}
  </motion.div>
);

const Bar = ({ label, value, maxValue, index }) => {
    const barWidth = Math.max((value / maxValue) * 100, 1); // 1% min width
    return (
        <div className="mb-3" title={`${label}: ${value}`}>
            <div className="flex justify-between items-center text-sm mb-1">
                <p className="text-apple-primary-text truncate">{label}</p>
                <p className="text-apple-secondary-text font-medium">{value}</p>
            </div>
            <div className="w-full bg-apple-divider rounded-full h-1.5">
                <motion.div
                    className="bg-apple-accent h-full rounded-full"
                    style={{ originX: 0 }}
                    initial={{ width: '0%' }}
                    whileInView={{ width: `${barWidth}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: index * 0.07 }}
                />
            </div>
        </div>
    );
};


const StatsPage = () => {
  const { scrollY } = useScroll();
  const [isEuExpanded, setIsEuExpanded] = useState(false);
  const [expandedEntityTypes, setExpandedEntityTypes] = useState(new Set());

  const stats = React.useMemo(() => {
    const totalResources = resources.length;

    const resourcesByCountry = resources.reduce((acc, resource) => {
      if (resource.countries && resource.countries.length > 0) {
        resource.countries.forEach(country => {
          const countryName = country === 'European Union' || EU_COUNTRIES.includes(country) ? 'European Union' : country;
          acc[countryName] = (acc[countryName] || 0) + 1;
        });
      } else {
        acc['Worldwide'] = (acc['Worldwide'] || 0) + 1;
      }
      return acc;
    }, {});

    const resourcesByDataType = resources.reduce((acc, resource) => {
        (resource.dataTypes || []).forEach(type => {
            const baseType = type.startsWith('Wearable data') ? 'Wearable data' : type;
            acc[baseType] = (acc[baseType] || 0) + 1;
        });
        return acc;
    }, {});

    const resourcesByCompensation = resources.reduce((acc, resource) => {
        const type = resource.compensationType || 'donation';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const resourcesByEntityType = resources.reduce((acc, resource) => {
        const category = resource.entityCategory || 'Other';
        const subType = resource.entitySubType || 'Not Specified';

        if (!acc[category]) {
            acc[category] = { count: 0, subTypes: {} };
        }
        acc[category].count++;
        acc[category].subTypes[subType] = (acc[category].subTypes[subType] || 0) + 1;
        return acc;
    }, {});

    const topCountries = Object.entries(resourcesByCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const dataTypesDistribution = Object.entries(resourcesByDataType)
        .sort(([, a], [, b]) => b - a);

    const compensationDistribution = Object.entries(resourcesByCompensation)
        .sort(([, a], [, b]) => b - a);

    const entityTypeDistribution = Object.entries(resourcesByEntityType)
        .map(([name, data]) => ({
            name,
            count: data.count,
            subTypes: Object.entries(data.subTypes).sort(([, a], [, b]) => b - a),
        }))
        .sort((a, b) => b.count - a.count);


    return {
      totalResources,
      topCountries,
      dataTypesDistribution,
      compensationDistribution,
      entityTypeDistribution,
    };
  }, []);
  
  const euBreakdownStats = React.useMemo(() => {
    const euServicesWithCounts = resources.reduce((acc, resource) => {
        if (resource.countries) {
            resource.countries.forEach(country => {
                if (country === 'European Union') {
                    acc['EU-Wide'] = (acc['EU-Wide'] || 0) + 1;
                } else if (EU_COUNTRIES.includes(country)) {
                    acc[country] = (acc[country] || 0) + 1;
                }
            });
        }
        return acc;
    }, {});
    return Object.entries(euServicesWithCounts).sort(([, a], [, b]) => b - a);
  }, []);
  
  const handleEntityTypeToggle = (entityName) => {
    setExpandedEntityTypes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(entityName)) {
            newSet.delete(entityName);
        } else {
            newSet.add(entityName);
        }
        return newSet;
    });
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
        <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 py-12 md:py-16">
            {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
                <>
                    <Script
                        src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://us.umami.is/script.js'}
                        data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                        defer
                    />
                    {process.env.NEXT_PUBLIC_UMAMI_SHARE_DASHBOARD && (
                        <div className="mb-6 text-center">
                            <a
                                href={process.env.NEXT_PUBLIC_UMAMI_SHARE_DASHBOARD}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded border text-sm text-blue-700 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View live traffic dashboard
                            </a>
                        </div>
                    )}
                </>
            )}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12 text-center"
            >
                <h1 className="text-4xl md:text-6xl font-bold text-apple-primary-text mb-3">Project Statistics</h1>
                <p className="text-lg text-apple-secondary-text max-w-3xl mx-auto">
                    An overview of the resources available on Yourself To Science.
                </p>
                <div className="mt-6 text-center">
                    <Link href="/data" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-apple-accent rounded-lg hover:bg-opacity-90 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors">
                            <FaDatabase />
                            <span>View Dataset & API Info</span>
                        </Link>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Row 1: Smaller Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Total Resources" value={stats.totalResources} icon={<FaChartBar size="1.5em" />} />
                    <StatCard title="Compensation Types" icon={<FaMoneyBillWave size="1.5em"/>}>
                        <div className="mt-6">
                            {stats.compensationDistribution.map(([type, count], index) => (
                                <Bar key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={count} maxValue={stats.compensationDistribution[0][1]} index={index} />
                            ))}
                        </div>
                    </StatCard>
                </div>

                {/* Row 2: Larger Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Service Availability by Country" icon={<FaGlobe size="1.5em"/>}>
                        <div className="mt-6">
                            {stats.topCountries.map(([country, count], index) => {
                               const maxValue = stats.topCountries[0][1];
                               if (country === 'European Union') {
                                const barWidth = Math.max((count / maxValue) * 100, 1);
                                return (
                                    <div key="eu-expandable">
                                        <div 
                                            className="mb-3 cursor-pointer" 
                                            title={`European Union: ${count} (click to expand)`}
                                            onClick={() => setIsEuExpanded(!isEuExpanded)}
                                        >
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <div className="flex items-center text-apple-primary-text truncate">
                                                    {country}
                                                    <motion.div animate={{ rotate: isEuExpanded ? 180 : 0 }} className="ml-2 text-apple-accent">
                                                        <FaChevronDown size="0.8em" />
                                                    </motion.div>
                                                </div>
                                                <p className="text-apple-secondary-text font-medium">{count}</p>
                                            </div>
                                            <div className="w-full bg-apple-divider rounded-full h-1.5">
                                                <motion.div
                                                    className="bg-apple-accent h-full rounded-full"
                                                    style={{ originX: 0 }}
                                                    initial={{ width: '0%' }}
                                                    whileInView={{ width: `${barWidth}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: index * 0.07 }}
                                                />
                                            </div>
                                        </div>
        
                                        <AnimatePresence>
                                            {isEuExpanded && (
                                                <motion.div
                                                    key="eu-details"
                                                    initial="collapsed"
                                                    animate="open"
                                                    exit="collapsed"
                                                    variants={{
                                                        open: { opacity: 1, height: 'auto' },
                                                        collapsed: { opacity: 0, height: 0 }
                                                    }}
                                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-4 ml-4 border-l border-apple-divider my-2">
                                                        {euBreakdownStats.map(([euCountry, euCount], euIndex) => (
                                                            <Bar key={euCountry} label={euCountry} value={euCount} maxValue={maxValue} index={euIndex} />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )
                               }
                               return <Bar key={country} label={country} value={count} maxValue={maxValue} index={index} />
                            })}
                        </div>
                    </StatCard>
    
                    <StatCard title="Data Type Distribution" icon={<FaDatabase size="1.5em"/>}>
                        <div className="mt-6">
                            {stats.dataTypesDistribution.map(([type, count], index) => (
                                <Bar key={type} label={type} value={count} maxValue={stats.dataTypesDistribution[0][1]} index={index} />
                            ))}
                        </div>
                    </StatCard>
                    <StatCard title="Entity Type Distribution" icon={<FaBuilding size="1.5em"/>}>
                        <div className="mt-6">
                            {stats.entityTypeDistribution.map((entity, index) => {
                                const isExpanded = expandedEntityTypes.has(entity.name);
                                const maxValue = stats.entityTypeDistribution[0].count;
                                const barWidth = Math.max((entity.count / maxValue) * 100, 1);
                                
                                return (
                                    <div key={entity.name}>
                                        <div 
                                            className="mb-3 cursor-pointer" 
                                            title={`${entity.name}: ${entity.count} (click to expand)`}
                                            onClick={() => handleEntityTypeToggle(entity.name)}
                                        >
                                            <div className="flex justify-between items-center text-sm mb-1">
                                                <div className="flex items-center text-apple-primary-text truncate">
                                                    {entity.name}
                                                    {entity.subTypes.length > 1 && (
                                                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="ml-2 text-apple-accent">
                                                          <FaChevronDown size="0.8em" />
                                                      </motion.div>
                                                    )}
                                                </div>
                                                <p className="text-apple-secondary-text font-medium">{entity.count}</p>
                                            </div>
                                            <div className="w-full bg-apple-divider rounded-full h-1.5">
                                                <motion.div
                                                    className="bg-apple-accent h-full rounded-full"
                                                    style={{ originX: 0 }}
                                                    initial={{ width: '0%' }}
                                                    whileInView={{ width: `${barWidth}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: index * 0.07 }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isExpanded && entity.subTypes.length > 1 && (
                                                <motion.div
                                                    key={`${entity.name}-details`}
                                                    initial="collapsed"
                                                    animate="open"
                                                    exit="collapsed"
                                                    variants={{
                                                        open: { opacity: 1, height: 'auto' },
                                                        collapsed: { opacity: 0, height: 0 }
                                                    }}
                                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-4 ml-4 border-l border-apple-divider my-2">
                                                        {entity.subTypes.map(([subType, subCount], subIndex) => (
                                                            <Bar key={subType} label={subType} value={subCount} maxValue={maxValue} index={subIndex} />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </StatCard>
                </div>
            </motion.div>
        </main>
  );
};

export default StatsPage;
