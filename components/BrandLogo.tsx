import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
}

export function BrandLogo({ size = 'md', href = '/', className = '' }: BrandLogoProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const textSize = size === 'sm' ? 'text-[15px]' : size === 'lg' ? 'text-[22px]' : 'text-[17px]';

  const content = (
    <span className={`brand-inline ${className}`}>
      <svg
        className="brand-symbol"
        style={{ width: iconSize, height: iconSize }}
        viewBox="0 0 132 132"
        fill="none"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 50 L22 110 L82 110" stroke="var(--text)" />
        <path d="M50 22 L110 22 L110 82" stroke="var(--accent)" />
        <path d="M110 22 L82 50" stroke="var(--accent)" />
      </svg>
      <span className={`brand-title ${textSize}`}>
        Dish<span className="brand-accent">AR</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="brand-link" aria-label="DishAR — Início">
        {content}
      </Link>
    );
  }

  return content;
}
