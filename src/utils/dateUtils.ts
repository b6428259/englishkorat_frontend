// Date formatting utilities
export const formatDate = (dateString: string | undefined, locale: 'th-TH' | 'en-US' = 'th-TH'): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(locale, options);
};

export const formatDateShort = (dateString: string | undefined, locale: 'th-TH' | 'en-US' = 'th-TH'): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return date.toLocaleDateString(locale, options);
};

export const formatTimeAgo = (dateString: string | undefined, locale: 'th' | 'en' = 'th'): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    th: [
      { label: 'ปี', seconds: 31536000 },
      { label: 'เดือน', seconds: 2592000 },
      { label: 'วัน', seconds: 86400 },
      { label: 'ชั่วโมง', seconds: 3600 },
      { label: 'นาที', seconds: 60 },
      { label: 'วินาที', seconds: 1 }
    ],
    en: [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ]
  };
  
  for (const interval of intervals[locale]) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      if (locale === 'th') {
        return `${count} ${interval.label}ที่แล้ว`;
      } else {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
  }
  
  return locale === 'th' ? 'เมื่อสักครู่' : 'just now';
};
