'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConditionalAuth } from '@/components/common/ConditionalAuth';
import Breadcrumb from '@/components/common/Breadcrumb';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { GroupDetailsModal } from '@/components/groups/GroupDetailsModal';
import { AssignStudentModal } from '@/components/groups/AssignStudentModal';
import { Group } from '@/types/group.types';
import { groupService } from '@/services/api/groups';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const groupId = params.id as string;
  
  // State
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Breadcrumb data
  const breadcrumbItems = [
    {
      label: language === 'th' ? 'หน้าหลัก' : 'Dashboard',
      href: '/dashboard'
    },
    {
      label: language === 'th' ? 'นักเรียน' : 'Students',
      href: '/students'
    },
    {
      label: language === 'th' ? 'กลุ่มเรียน' : 'Study Groups',
      href: '/students/groups'
    },
    {
      label: group?.group_name || (language === 'th' ? 'รายละเอียดกลุ่ม' : 'Group Details'),
      href: `/students/groups/${groupId}`
    }
  ];

  // Load group data
  useEffect(() => {
    const loadGroup = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        setError(null);
        const groupData = await groupService.getGroup(groupId);
        
        if (groupData) {
          setGroup(groupData);
        } else {
          setError(language === 'th' ? 'ไม่พบกลุ่มเรียนที่ระบุ' : 'Group not found');
        }
      } catch (err) {
        console.error('Error loading group:', err);
        setError(language === 'th' ? 'ไม่สามารถโหลดข้อมูลกลุ่มเรียนได้' : 'Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    loadGroup();
  }, [groupId, language]);

  // Handle group update
  const handleGroupUpdated = async () => {
    if (!groupId) return;
    
    try {
      const updatedGroup = await groupService.getGroup(groupId);
      if (updatedGroup) {
        setGroup(updatedGroup);
      }
    } catch (err) {
      console.error('Error refreshing group:', err);
    }
  };

  if (loading) {
    return (
      <ConditionalAuth requiredRoles={['teacher', 'admin', 'owner'] as const}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">
              {language === 'th' ? 'กำลังโหลดข้อมูลกลุ่ม...' : 'Loading group data...'}
            </p>
          </div>
        </div>
      </ConditionalAuth>
    );
  }

  if (error) {
    return (
      <ConditionalAuth requiredRoles={['teacher', 'admin', 'owner'] as const}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6">
              <ErrorMessage message={error} />
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="monthView"
                  className="px-6 py-2"
                >
                  {language === 'th' ? 'ย้อนกลับ' : 'Go Back'}
                </Button>
                <Button
                  onClick={() => router.push('/students/groups')}
                  variant="monthViewClicked"
                  className="px-6 py-2"
                >
                  {language === 'th' ? 'ดูกลุ่มทั้งหมด' : 'View All Groups'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ConditionalAuth>
    );
  }

  if (!group) {
    return (
      <ConditionalAuth requiredRoles={['teacher', 'admin', 'owner'] as const}>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {language === 'th' ? 'ไม่พบกลุ่มเรียน' : 'Group Not Found'}
              </h1>
              <p className="text-gray-600 mb-6">
                {language === 'th' 
                  ? 'ไม่พบกลุ่มเรียนที่คุณกำลังมองหา' 
                  : 'The group you are looking for could not be found.'
                }
              </p>
              <Button
                onClick={() => router.push('/students/groups')}
                variant="monthViewClicked"
                className="px-6 py-2"
              >
                {language === 'th' ? 'ดูกลุ่มทั้งหมด' : 'View All Groups'}
              </Button>
            </div>
          </div>
        </div>
      </ConditionalAuth>
    );
  }

  return (
    <ConditionalAuth requiredRoles={['teacher', 'admin', 'owner'] as const}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Quick Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowDetailsModal(true)}
              variant="monthViewClicked"
              className="px-6 py-2"
            >
              {language === 'th' ? 'ดูรายละเอียดเต็ม' : 'View Full Details'}
            </Button>
            
            <Button
              onClick={() => setShowAssignModal(true)}
              variant="monthView"
              className="px-6 py-2"
              disabled={(group.members?.length || 0) >= group.max_students}
            >
              {language === 'th' ? 'เพิ่มนักเรียน' : 'Assign Student'}
            </Button>
            
            <Button
              onClick={() => router.push('/students/groups')}
              variant="monthView"
              className="px-6 py-2"
            >
              {language === 'th' ? 'กลับไปรายการ' : 'Back to List'}
            </Button>
          </div>

          {/* Group Summary Card */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {group.group_name}
                </h1>
                <p className="text-gray-600 mb-4">
                  {group.course?.name} - {group.level}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {language === 'th' ? 'นักเรียน:' : 'Students:'} {group.members?.length || 0}/{group.max_students}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {language === 'th' ? 'สถานะ:' : 'Status:'} {group.status}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {language === 'th' ? 'การชำระเงิน:' : 'Payment:'} {group.payment_status}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 lg:ml-6 text-right">
                <div className="text-sm text-gray-600 mb-1">
                  {language === 'th' ? 'สร้างเมื่อ:' : 'Created:'}
                </div>
                <div className="font-medium">
                  {new Date(group.created_at).toLocaleDateString(
                    language === 'th' ? 'th-TH' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {language === 'th' ? 'คำอธิบาย' : 'Description'}
              </h2>
              <p className="text-gray-600">{group.description}</p>
            </div>
          )}

          {/* Course Info */}
          {group.course && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'th' ? 'ข้อมูลคอร์ส' : 'Course Information'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'th' ? 'ชื่อคอร์ส:' : 'Course Name:'}
                  </label>
                  <p className="text-gray-900">{group.course.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'th' ? 'รหัสคอร์ส:' : 'Course Code:'}
                  </label>
                  <p className="text-gray-900">{group.course.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'th' ? 'ประเภท:' : 'Type:'}
                  </label>
                  <p className="text-gray-900">{group.course.course_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {language === 'th' ? 'สาขา:' : 'Branch:'}
                  </label>
                  <p className="text-gray-900">
                    {language === 'th' ? group.course.branch?.name_th : group.course.branch?.name_en}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailsModal && (
          <GroupDetailsModal
            group={group}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onGroupUpdated={handleGroupUpdated}
          />
        )}

        {showAssignModal && (
          <AssignStudentModal
            group={group}
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            onAssignmentSuccess={() => {
              setShowAssignModal(false);
              handleGroupUpdated();
            }}
          />
        )}
      </div>
    </ConditionalAuth>
  );
}