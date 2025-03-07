import React, { useState, useRef, useEffect, RefObject } from 'react';
import '../styles/pages/shared.css';
import '../styles/pages/support.css';
import { FaQuestionCircle, FaBookOpen, FaEnvelope, FaBook } from 'react-icons/fa';
import { useToast } from '../components/ToastProvider';
import { Link } from 'react-router-dom';

const SupportPage = () => {
  const { showToast } = useToast();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const supportBarRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (hoveredIndex !== null && supportBarRefs.current[hoveredIndex]) {
      const element = supportBarRefs.current[hoveredIndex];
      if (element) {
        const buffer = 20; // Extra space for visual comfort
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.scrollBy(0, buffer); // Add a little extra space at the top
      }
    }
  }, [hoveredIndex]);

  const setRef = (el: HTMLDivElement | null, index: number) => {
    supportBarRefs.current[index] = el;
  };

  const supportCategories = [
    {
      icon: <FaBook />,
      title: 'How to use LearnLink',
      description: 'Get started with a comprehensive guide on how to use LearnLink effectively.',
      link: '/guide',
      details: [
        'Learn navigation basics',
        'Discover key features',
        'Tips and tricks for better usage',
        'Step-by-step tutorials'
      ]
    },
    {
      icon: <FaQuestionCircle />,
      title: 'FAQ',
      description: 'Find answers to commonly asked questions about LearnLink features and services.',
      link: '/faq',
      details: [
        'Common questions answered',
        'Troubleshooting guides',
        'Feature explanations',
        'Quick solutions'
      ]
    },
    {
      icon: <FaBookOpen />,
      title: 'Frequently Used Resources',
      description: 'Access popular tools, guides, and learning materials to enhance your experience.',
      details: [
        'Popular learning materials',
        'Useful tools and templates',
        'Study guides',
        'Resource library'
      ]
    },
    {
      icon: <FaEnvelope />,
      title: 'Contact for Help',
      description: 'Need additional support? Reach out to our dedicated support team for assistance.',
      details: [
        'Contact support team',
        'Submit a ticket',
        'Live chat support',
        'Email assistance'
      ]
    }
  ];

  const handleCategoryClick = (index: number) => {
    const category = supportCategories[index];
    if (!category.link) {
      showToast(`Feature coming soon!`, 'success');
    }
  };

  return (
    <div className="support-container">
      <div className="page-header">
        <h1 className="page-title">Support Center</h1>
        <h2 className="page-subtitle">How Can We Help You?</h2>
        <p className="page-description">We're here to help and answer any question you might have</p>
      </div>

      <div className="support-list">
        {supportCategories.map((category, index) => (
          <div 
            key={index} 
            className="support-bar"
            ref={(el) => setRef(el, index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link to={category.link || '#'} className="support-bar-content">
              <div className="support-bar-icon">
                {category.icon}
              </div>
              <div className="support-bar-text">
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>
            </Link>
            {hoveredIndex === index && (
              <div className="support-details-dropdown">
                <ul>
                  {category.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupportPage; 