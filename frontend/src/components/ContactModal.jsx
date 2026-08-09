// components/ContactModal.jsx
// Centered modal pop-up that appears when clicking the pixel avatar.
// Displays profile info, social link cards (GitHub, LinkedIn, itch.io, Discord), and a Résumé download button.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  // ESC key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Contact Arpita"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(15, 5, 20, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // prevent click from closing when clicking inside card
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              background: 'var(--color-bg)',
              border: '2px solid var(--color-border)',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), var(--glow-border)',
              padding: '28px 24px',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-accent)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-surface)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              ✕
            </button>

            {/* Profile Avatar & Name Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img
                src="/avatar.png"
                alt="Arpita Verma"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  imageRendering: 'pixelated',
                  boxShadow: '0 0 10px var(--glow-rose)',
                }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4em', color: 'var(--color-text-user)', lineHeight: 1.2 }}>
                  Arpita Verma
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.9em', color: 'var(--color-text-secondary)', opacity: 0.9 }}>
                  AI/ML · Game Dev · Open Source · Linux
                </p>
              </div>
            </div>

            {/* Title & Tagline */}
            <div style={{ marginBottom: '22px' }}>
              <h2
                style={{
                  margin: '0 0 6px',
                  fontSize: '1.75em',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  letterSpacing: '0.02em',
                }}
              >
                Let's Connect
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.98em',
                  color: 'var(--color-text-dim)',
                  lineHeight: 1.45,
                }}
              >
                Got an idea? A bug to squash? Or just wanna talk tech? I'm in.
              </p>
            </div>

            {/* 4 Social Cards (GitHub, LinkedIn, itch.io, Discord) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {/* GitHub Card */}
              <a
                href="https://github.com/sleepyme06"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#e65c5c',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '88px',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                  boxShadow: '0 4px 12px rgba(230, 92, 92, 0.3)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: '1.05em' }}>Github</span>
              </a>

              {/* LinkedIn Card */}
              <a
                href="https://www.linkedin.com/in/arpita-verma-2574a5371/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '88px',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: '1.05em' }}>LinkedIn</span>
              </a>

              {/* itch.io Card */}
              <a
                href="https://itch.io/profile/sleepyme06"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#fa5c5c',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '88px',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                  boxShadow: '0 4px 12px rgba(250, 92, 92, 0.3)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 2C2.567 2 1 3.567 1 5.5v13C1 20.433 2.567 22 4.5 22h15c1.933 0 3.5-1.567 3.5-3.5v-13C23 3.567 21.433 2 19.5 2h-15zm3.75 4.5h7.5a1.25 1.25 0 0 1 1.25 1.25v7.5a1.25 1.25 0 0 1-1.25 1.25h-7.5A1.25 1.25 0 0 1 7 15.25v-7.5A1.25 1.25 0 0 1 8.25 6.5z" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: '1.05em' }}>itch.io</span>
              </a>

              {/* Discord Card */}
              <div
                onClick={() => {
                  navigator.clipboard.writeText('sleepyme06');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Click to copy Discord username"
                style={{
                  background: '#5865F2',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '88px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, filter 0.15s ease',
                  boxShadow: '0 4px 12px rgba(88, 101, 242, 0.3)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05em' }}>Discord</span>
                  <span style={{ fontSize: '11px', opacity: 0.85 }}>
                    {copied ? 'Copied! ✨' : 'sleepyme06'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resume Download Action Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href="/resume/arpita-verma-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="arpita-verma-resume.pdf"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-user)',
                  fontWeight: 700,
                  fontSize: '1.05em',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--glow-border)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface-2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-surface)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>📄</span> Download Résumé (PDF)
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
