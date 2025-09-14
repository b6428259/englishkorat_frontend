import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";
import { Group, CreateGroupRequest } from "@/types/group.types";

interface GroupCardProps {
  group: Group;
  onViewDetails: (group: Group) => void;
  onAddMember: (group: Group) => void;
  onUpdateGroup: (groupId: string, updates: Partial<CreateGroupRequest>) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onViewDetails,
  onAddMember
  // onUpdateGroup - not used in this component but kept for interface compatibility
}) => {
  const { language } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'empty': return 'bg-gray-100 text-gray-800';
      case 'need-feeling': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getStatusText = (status: string) => {
    if (language === 'th') {
      switch (status) {
        case 'active': return 'ใช้งาน';
        case 'full': return 'เต็ม';
        case 'empty': return 'ว่าง';
        case 'need-feeling': return 'ต้องการนักเรียน';
        case 'inactive': return 'ไม่ใช้งาน';
        case 'suspended': return 'ระงับ';
        default: return status;
      }
    } else {
      switch (status) {
        case 'active': return 'Active';
        case 'full': return 'Full';
        case 'empty': return 'Empty';
        case 'need-feeling': return 'Need Students';
        case 'inactive': return 'Inactive';
        case 'suspended': return 'Suspended';
        default: return status;
      }
    }
  };

  const getPaymentStatusText = (status: string) => {
    if (language === 'th') {
      switch (status) {
        case 'fully_paid': return 'ชำระครบ';
        case 'deposit_paid': return 'ชำระมัดจำ';
        case 'pending': return 'รอชำระ';
        default: return status;
      }
    } else {
      switch (status) {
        case 'fully_paid': return 'Fully Paid';
        case 'deposit_paid': return 'Deposit Paid';
        case 'pending': return 'Pending';
        default: return status;
      }
    }
  };

  const currentStudents = group.members?.length || 0;
  const availableSpots = group.max_students - currentStudents;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h3 className="text-lg font-bold truncate">{group.group_name}</h3>
        <p className="text-sm opacity-90">
          {group.course?.name || 'Unknown Course'} - {group.level}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
            {getStatusText(group.status)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(group.payment_status)}`}>
            {getPaymentStatusText(group.payment_status)}
          </span>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">
              {language === 'th' ? 'นักเรียน:' : 'Students:'}
            </span>
            <div className="text-lg font-bold text-indigo-600">
              {currentStudents}/{group.max_students}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-600">
              {language === 'th' ? 'ที่ว่าง:' : 'Available:'}
            </span>
            <div className={`text-lg font-bold ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {availableSpots}
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{language === 'th' ? 'ความเต็ม' : 'Capacity'}</span>
            <span>{Math.round((currentStudents / group.max_students) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStudents >= group.max_students
                  ? 'bg-red-500'
                  : currentStudents / group.max_students > 0.8
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((currentStudents / group.max_students) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewDetails(group)}
            variant="monthView"
            className="flex-1 text-xs py-2"
          >
            {language === 'th' ? 'ดูรายละเอียด' : 'View Details'}
          </Button>
          {availableSpots > 0 && (
            <Button
              onClick={() => onAddMember(group)}
              variant="monthViewClicked"
              className="flex-1 text-xs py-2"
            >
              {language === 'th' ? 'เพิ่มสมาชิก' : 'Add Member'}
            </Button>
          )}
        </div>
      </div>

      {/* Footer with dates */}
      <div className="bg-gray-50 px-4 py-2 border-t">
        <div className="text-xs text-gray-500">
          {language === 'th' ? 'สร้างเมื่อ:' : 'Created:'} {new Date(group.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
        </div>
      </div>
    </div>
  );
};