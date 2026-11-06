import React, { useState } from 'react';
import { Brand } from '../../types';

/**
 * Official brand logo files live in /public/brand-logos/, named by the brand's code in lower case
 * (yes.svg / yes.png / yes.webp, tec.svg …). The first one that exists is used. Until the artwork is
 * dropped in, a monogram + wordmark stands in — the brands' trademarked logos are not bundled.
 */
const EXTENSIONS = ['svg', 'png', 'webp', 'jpg'];

const ACCENT: Record<string, string> = {
  YES: 'bg-navy-600',
  TEC: 'bg-teal-600',
};

export const brandShortName = (b: Brand) => b.name.split(/[ (]/)[0];

export const BrandLogo: React.FC<{ brand: Brand; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  brand,
  size = 'sm',
  className = '',
}) => {
  const [attempt, setAttempt] = useState(0);
  const name = brandShortName(brand);
  const h = size === 'lg' ? 'h-12' : 'h-6';

  if (attempt < EXTENSIONS.length) {
    return (
      <img
        src={`/brand-logos/${brand.code.toLowerCase()}.${EXTENSIONS[attempt]}`}
        alt={name}
        className={`${h} w-auto max-w-[10rem] object-contain ${className}`}
        onError={() => setAttempt(a => a + 1)}
      />
    );
  }

  // fallback until the official logo file is added
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className={`${size === 'lg' ? 'w-12 h-12 text-xl rounded-xl' : 'w-6 h-6 text-[11px] rounded-lg'} ${
          ACCENT[brand.code] || 'bg-slate-600'
        } text-white font-extrabold flex items-center justify-center`}
      >
        {name.charAt(0)}
      </span>
      <span className={`${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm'} font-extrabold tracking-tight`}>{name}</span>
    </span>
  );
};
