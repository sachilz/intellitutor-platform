import React from 'react';

const LogoIcon = ({ size = 32, style = {}, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    className={className}
    style={{ display: 'block', borderRadius: 'inherit', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="50%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#090d16" />
      </linearGradient>

      <linearGradient id="logo-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>

      <linearGradient id="logo-accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>

      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect x="16" y="16" width="480" height="480" rx="110" ry="110" fill="url(#logo-bg-grad)" stroke="url(#logo-primary-grad)" strokeWidth="12" />

    <g filter="url(#logo-glow)">
      <polygon points="256,105 415,188 256,270 97,188" fill="url(#logo-primary-grad)" />
      <polygon points="256,130 385,188 256,245 127,188" fill="#0f172a" opacity="0.35" />
      <path d="M155,225 V285 C155,335 205,360 256,360 C307,360 357,335 357,285 V225 L256,272 Z" fill="url(#logo-primary-grad)" opacity="0.95" />
      <path d="M256,152 C256,174 268,188 290,188 C268,188 256,202 256,224 C256,202 244,188 222,188 C244,188 256,174 256,152 Z" fill="#ffffff" opacity="0.95" />
      <path d="M112,195 V285 C112,300 102,310 92,310 C86,310 82,305 82,295 C82,285 96,280 104,280" fill="none" stroke="url(#logo-accent-grad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="92" cy="315" r="16" fill="url(#logo-accent-grad)" />
      <path d="M140,370 C140,385 148,395 163,395 C148,395 140,405 140,420 C140,405 132,395 117,395 C132,395 140,385 140,370 Z" fill="url(#logo-accent-grad)" />
      <path d="M370,330 C370,355 385,370 410,370 C385,370 370,385 370,410 C370,385 355,370 330,370 C355,370 370,355 370,330 Z" fill="url(#logo-accent-grad)" />
      <circle cx="370" cy="370" r="6" fill="#ffffff" />
    </g>
  </svg>
);

export default LogoIcon;
