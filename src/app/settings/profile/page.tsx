"use client";

import SidebarLayout from '../../../components/common/SidebarLayout';
import { ProfileSettings } from '../../../components/common/ProfileSettings';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function ProfilePage() {
  const { language } = useLanguage();

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: language === 'th' ? 'การตั้งค่า' : 'Settings', href: '/settings' },
        { label: language === 'th' ? 'โปรไฟล์' : 'Profile' }
      ]}
    >
      <ProfileSettings />
    </SidebarLayout>
  );
}
