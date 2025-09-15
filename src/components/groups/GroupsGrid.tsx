'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/common/Button';
import { Group } from '@/types/group.types';

interface GroupsGridProps {
  groups: Group[];
  onViewDetails: (group: Group) => void;
  onAssignStudent: (group: Group) => void;
}

export const GroupsGrid: React.FC<GroupsGridProps> = ({
  groups,
  onViewDetails,
  onAssignStudent,
}) => {
  const { language } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'full': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'empty': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'need-feeling': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'suspended': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'fully_paid': return 'bg-green-100 text-green-800';
      case 'deposit_paid': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayText = (status: string) => {
    const statusTexts = {
      'active': language === 'th' ? 'เปิดรับ' : 'Active',
      'full': language === 'th' ? 'เต็ม' : 'Full',
      'empty': language === 'th' ? 'ว่าง' : 'Empty',
      'need-feeling': language === 'th' ? 'ต้องเติม' : 'Need More',
      'inactive': language === 'th' ? 'ปิด' : 'Inactive',
      'suspended': language === 'th' ? 'พักการเรียน' : 'Suspended'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getPaymentStatusDisplayText = (status: string) => {
    const paymentTexts = {
      'fully_paid': language === 'th' ? 'ชำระครบ' : 'Fully Paid',
      'deposit_paid': language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid',
      'pending': language === 'th' ? 'รอชำระ' : 'Pending'
    };
    return paymentTexts[status as keyof typeof paymentTexts] || status;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {groups.map((group) => {
        const memberCount = group.members?.length || 0;
        const availableSlots = group.max_students - memberCount;
        const isNearFull = availableSlots <= 2 && availableSlots > 0;
        const isFull = availableSlots <= 0;

        return (
          <div
            key={group.id}
            className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden ${
              isFull ? 'border-red-200' : isNearFull ? 'border-yellow-200' : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                  {group.group_name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(group.status)}`}>
                  {getStatusDisplayText(group.status)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">
                  {group.course?.name || 'Unknown Course'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                    {group.level}
                  </span>
                  {group.course?.branch && (
                    <span className="text-xs text-gray-500">
                      {language === 'th' ? group.course.branch.name_th : group.course.branch.name_en}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Student count */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {language === 'th' ? 'นักเรียน' : 'Students'}
                  </span>
                  <span className={`text-lg font-bold ${
                    isFull ? 'text-red-600' : isNearFull ? 'text-yellow-600' : 'text-indigo-600'
                  }`}>
                    {memberCount}/{group.max_students}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isFull ? 'bg-red-500' : isNearFull ? 'bg-yellow-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min((memberCount / group.max_students) * 100, 100)}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {availableSlots > 0 
                    ? (language === 'th' ? `เหลือที่ว่าง ${availableSlots} ที่` : `${availableSlots} slots available`)
                    : (language === 'th' ? 'เต็มแล้ว' : 'Full')
                  }
                </div>
              </div>

              {/* Payment status */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {language === 'th' ? 'การชำระเงิน' : 'Payment'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(group.payment_status)}`}>
                    {getPaymentStatusDisplayText(group.payment_status)}
                  </span>
                </div>
              </div>

              {/* Description */}
              {group.description && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {group.description}
                  </div>
                </div>
              )}

              {/* Course category */}
              {group.course?.category && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">
                      {language === 'th' ? 'หมวดหมู่:' : 'Category:'}
                    </span>{' '}
                    {language === 'th' ? group.course.category.name : group.course.category.name_en}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-2">
                <Button
                  onClick={() => onViewDetails(group)}
                  variant="monthView"
                  className="flex-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 border-indigo-200"
                >
                  {language === 'th' ? 'ดูรายละเอียด' : 'View Details'}
                </Button>
                
                <Button
                  onClick={() => onAssignStudent(group)}
                  disabled={isFull}
                  variant="secondary"
                  className={`flex-1 px-3 py-2 text-sm ${
                    isFull 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {language === 'th' ? 'เพิ่มนักเรียน' : 'Assign Student'}
                </Button>
              </div>
            </div>

            {/* Created date */}
            <div className="px-5 py-2 bg-gray-25 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                {language === 'th' ? 'สร้างเมื่อ:' : 'Created:'} {new Date(group.created_at).toLocaleDateString(
                  language === 'th' ? 'th-TH' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
