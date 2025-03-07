import React, { useState, useRef, useEffect } from 'react';
import '../styles/pages/shared.css';
import '../styles/pages/support.css';
import { FaQuestionCircle, FaBookOpen, FaEnvelope, FaBook } from 'react-icons/fa';
import { useToast } from '../components/ToastProvider';
import { Link } from 'react-router-dom';

const SupportPage = () => {
  const { showToast } = useToast();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const supportBarRefs = useRef<Array<HTMLDivElement | null>>([]);

  const setRef = (el: HTMLDivElement | null, index: number) => {
    supportBarRefs.current[index] = el;
  };

  const supportCategories = [
    {
      icon: <FaBook />,
      title: 'How to use LearnLink',
      description: 'LearnLink provides an intuitive platform for students and teachers to manage courses, communicate, and collaborate effectively. This guide walks you through the essential features to help you get started.',
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
      description: "Have questions? Find quick answers about LearnLink's key features, troubleshooting steps, and common user inquiries to enhance your experience.",
      link: '/faq',
      details: [
        'Common questions answered',
        'Troubleshooting guides',
        'Feature explanations',
        'Quick solutions'
      ]
    },
    {
      icon: <FaEnvelope />,
      title: 'Contact for Help',
      description: 'For any issues or inquiries, email us at admin@admin.com.'
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

      <div className="support-list" style={{ overflowY: 'auto', maxHeight: '80vh' }}>
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
            {hoveredIndex === index && category.details && (
              <div className="support-details-dropdown">
                <ul>
                  {category.details.map((detail: string, idx: number) => (
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