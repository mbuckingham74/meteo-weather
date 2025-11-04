import React from 'react';
import './AboutPage.css';

function AboutPage() {
  const features = [
    {
      icon: '🌍',
      title: 'Universal Smart Search',
      description: 'ONE flexible input for simple locations AND complex AI-powered weather queries. Ask naturally, get intelligent answers.',
      image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80',
      imageAlt: 'Tornado in open field'
    },
    {
      icon: '🤖',
      title: 'AI Weather Assistant',
      description: 'Natural language weather questions powered by Claude Sonnet 4.5. Ask anything from "Will it rain this weekend?" to "Where should I move for better weather?"',
      image: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=800&q=80',
      imageAlt: 'Children with umbrellas walking in rain'
    },
    {
      icon: '📊',
      title: 'Interactive Weather Radar',
      description: 'Real historical precipitation data with animated radar, storm tracking, weather alerts overlay, and screenshot export.',
      image: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800&q=80',
      imageAlt: 'Dark storm clouds with lightning'
    },
    {
      icon: '🏖️',
      title: 'Climate Comparison',
      description: 'Compare weather patterns across multiple cities with historical data, interactive charts, and AI-powered location matching.',
      image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
      imageAlt: 'Beautiful beach at sunset'
    },
    {
      icon: '📈',
      title: 'Historical Data Analysis',
      description: '585,000+ pre-populated weather records for 148 cities spanning 2015-2025. Instant access to 10+ years of climate patterns.',
      image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80',
      imageAlt: 'Hurricane eye from space satellite view'
    },
    {
      icon: '⚙️',
      title: 'User Preferences & Email Notifications',
      description: 'Comprehensive settings with scheduled weather reports, alerts, and cloud-synced preferences across all devices.',
      image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',
      imageAlt: 'Bright sun rays breaking through clouds'
    }
  ];

  const stats = [
    { number: '585K+', label: 'Weather Records' },
    { number: '148', label: 'Cities Worldwide' },
    { number: '10+', label: 'Years of Data' },
    { number: '95%', label: 'API Cost Reduction' }
  ];

  return (
    <div className="about-page">
      {/* Hero Image Button */}
      <a href="/" className="hero-image-button" aria-label="Go to Meteo Weather home page">
        <div className="hero-image-overlay">
          <span className="hero-image-text">🏠 Go to Meteo Weather</span>
        </div>
      </a>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Welcome to Meteo Weather</h1>
          <p className="hero-subtitle">
            The next-generation weather app that combines AI intelligence with comprehensive
            historical climate data and beautiful visualizations.
          </p>
          <p className="hero-description">
            Built as a Weather Spark clone with modern AI capabilities, Meteo delivers
            instant access to decade-long weather patterns, natural language queries,
            and powerful location comparison tools.
          </p>
        </div>
        <div className="hero-stats">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="about-features">
        <h2 className="section-title">Powerful Features</h2>
        <p className="section-subtitle">
          Everything you need to understand weather patterns and plan ahead
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-image-container">
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  className="feature-image"
                  loading="lazy"
                />
                <div className="feature-icon">{feature.icon}</div>
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="about-technology">
        <h2 className="section-title">Built with Modern Technology</h2>
        <div className="tech-grid">
          <div className="tech-card">
            <div className="tech-icon">⚛️</div>
            <h3>React 19</h3>
            <p>Modern, responsive UI with real-time updates</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🤖</div>
            <h3>Claude AI</h3>
            <p>Natural language processing powered by Anthropic</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🗄️</div>
            <h3>MySQL</h3>
            <p>585K+ pre-populated weather records for instant access</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🐳</div>
            <h3>Docker</h3>
            <p>Containerized for consistent deployment</p>
          </div>
        </div>
      </section>

      {/* Why Meteo Section */}
      <section className="about-why">
        <h2 className="section-title">Why Choose Meteo?</h2>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Pre-populated data means 282x faster queries compared to API calls. Get your weather insights instantly.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🧠</div>
            <h3>AI-First Design</h3>
            <p>Ask questions naturally. No more navigating complex menus - just describe what you want to know.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">📱</div>
            <h3>Progressive Web App</h3>
            <p>Install on any device. Works offline. Native app-like experience on mobile, tablet, and desktop.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🔐</div>
            <h3>Privacy Focused</h3>
            <p>Your data stays secure. Cloud-synced preferences with JWT authentication and enterprise-grade security.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2>Ready to Experience Weather Differently?</h2>
        <p>Get started with Meteo Weather today - it's free!</p>
        <div className="cta-buttons">
          <a href="/" className="cta-button primary">
            Start Exploring Weather
          </a>
          <a href="/compare" className="cta-button secondary">
            Compare Locations
          </a>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
