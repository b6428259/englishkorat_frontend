import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Group, GroupMember, CreateGroupRequest } from "@/types/group.types";
import { groupService } from "@/services/api/groups";

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onUpdateGroup: (groupId: string, updates: Partial<CreateGroupRequest>) => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  isOpen,
  onClose,
  group,
  onUpdateGroup
}) => {
  const { language } = useLanguage();
  
  // State
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    group_name: group.group_name,
    max_students: group.max_students,
    description: group.description || ''
  });

  // Load group members
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const membersList = await groupService.getGroupMembers(group.id.toString());
      setMembers(membersList);
    } catch (err) {
      setError(language === 'th' ? 'ไม่สามารถโหลดรายชื่อสมาชิกได้' : 'Failed to load members');
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  }, [group.id, language]);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, loadMembers]);

  const handleSaveEdit = async () => {
    try {
      await onUpdateGroup(group.id.toString(), editData);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating group:', err);
    }
  };

  const handleRemoveMember = async (studentId: number) => {
    if (!confirm(language === 'th' ? 'คุณแน่ใจหรือไม่ที่จะลบสมาชิกนี้?' : 'Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await groupService.removeMember(group.id.toString(), studentId.toString());
      await loadMembers(); // Refresh the list
    } catch (err) {
      console.error('Error removing member:', err);
      alert(language === 'th' ? 'เกิดข้อผิดพลาดในการลบสมาชิก' : 'Error removing member');
    }
  };

  const handleUpdatePaymentStatus = async (studentId: number, paymentStatus: 'pending' | 'deposit_paid' | 'fully_paid') => {
    try {
      await groupService.updatePaymentStatus(group.id.toString(), {
        payment_status: paymentStatus,
        student_id: studentId
      });
      await loadMembers(); // Refresh the list
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert(language === 'th' ? 'เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน' : 'Error updating payment status');
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              {editMode ? (
                <input
                  type="text"
                  value={editData.group_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, group_name: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-b border-white/50 focus:outline-none focus:border-white"
                />
              ) : (
                <h2 className="text-2xl font-bold">{group.group_name}</h2>
              )}
              <p className="opacity-90">{group.course?.name} - {group.level}</p>
            </div>
            <Button
              onClick={onClose}
              variant="monthView"
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Group Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                {language === 'th' ? 'สถานะ' : 'Status'}
              </h3>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(group.status)}`}>
                {group.status}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                {language === 'th' ? 'การชำระเงิน' : 'Payment'}
              </h3>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPaymentStatusColor(group.payment_status)}`}>
                {group.payment_status}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                {language === 'th' ? 'นักเรียน' : 'Students'}
              </h3>
              <div className="text-lg font-bold text-indigo-600 mt-1">
                {members.length}
                {editMode ? (
                  <span>
                    /
                    <input
                      type="number"
                      value={editData.max_students}
                      onChange={(e) => setEditData(prev => ({ ...prev, max_students: parseInt(e.target.value) }))}
                      className="w-12 ml-1 text-center border rounded"
                      min="1"
                    />
                  </span>
                ) : (
                  <span>/{group.max_students}</span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                {language === 'th' ? 'ที่ว่าง' : 'Available'}
              </h3>
              <div className={`text-lg font-bold mt-1 ${
                (group.max_students - members.length) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {group.max_students - members.length}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {language === 'th' ? 'คำอธิบาย' : 'Description'}
            </h3>
            {editMode ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={language === 'th' ? 'คำอธิบายเกี่ยวกับกลุ่ม...' : 'Description about the group...'}
              />
            ) : (
              <p className="p-3 bg-gray-50 rounded-lg">
                {group.description || (language === 'th' ? 'ไม่มีคำอธิบาย' : 'No description')}
              </p>
            )}
          </div>

          {/* Edit Controls */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              {language === 'th' ? 'รายชื่อสมาชิก' : 'Members List'}
            </h3>
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="monthView"
                    className="px-4 py-2 text-sm"
                  >
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    variant="monthViewClicked"
                    className="px-4 py-2 text-sm"
                  >
                    {language === 'th' ? 'บันทึก' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditMode(true)}
                  variant="monthViewClicked"
                  className="px-4 py-2 text-sm"
                >
                  {language === 'th' ? 'แก้ไข' : 'Edit'}
                </Button>
              )}
            </div>
          </div>

          {/* Members List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'th' ? 'ยังไม่มีสมาชิกในกลุ่ม' : 'No members in this group yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {member.student?.first_name} {member.student?.last_name}
                      {member.student?.nickname && (
                        <span className="text-gray-500 ml-2">({member.student.nickname})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.student?.email} | {member.student?.phone}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'th' ? 'เข้าร่วมเมื่อ:' : 'Joined:'} {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Payment Status */}
                    <select
                      value={member.payment_status}
                      onChange={(e) => handleUpdatePaymentStatus(member.student_id, e.target.value as 'pending' | 'deposit_paid' | 'fully_paid')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="pending">{language === 'th' ? 'รอชำระ' : 'Pending'}</option>
                      <option value="deposit_paid">{language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid'}</option>
                      <option value="fully_paid">{language === 'th' ? 'ชำระครบ' : 'Fully Paid'}</option>
                    </select>
                    
                    {/* Remove Button */}
                    <Button
                      onClick={() => handleRemoveMember(member.student_id)}
                      variant="monthView"
                      className="px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      {language === 'th' ? 'ลบ' : 'Remove'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t rounded-b-xl">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              {language === 'th' ? 'สร้างเมื่อ:' : 'Created:'} {new Date(group.created_at).toLocaleDateString()}
            </div>
            <div>
              {language === 'th' ? 'แก้ไขล่าสุด:' : 'Last updated:'} {new Date(group.updated_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};