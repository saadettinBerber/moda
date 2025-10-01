import React from 'react';
import './FeatureCard.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => {
  return (
    <div className="feature-card" style={{ background: gradient }}>
      <div className="feature-card-icon">{icon}</div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-description">{description}</p>
    </div>
  );
};

export default FeatureCard;