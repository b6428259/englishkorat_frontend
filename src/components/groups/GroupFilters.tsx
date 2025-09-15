'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/common/Button';
import EnhancedSelect, { SelectOption } from '@/components/common/forms/EnhancedSelect';
import { GetGroupsParams } from '@/types/group.types';
import { groupService } from '@/services/api/groups';

interface GroupFiltersProps {
  filters: GetGroupsParams;
  onFilterChange: (filters: Partial<GetGroupsParams>) => void;
}

export const GroupFilters: React.FC<GroupFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { language } = useLanguage();
  const [courses, setCourses] = useState<Array<{ id: number; name: string; level: string }>>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load courses for filter options
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await groupService.getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    loadCourses();
  }, []);

  const statusOptions: SelectOption[] = [
    { value: 'active', label: language === 'th' ? 'เปิดรับ' : 'Active' },
    { value: 'full', label: language === 'th' ? 'เต็ม' : 'Full' },
    { value: 'empty', label: language === 'th' ? 'ว่าง' : 'Empty' },
    { value: 'need-feeling', label: language === 'th' ? 'ต้องเติม' : 'Need More' },
    { value: 'inactive', label: language === 'th' ? 'ปิด' : 'Inactive' },
    { value: 'suspended', label: language === 'th' ? 'พักการเรียน' : 'Suspended' },
  ];

  const paymentStatusOptions: SelectOption[] = [
    { value: 'pending', label: language === 'th' ? 'รอชำระ' : 'Pending' },
    { value: 'deposit_paid', label: language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid' },
    { value: 'fully_paid', label: language === 'th' ? 'ชำระครบ' : 'Fully Paid' },
  ];

  const perPageOptions: SelectOption[] = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
  ];

  const handleFilterChange = (key: keyof GetGroupsParams, value: unknown) => {
    onFilterChange({ [key]: value, page: 1 }); // Reset to page 1 when filters change
  };

  const handleClearFilters = () => {
    onFilterChange({
      course_id: undefined,
      branch_id: undefined,
      status: undefined,
      payment_status: undefined,
      page: 1,
      per_page: 20,
    });
  };

  const hasActiveFilters = !!(
    filters.course_id ||
    filters.branch_id ||
    filters.status ||
    filters.payment_status
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'th' ? 'ตัวกรอง' : 'Filters'}
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              {language === 'th' ? 'มีการกรอง' : 'Active'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="monthView"
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {language === 'th' ? 'ล้างทั้งหมด' : 'Clear All'}
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="monthView"
            className="px-3 py-1 text-sm"
          >
            {isExpanded 
              ? (language === 'th' ? 'ซ่อน' : 'Hide')
              : (language === 'th' ? 'แสดง' : 'Show')
            }
          </Button>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'คอร์ส' : 'Course'}
              </label>
              <EnhancedSelect
                value={(filters.course_id?.toString() ?? '')}
                onChange={(val) => {
                  const v = (val as string);
                  handleFilterChange('course_id', v ? parseInt(v, 10) : undefined);
                }}
                options={[
                  { value: '', label: language === 'th' ? 'ทุกคอร์ส' : 'All Courses' },
                  ...courses.map((c) => ({ value: c.id.toString(), label: `${c.name} (${c.level})` }))
                ]}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สถานะ' : 'Status'}
              </label>
              <EnhancedSelect
                value={filters.status || ''}
                onChange={(val) => handleFilterChange('status', (val as string) || undefined)}
                options={[{ value: '', label: language === 'th' ? 'ทุกสถานะ' : 'All Status' }, ...statusOptions]}
                className="w-full"
              />
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สถานะการชำระเงิน' : 'Payment Status'}
              </label>
              <EnhancedSelect
                value={filters.payment_status || ''}
                onChange={(val) => handleFilterChange('payment_status', (val as string) || undefined)}
                options={[{ value: '', label: language === 'th' ? 'ทุกสถานะ' : 'All Payment Status' }, ...paymentStatusOptions]}
                className="w-full"
              />
            </div>

            {/* Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'แสดงต่อหน้า' : 'Per Page'}
              </label>
              <EnhancedSelect
                value={(filters.per_page ?? 20).toString()}
                onChange={(val) => handleFilterChange('per_page', parseInt(val as string, 10))}
                options={perPageOptions}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">
                {language === 'th' ? 'ตัวกรองด่วน:' : 'Quick Filters:'}
              </span>
              
              <Button
                onClick={() => handleFilterChange('status', 'active')}
                variant={filters.status === 'active' ? 'monthViewClicked' : 'monthView'}
                className="px-3 py-1 text-xs"
              >
                {language === 'th' ? 'เปิดรับ' : 'Active'}
              </Button>
              
              <Button
                onClick={() => handleFilterChange('status', 'full')}
                variant={filters.status === 'full' ? 'monthViewClicked' : 'monthView'}
                className="px-3 py-1 text-xs"
              >
                {language === 'th' ? 'เต็ม' : 'Full'}
              </Button>
              
              <Button
                onClick={() => handleFilterChange('payment_status', 'pending')}
                variant={filters.payment_status === 'pending' ? 'monthViewClicked' : 'monthView'}
                className="px-3 py-1 text-xs"
              >
                {language === 'th' ? 'รอชำระ' : 'Pending Payment'}
              </Button>
              
              <Button
                onClick={() => handleFilterChange('payment_status', 'fully_paid')}
                variant={filters.payment_status === 'fully_paid' ? 'monthViewClicked' : 'monthView'}
                className="px-3 py-1 text-xs"
              >
                {language === 'th' ? 'ชำระครบ' : 'Fully Paid'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
