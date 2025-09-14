import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Group, AddGroupMemberRequest } from "@/types/group.types";
import { groupService } from "@/services/api/groups";
import { userService } from "@/services/user.service";

interface Student {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  role?: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  group,
  onMemberAdded
}) => {
  const { language } = useLanguage();
  
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'deposit_paid' | 'fully_paid'>('pending');
  const [submitting, setSubmitting] = useState(false);

  // Load students on modal open
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users and filter for students
      const response = await userService.getUsers(1, 1000); // Get a large number to get all students
      
      if (response.success) {
        // Filter for students who are not already in this group
        const currentMemberIds = group.members?.map(m => m.student_id) || [];
        const availableStudents = response.data.users
          .filter((user: Student) => user.role === 'student' && !currentMemberIds.includes(user.id))
          .map((user: Student) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            nickname: user.nickname
          }));
        
        setStudents(availableStudents);
        setFilteredStudents(availableStudents);
      }
    } catch (err) {
      setError(language === 'th' ? 'ไม่สามารถโหลดรายชื่อนักเรียนได้' : 'Failed to load students');
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  }, [group.members, language]);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen, loadStudents]);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
          student.username.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          (student.first_name && student.first_name.toLowerCase().includes(searchLower)) ||
          (student.last_name && student.last_name.toLowerCase().includes(searchLower)) ||
          (student.nickname && student.nickname.toLowerCase().includes(searchLower))
        );
      });
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudentId === 0) {
      setError(language === 'th' ? 'กรุณาเลือกนักเรียน' : 'Please select a student');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const memberData: AddGroupMemberRequest = {
        student_id: selectedStudentId,
        payment_status: paymentStatus
      };
      
      await groupService.addMember(group.id.toString(), memberData);
      onMemberAdded();
      
      // Reset form
      setSelectedStudentId(0);
      setPaymentStatus('pending');
      setSearchTerm('');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(language === 'th' ? 'เกิดข้อผิดพลาดในการเพิ่มสมาชิก' : errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentDisplayName = (student: Student) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    }
    return student.username;
  };

  const getStudentSubtext = (student: Student) => {
    const parts = [];
    if (student.nickname) parts.push(`(${student.nickname})`);
    parts.push(student.email);
    return parts.join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">
            {language === 'th' ? 'เพิ่มสมาชิกใหม่' : 'Add New Member'}
          </h2>
          <p className="opacity-90 mt-1">
            {group.group_name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Search Students */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'th' ? 'ค้นหานักเรียน' : 'Search Students'}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={language === 'th' ? 'ค้นหาชื่อ, อีเมล, หรือชื่อเล่น...' : 'Search by name, email, or nickname...'}
            />
          </div>

          {/* Student Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'th' ? 'เลือกนักเรียน' : 'Select Student'} *
            </label>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {students.length === 0 
                  ? (language === 'th' ? 'ไม่มีนักเรียนที่สามารถเพิ่มได้' : 'No students available to add')
                  : (language === 'th' ? 'ไม่พบนักเรียนที่ค้นหา' : 'No students found')
                }
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md">
                {filteredStudents.map((student) => (
                  <label
                    key={student.id}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                      selectedStudentId === student.id ? 'bg-indigo-50 border-indigo-200' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="student"
                      value={student.id}
                      checked={selectedStudentId === student.id}
                      onChange={() => setSelectedStudentId(student.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {getStudentDisplayName(student)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getStudentSubtext(student)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'th' ? 'สถานะการชำระเงิน' : 'Payment Status'}
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'pending' | 'deposit_paid' | 'fully_paid')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">{language === 'th' ? 'รอชำระ' : 'Pending'}</option>
              <option value="deposit_paid">{language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid'}</option>
              <option value="fully_paid">{language === 'th' ? 'ชำระครับ' : 'Fully Paid'}</option>
            </select>
          </div>

          {/* Group Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">
              {language === 'th' ? 'ข้อมูลกลุ่ม' : 'Group Information'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{language === 'th' ? 'สมาชิกปัจจุบัน:' : 'Current members:'}</span>
                <span className="font-medium ml-1">{group.members?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">{language === 'th' ? 'จำนวนสูงสุด:' : 'Maximum:'}</span>
                <span className="font-medium ml-1">{group.max_students}</span>
              </div>
              <div>
                <span className="text-gray-600">{language === 'th' ? 'ที่ว่าง:' : 'Available:'}</span>
                <span className={`font-medium ml-1 ${
                  (group.max_students - (group.members?.length || 0)) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {group.max_students - (group.members?.length || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{language === 'th' ? 'สถานะ:' : 'Status:'}</span>
                <span className="font-medium ml-1">{group.status}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="monthView"
              className="px-6 py-2"
              disabled={submitting}
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="monthViewClicked"
              className="px-6 py-2"
              disabled={submitting || selectedStudentId === 0 || (group.max_students - (group.members?.length || 0)) <= 0}
            >
              {submitting ? <LoadingSpinner /> : (language === 'th' ? 'เพิ่มสมาชิก' : 'Add Member')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};