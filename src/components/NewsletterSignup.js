'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMail,
  FiUser,
  FiGlobe,
  FiCheckCircle,
  FiXCircle,
  FiPlusCircle,
} from 'react-icons/fi';
import { FaTransgender } from 'react-icons/fa';
import { BsCalendarEvent } from 'react-icons/bs';
import { getData } from 'country-list';
import Select from 'react-select';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Define InputField and SelectField outside the main component to prevent re-creation on re-renders
const InputField = forwardRef(({ icon, id, label, ...props }, ref) => (
  <div className="relative flex-grow">
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
      {icon}
    </span>
    <input
      ref={ref}
      id={id}
      {...props}
      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
    />
  </div>
));
InputField.displayName = 'InputField';

const SelectField = ({ icon, id, label, children, ...props }) => (
  <div className="relative flex-grow">
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
      {icon}
    </span>
    <select
      id={id}
      {...props}
      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none text-gray-900"
    >
      {children}
    </select>
  </div>
);

export default function NewsletterSignup({ compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    country: [], // Changed to array for multi-select
    gender: '',
    yearOfBirth: '',
    healthInterests: '',
    signupSource: '',
  });
  const emailInputRef = useRef(null);
  const formRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      setFormData((prev) => ({ ...prev, signupSource: pathname }));
    }
  }, [pathname]);

  const countryOptions = useMemo(() => {
    return getData()
      .map((c) => {
        let name = c.name;

        // Handle specific cases for diplomatic neutrality and user experience
        if (c.code === 'TW') {
          return { value: 'Taiwan', label: 'Taiwan' };
        }
        if (c.code === 'KR') {
          return {
            value: 'Republic of Korea',
            label: 'Republic of Korea (South Korea)',
          };
        }
        if (c.code === 'KP') {
          return {
            value: "Democratic People's Republic of Korea",
            label: "Democratic People's Republic of Korea (North Korea)",
          };
        }

        // Clean up names like "Bahamas, The"
        if (name.endsWith(', The')) {
          name = 'The ' + name.slice(0, -5);
        }
        // Clean up names like "United Arab Emirates (the)"
        if (name.endsWith(' (the)')) {
          name = name.slice(0, -6);
        }
        return { value: name, label: name };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Effect to handle clicks outside the form to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) {
        const hasAnyData =
          formData.email ||
          formData.firstName ||
          formData.country.length > 0 ||
          formData.gender ||
          formData.yearOfBirth ||
          formData.healthInterests;

        if (isExpanded && !hasAnyData) {
          setIsExpanded(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      country: selectedOptions ? selectedOptions.map((o) => o.value) : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      setStatus('success');
      setMessage('Thank you for subscribing!');
      // Reset form if needed
    } else {
      setStatus('error');
      setMessage(result.error || 'Something went wrong. Please try again.');
    }
  };

  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Get the latest scientific opportunities delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <InputField
            ref={emailInputRef}
            id="compact-newsletter-email"
            label="Email Address"
            type="email"
            name="email"
            placeholder="Your email..."
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full pl-12 pr-4 py-2 bg-gray-800 border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-500"
            disabled={status === 'loading'}
            aria-label="Subscribe"
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div ref={formRef} className="w-full max-w-3xl mx-auto my-8">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col items-center"
      >
        <div
          className={`w-full transition-all duration-500 ${
            isExpanded ? 'max-w-3xl' : 'max-w-lg'
          }`}
        >
          <div className="relative flex items-center w-full">
            <InputField
              ref={emailInputRef}
              id="newsletter-email"
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email to subscribe..."
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setIsExpanded(true)}
              required
              className={`w-full pl-12 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-900 ${
                isExpanded ? 'pr-4' : 'pr-32'
              }`}
            />
            {!isExpanded && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
                aria-label="Subscribe"
              >
                Subscribe
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="w-full max-w-3xl mt-4"
            >
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Personalize Your Experience (Optional)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    icon={<FiUser />}
                    id="newsletter-firstname"
                    label="First Name (Optional)"
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />

                  <div className="relative flex-grow">
                    <label htmlFor="country-select" className="sr-only">
                      Country or Region
                    </label>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                      <FiGlobe />
                    </span>
                    <Select
                      inputId="country-select"
                      isMulti
                      name="country"
                      options={countryOptions}
                      onChange={handleCountryChange}
                      placeholder="Country or Region"
                      aria-label="Country or Region"
                      styles={{
                        control: (base) => ({
                          ...base,
                          paddingLeft: '2.5rem',
                          minHeight: '46px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '0.5rem',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: '#9CA3AF',
                          },
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 50, // Ensure dropdown appears above other elements
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: '0 4px',
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#6B7280',
                        }),
                        input: (base) => ({
                          ...base,
                          margin: '0',
                          padding: '0',
                        }),
                      }}
                    />
                  </div>
                  <SelectField
                    icon={<FaTransgender />}
                    id="newsletter-gender"
                    label="Gender (Optional)"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </SelectField>

                  <SelectField
                    icon={<BsCalendarEvent />}
                    id="newsletter-yob"
                    label="Year of Birth (Optional)"
                    name="yearOfBirth"
                    value={formData.yearOfBirth}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>
                      Year of Birth
                    </option>
                    {Array.from({ length: 100 }, (_, i) => (
                      <option key={i} value={currentYear - i}>
                        {currentYear - i}
                      </option>
                    ))}
                  </SelectField>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="newsletter-interests"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Topics you&apos;re interested in (Optional)
                    </label>
                    <InputField
                      icon={<FiPlusCircle />}
                      id="newsletter-interests"
                      label="Topics you're interested in (Optional, comma-separated)"
                      type="text"
                      name="healthInterests"
                      placeholder="e.g., Cancer research, Longevity, Wearable data, Cystic Fibrosis research"
                      value={formData.healthInterests}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center px-4">
                  By subscribing, you agree to our{' '}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . We respect your privacy and will not sell your personal data.
                </p>
                <div className="text-center mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:bg-gray-400"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading'
                      ? 'Subscribing...'
                      : 'Subscribe to Newsletter'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 text-center text-green-800 bg-green-100 border border-green-200 rounded-lg"
            role="alert"
          >
            <FiCheckCircle className="inline-block mr-2 text-2xl" />
            {message}
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 text-center text-red-800 bg-red-100 border border-red-200 rounded-lg"
            role="alert"
          >
            <FiXCircle className="inline-block mr-2 text-2xl" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
