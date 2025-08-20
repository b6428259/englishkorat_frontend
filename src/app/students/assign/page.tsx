"use client"

import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StudentAssignPage() {
  const { language } = useLanguage();
  
  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: language === 'th' ? 'จัดการนักเรียน' : 'Student Management', href: '/students' },
        { label: language === 'th' ? 'มอบหมาย' : 'Assign' }
      ]}
    >
      <div>
        <h1>Student Assignment</h1>
        <p>Please fill in the details below:</p>
        {/* Include the student assignment form component here */}
      </div>
    </SidebarLayout>
  );
}
