"use client";

import Script from 'next/script';

interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Structured Data
export const organizationData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "English Korat",
  "alternateName": "เรียนภาษาอังกฤษโคราช",
  "description": "สถาบันสอนภาษาอังกฤษที่ดีที่สุดในโคราช เปลี่ยนชีวิตหลังเรียนใน 3 เดือน เหมาะสำหรับคนอ่อนภาษา",
  "url": "https://englishkorat.com",
  "logo": "https://englishkorat.com/icons/logo.png",
  "image": "https://englishkorat.com/promotion-banner.jpg",
  "telephone": "+66637623059",
  "email": "thanida09@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "นครราชสีมา",
    "addressLocality": "โคราช",
    "addressRegion": "นครราชสีมา",
    "addressCountry": "TH"
  },
  "areaServed": {
    "@type": "City",
    "name": "นครราชสีมา"
  },
  "foundingDate": "2020",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "10-50"
  },
  "sameAs": [
    "https://www.facebook.com/learningenglishkorat"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "คอร์สภาษาอังกฤษ",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Course",
          "name": "คอร์สภาษาอังกฤษพื้นฐาน",
          "description": "เรียนภาษาอังกฤษสำหรับผู้เริ่มต้น",
          "provider": {
            "@type": "Organization",
            "name": "English Korat"
          }
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "500",
    "bestRating": "5"
  }
};

// Website Structured Data
export const websiteData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "English Korat",
  "alternateName": "เรียนภาษาอังกฤษโคราช",
  "url": "https://englishkorat.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://englishkorat.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// Service Structured Data
export const serviceData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "English Language Training",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "English Korat"
  },
  "name": "คอร์สเรียนภาษาอังกฤษ",
  "description": "สอนภาษาอังกฤษสำหรับคนไทย เน้นการพูดและการใช้งานจริง เรียนแล้วเห็นผลใน 3 เดือน",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "price": "0",
    "priceCurrency": "THB",
    "description": "ลงทะเบียนเรียนฟรี"
  },
  "areaServed": {
    "@type": "City",
    "name": "นครราชสีมา"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "คอร์สภาษาอังกฤษ",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Course",
          "name": "Basic English Course",
          "description": "คอร์สภาษาอังกฤษพื้นฐาน เหมาะสำหรับผู้เริ่มต้น",
          "courseMode": "blended",
          "educationalLevel": "Beginner",
          "timeRequired": "P3M"
        }
      }
    ]
  }
};

// FAQ Structured Data
export const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "English Korat สอนอย่างไร?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "เราใช้วิธีการสอนที่เน้นการพูดและการใช้งานจริง เหมาะสำหรับคนไทยที่อ่อนภาษาอังกฤษ สามารถเห็นผลใน 3 เดือน"
      }
    },
    {
      "@type": "Question",
      "name": "ใช้เวลาเรียนนานแค่ไหน?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "คอร์สหลักใช้เวลา 3 เดือน คุณจะเห็นความเปลี่ยนแปลงและสามารถพูดภาษาอังกฤษได้อย่างมั่นใจ"
      }
    },
    {
      "@type": "Question",
      "name": "เหมาะกับคนที่ไม่เก่งภาษาอังกฤษหรือไม่?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ใช่ เราเชี่ยวชาญในการสอนคนที่อ่อนภาษาอังกฤษโดยเฉพาะ มีวิธีการสอนที่เข้าใจปัญหาของคนไทย"
      }
    },
    {
      "@type": "Question",
      "name": "มีการรับประกันผลการเรียนหรือไม่?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "เรามีนักเรียนกว่า 24,000+ คนที่ประสบความสำเร็จ และมีผลลัพธ์ที่พิสูจน์แล้วว่าได้ผลจริง"
      }
    }
  ]
};
