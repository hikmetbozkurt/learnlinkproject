import React, { useState } from 'react';
import '../styles/pages/shared.css';
import '../styles/pages/support.css';
import { FaQuestionCircle, FaBook, FaHeadset, FaLock, FaTimes } from 'react-icons/fa';

const SupportPage = () => {
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const supportCategories = [
    {
      icon: <FaQuestionCircle />,
      title: 'How to Use LearnLink',
      description: 'Quick guide on navigating and using LearnLink.',
      modalContent: {
        title: 'How to Use LearnLink',
        sections: [
          {
            title: 'Getting Started',
            content: 'Welcome to LearnLink! Here\'s how to get started with our platform:',
            image: '[Placeholder for Getting Started Image]'
          },
          {
            title: 'Navigation',
            content: 'Learn how to navigate through different sections of LearnLink:',
            image: '[Placeholder for Navigation Image]'
          }
        ]
      }
    },
    {
      icon: <FaBook />,
      title: 'FAQ',
      description: 'Answers to common questions about features and usage.',
      modalContent: {
        title: 'Frequently Asked Questions',
        sections: [
          {
            title: 'Common Questions',
            content: 'Find answers to frequently asked questions about LearnLink:',
            image: '[Placeholder for FAQ Image]'
          },
          {
            title: 'Features Guide',
            content: 'Learn about our key features and how to use them:',
            image: '[Placeholder for Features Guide Image]'
          }
        ]
      }
    },
    {
      icon: <FaHeadset />,
      title: 'Frequently Used Resources',
      description: 'Essential tools and materials for better learning.',
      modalContent: {
        title: 'Frequently Used Resources',
        sections: [
          {
            title: 'Learning Tools',
            content: 'Access our most popular learning resources and tools:',
            image: '[Placeholder for Learning Tools Image]'
          },
          {
            title: 'Study Materials',
            content: 'Find essential study materials and guides:',
            image: '[Placeholder for Study Materials Image]'
          }
        ]
      }
    },
    {
      icon: <FaLock />,
      title: 'Account & Security',
      description: 'Manage your account settings and security preferences.',
      modalContent: {
        title: 'Account & Security',
        sections: [
          {
            title: 'Account Management',
            content: 'Learn how to manage your LearnLink account:',
            image: '[Placeholder for Account Management Image]'
          },
          {
            title: 'Security Settings',
            content: 'Keep your account secure with these important settings:',
            image: '[Placeholder for Security Settings Image]'
          }
        ]
      }
    }
  ];

  const handleCardClick = (index: number) => {
    setActiveModal(index);
  };

  return (
    <div className="support-container">
      <div className="page-header">
        <h2 className="page-title">Support Center</h2>
      </div>

      <div className="support-grid">
        {supportCategories.map((category, index) => (
          <div 
            key={index} 
            className="support-card"
            onClick={() => handleCardClick(index)}
          >
            <div className="support-card-header">
              <div className="support-card-icon">
                {category.icon}
              </div>
              <h3>{category.title}</h3>
            </div>
            <p>{category.description}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeModal !== null && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>
              <FaTimes />
            </button>
            <div className="modal-header">
              <h2>{supportCategories[activeModal].modalContent.title}</h2>
            </div>
            <div className="modal-body">
              {supportCategories[activeModal].modalContent.sections.map((section, index) => (
                <div key={index} className="modal-section">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                  <div style={{ 
                    height: '200px', 
                    background: '#f5f5f5', 
                    margin: '1rem 0', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {section.image}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage; 