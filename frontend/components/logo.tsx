'use client';

import React from 'react';
import {
  GroundUpPrimaryLogo,
  GroundUpMark,
  GroundUpSecondaryLogo,
  GroundUpSubLogo,
  BrandProps,
} from './brand/GroundUpBrand';

export interface LogoProps extends BrandProps {
  variant?: 'full' | 'mark' | 'secondary' | 'sub';
}

export function Logo({
  onClick,
  className = '',
  size = 'md',
  theme = 'auto',
  showSubtitle = false,
  variant = 'full',
  monochrome = false,
}: LogoProps) {
  if (variant === 'mark') {
    return (
      <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`inline-flex shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <GroundUpMark size={size} theme={theme} monochrome={monochrome} />
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <GroundUpSecondaryLogo
        onClick={onClick}
        className={className}
        size={size}
        theme={theme}
        monochrome={monochrome}
      />
    );
  }

  if (variant === 'sub') {
    return (
      <GroundUpSubLogo
        className={className}
        theme={theme}
        size={typeof size === 'number' ? size : 40}
      />
    );
  }

  return (
    <GroundUpPrimaryLogo
      onClick={onClick}
      className={className}
      size={size}
      theme={theme}
      showSubtitle={showSubtitle}
      monochrome={monochrome}
    />
  );
}

// Direct re-exports of all brand variants
export {
  GroundUpMark,
  GroundUpPrimaryLogo,
  GroundUpSecondaryLogo,
  GroundUpSubLogo,
};

export default Logo;
