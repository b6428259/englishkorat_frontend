export const formatDate = (date: string | Date): string => { 
  return new Date(date).toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
  }); 
}; 
 
export const truncateText = (text: string, maxLength: number): string => { 
  if (text.length <= maxLength) return text; 
  return text.substring(0, maxLength) + '...'; 
}; 
