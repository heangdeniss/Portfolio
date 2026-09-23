import { useState } from 'react';
import useReveal from '../hooks/useReveal';

export default function Contact() {
  const [ref, visible] = useReveal();
  const [copiedKey, setCopiedKey] = useState(null);

  // Quick message composer state
  const [name, setName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [message, setMessage] = useState('');

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2400);
    });
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name || 'Prospective Collaborator'}`);
    const body = encodeURIComponent(
      `Hello Denis,\n\n${message}\n\nBest regards,\n${name}\nContact: ${senderContact}`
    );
    window.location.href = `mailto:heangdenis011468@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleSendTelegram = () => {
    const text = encodeURIComponent(
      `Hi Denis, my name is ${name || 'a visitor'} (${senderContact || 'no contact provided'}).\n\n${message || 'I saw your portfolio and would love to connect!'}`
    );
    window.open(`https://t.me/heang_deniss?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact" className="section">
      <div className="container" ref={ref}>
        <div className="section-header">
          <p className="section-label">Get in Touch</p>
          <h2 className="section-title">Let's Connect & Collaborate</h2>
          <p className="section-subtitle">
            Whether you have an inquiry, open role, machine learning project, or just want to discuss AI systems, my inbox is always open.
          </p>
        </div>

        <div className={`contact-layout stagger${visible ? ' visible' : ''}`}>
          
          {/* Left Column: Instant One-Click Copy Hub */}
          <div className="contact-cards-column">
            <h3 className="contact-column-title">Direct Channels</h3>
            
            {/* Email Card */}
            <div className="contact-interactive-card">
              <div className="contact-interactive-card__icon contact-interactive-card__icon--amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="contact-interactive-card__body">
                <span className="contact-interactive-card__lbl">Email Address</span>
                <a href="mailto:heangdenis011468@gmail.com" className="contact-interactive-card__val">
                  heangdenis011468@gmail.com
                </a>
              </div>
              <button
                onClick={() => copyToClipboard('heangdenis011468@gmail.com', 'email')}
                className="contact-copy-btn"
                title="Copy Email"
                aria-label="Copy Email"
              >
                {copiedKey === 'email' ? (
                  <span className="copied-tag">✓ Copied</span>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>

            {/* Telegram Card */}
            <div className="contact-interactive-card">
              <div className="contact-interactive-card__icon contact-interactive-card__icon--cyan">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.85.92z" />
                </svg>
              </div>
              <div className="contact-interactive-card__body">
                <span className="contact-interactive-card__lbl">Telegram Direct</span>
                <a
                  href="https://t.me/heang_deniss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-interactive-card__val"
                >
                  @heang_deniss
                </a>
              </div>
              <button
                onClick={() => copyToClipboard('@heang_deniss', 'telegram')}
                className="contact-copy-btn"
                title="Copy Telegram Handle"
                aria-label="Copy Telegram Handle"
              >
                {copiedKey === 'telegram' ? (
                  <span className="copied-tag">✓ Copied</span>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>

            {/* LinkedIn Card */}
            <div className="contact-interactive-card">
              <div className="contact-interactive-card__icon contact-interactive-card__icon--indigo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div className="contact-interactive-card__body">
                <span className="contact-interactive-card__lbl">LinkedIn Profile</span>
                <a
                  href="https://www.linkedin.com/in/heang-denis-1a4b23369/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-interactive-card__val"
                >
                  linkedin.com/in/heang-denis
                </a>
              </div>
              <button
                onClick={() => copyToClipboard('https://www.linkedin.com/in/heang-denis-1a4b23369/', 'linkedin')}
                className="contact-copy-btn"
                title="Copy LinkedIn URL"
                aria-label="Copy LinkedIn URL"
              >
                {copiedKey === 'linkedin' ? (
                  <span className="copied-tag">✓ Copied</span>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>

            {/* GitHub Card */}
            <div className="contact-interactive-card">
              <div className="contact-interactive-card__icon contact-interactive-card__icon--violet">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="contact-interactive-card__body">
                <span className="contact-interactive-card__lbl">GitHub Portfolio</span>
                <a
                  href="https://github.com/heangdeniss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-interactive-card__val"
                >
                  github.com/heangdeniss
                </a>
              </div>
              <button
                onClick={() => copyToClipboard('https://github.com/heangdeniss', 'github')}
                className="contact-copy-btn"
                title="Copy GitHub URL"
                aria-label="Copy GitHub URL"
              >
                {copiedKey === 'github' ? (
                  <span className="copied-tag">✓ Copied</span>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Quick Message Composer */}
          <div className="contact-composer-column">
            <h3 className="contact-column-title">Direct Message</h3>
            
            <form onSubmit={handleSendEmail} className="contact-form">
              <div className="contact-form__group">
                <label className="contact-form__label">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="contact-form__input"
                  required
                />
              </div>

              <div className="contact-form__group">
                <label className="contact-form__label">Your Email or Handle</label>
                <input
                  type="text"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="contact-form__input"
                  required
                />
              </div>

              <div className="contact-form__group">
                <label className="contact-form__label">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="contact-form__textarea"
                  rows={4}
                  required
                />
              </div>

              <div className="contact-form__actions">
                <button type="submit" className="btn btn-primary contact-form__btn">
                  <span>Send via Email</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleSendTelegram}
                  className="btn btn-outline contact-form__btn"
                >
                  <span>Chat on Telegram</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.08.51l-3-2.21-1.45 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.85.92z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
      {/* Floating Subtle Toast Notification */}
      {copiedKey && (
        <div className="contact-toast" role="status" aria-live="polite">
          <span className="contact-toast__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="contact-toast__text">Copied to clipboard!</span>
        </div>
      )}
    </section>
  );
}
