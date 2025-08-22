import React, { useState } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import { validateImageUrl } from '@/utils/validateImageUrl';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackInitials?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  fallbackInitials 
}) => {
  const [loading, setLoading] = useState(!!src);
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative ${className}`}>
  {validateImageUrl(src) && !error ? (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
              <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} />
            </div>
          )}
          <div className="relative w-full h-full">
            <Image
              src={validateImageUrl(src) as string}
              alt={alt}
              fill
              unoptimized={true}
              className={`object-cover rounded-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
          {fallbackInitials ? (
            <span className={`font-medium text-gray-600 ${textSizeClasses[size]}`}>
              {fallbackInitials}
            </span>
          ) : (
            <svg className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : size === 'xl' ? 'w-12 h-12' : 'w-16 h-16'} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
