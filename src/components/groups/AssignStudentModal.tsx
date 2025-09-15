'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/common/Button';
import ModernInput from '@/components/common/forms/ModernInput';
import EnhancedSelect from '@/components/common/forms/EnhancedSelect';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Group, Student } from '@/types/group.types';
import { groupService } from '@/services/api/groups';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onAssignmentSuccess: () => void;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  onClose,
  group,
  onAssignmentSuccess,
}) => {
  const { language } = useLanguage();
  
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'deposit_paid' | 'fully_paid'>('pending');
  const [assigning, setAssigning] = useState(false);

  // Load available students
  useEffect(() => {
    const loadStudents = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        setError(null);
        const studentsData = await groupService.getAvailableStudents();
        setStudents(studentsData);
      } catch (err) {
        setError(language === 'th' ? 'ไม่สามารถโหลดรายชื่อนักเรียนได้' : 'Failed to load students');
        console.error('Error loading students:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [isOpen, language]);

  // Handle search
  useEffect(() => {
    const searchStudents = async () => {
      if (!searchQuery.trim()) return;
      
      try {
        setSearching(true);
        const studentsData = await groupService.getAvailableStudents(searchQuery);
        setStudents(studentsData);
      } catch (err) {
        console.error('Error searching students:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchStudents, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Filter students already in group
  const availableStudents = useMemo(() => {
    const groupMemberIds = new Set(group.members?.map(member => member.student_id) || []);
    return students.filter(student => !groupMemberIds.has(student.id));
  }, [students, group.members]);

  // Check if group is full
  const isFull = (group.members?.length || 0) >= group.max_students;

  // Handle student assignment
  const handleAssignStudent = async () => {
    if (!selectedStudent) return;

    try {
      setAssigning(true);
      setError(null);

      const result = await groupService.addMember(group.id.toString(), {
        student_id: selectedStudent.id,
        payment_status: paymentStatus,
      });

      if (result) {
        onAssignmentSuccess();
        handleClose();
      } else {
        setError(language === 'th' ? 'เกิดข้อผิดพลาดในการเพิ่มนักเรียน' : 'Failed to assign student');
      }
    } catch (err) {
      console.error('Error assigning student:', err);
      setError(language === 'th' ? 'เกิดข้อผิดพลาดในการเพิ่มนักเรียน' : 'Failed to assign student');
    } finally {
      setAssigning(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedStudent(null);
    setPaymentStatus('pending');
    setSearchQuery('');
    setError(null);
    onClose();
  };

  // Get student display name
  const getStudentDisplayName = (student: Student) => {
    if (language === 'th') {
      return `${student.first_name_th} ${student.last_name_th}${student.nickname_th ? ` (${student.nickname_th})` : ''}`;
    }
    return `${student.first_name_en} ${student.last_name_en}${student.nickname_en ? ` (${student.nickname_en})` : ''}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'th' ? 'เพิ่มนักเรียนเข้ากลุ่ม' : 'Assign Student to Group'}
              </h2>
              <p className="opacity-90 mt-1">
                {group.group_name} ({(group.members?.length || 0)}/{group.max_students})
              </p>
            </div>
            <Button
              onClick={handleClose}
              variant="monthView"
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Group Full Warning */}
          {isFull && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-red-600 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">
                    {language === 'th' ? 'กลุ่มเต็มแล้ว' : 'Group is Full'}
                  </h3>
                  <p className="text-red-600 text-sm">
                    {language === 'th' 
                      ? 'ไม่สามารถเพิ่มนักเรียนใหม่ได้ เนื่องจากกลุ่มมีสมาชิกครบแล้ว'
                      : 'Cannot assign new students as the group has reached maximum capacity.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <ModernInput
              label={language === 'th' ? 'ค้นหานักเรียน' : 'Search Students'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'th' ? 'ชื่อ, นามสกุล, หรืออีเมล...' : 'Name, surname, or email...'}
              disabled={isFull}
            />
            {searching && (
              <div className="mt-2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                {language === 'th' ? 'นักเรียนที่เลือก' : 'Selected Student'}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-900">
                    {getStudentDisplayName(selectedStudent)}
                  </div>
                  <div className="text-sm text-green-700">
                    {selectedStudent.email}
                    {selectedStudent.phone && ` | ${selectedStudent.phone}`}
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedStudent(null)}
                  variant="monthView"
                  className="text-green-600 hover:bg-green-100 text-sm px-3 py-1"
                >
                  {language === 'th' ? 'เปลี่ยน' : 'Change'}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Status Selection */}
          {selectedStudent && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สถานะการชำระเงิน' : 'Payment Status'}
              </label>
              <EnhancedSelect
                value={paymentStatus}
                onChange={(val) => setPaymentStatus(val as 'pending' | 'deposit_paid' | 'fully_paid')}
                options={[
                  { value: 'pending', label: language === 'th' ? 'รอชำระ' : 'Pending' },
                  { value: 'deposit_paid', label: language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid' },
                  { value: 'fully_paid', label: language === 'th' ? 'ชำระครบ' : 'Fully Paid' },
                ]}
                className="w-full"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Students List */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {language === 'th' ? 'เลือกนักเรียน' : 'Select Student'}
              {!isFull && (
                <span className="text-gray-500 ml-2">
                  ({availableStudents.length} {language === 'th' ? 'คน' : 'available'})
                </span>
              )}
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">
                  {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
                </span>
              </div>
            ) : availableStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>
                  {searchQuery
                    ? (language === 'th' ? 'ไม่พบนักเรียนที่ค้นหา' : 'No students found')
                    : (language === 'th' ? 'ไม่มีนักเรียนที่สามารถเพิ่มได้' : 'No students available')
                  }
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => !isFull && setSelectedStudent(student)}
                    className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? 'bg-green-50 border-green-200'
                        : isFull
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {getStudentDisplayName(student)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.email}
                          {student.phone && ` | ${student.phone}`}
                        </div>
                      </div>
                      {selectedStudent?.id === student.id && (
                        <div className="text-green-600 text-xl">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t rounded-b-xl">
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleClose}
              variant="monthView"
              className="px-6 py-2"
              disabled={assigning}
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </Button>
            
            <Button
              onClick={handleAssignStudent}
              variant="monthViewClicked"
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700"
              disabled={!selectedStudent || isFull || assigning}
            >
              {assigning ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {language === 'th' ? 'กำลังเพิ่ม...' : 'Assigning...'}
                </>
              ) : (
                language === 'th' ? 'เพิ่มนักเรียน' : 'Assign Student'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
