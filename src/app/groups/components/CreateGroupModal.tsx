import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { CreateGroupRequest } from "@/types/group.types";
import { Course } from "@/services/api/schedules";
import { scheduleService } from "@/services/api/schedules";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (groupData: CreateGroupRequest) => void;
  isLoading: boolean;
  error: string | null;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error
}) => {
  const { language } = useLanguage();
  
  // Form state
  const [formData, setFormData] = useState<CreateGroupRequest>({
    group_name: '',
    course_id: 0,
    level: 'beginner',
    max_students: 8,
    payment_status: 'pending',
    description: ''
  });

  // Options data
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Load courses on modal open
  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await scheduleService.getCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.group_name.trim()) {
      return;
    }
    if (formData.course_id === 0) {
      return;
    }
    if (formData.max_students < 1) {
      return;
    }

    onConfirm(formData);
  };

  const handleInputChange = (field: keyof CreateGroupRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">
            {language === 'th' ? 'สร้างกลุ่มเรียนใหม่' : 'Create New Group'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Group Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'ชื่อกลุ่ม' : 'Group Name'} *
              </label>
              <input
                type="text"
                value={formData.group_name}
                onChange={(e) => handleInputChange('group_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={language === 'th' ? 'เช่น English A1 Morning' : 'e.g. English A1 Morning'}
                required
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'คอร์สเรียน' : 'Course'} *
              </label>
              {coursesLoading ? (
                <div className="flex items-center justify-center py-2">
                  <LoadingSpinner />
                </div>
              ) : (
                <select
                  value={formData.course_id}
                  onChange={(e) => handleInputChange('course_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value={0}>
                    {language === 'th' ? 'เลือกคอร์ส' : 'Select Course'}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name} ({course.level})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'ระดับ' : 'Level'} *
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="beginner">{language === 'th' ? 'เริ่มต้น' : 'Beginner'}</option>
                <option value="elementary">{language === 'th' ? 'พื้นฐาน' : 'Elementary'}</option>
                <option value="pre-intermediate">{language === 'th' ? 'ก่อนระดับกลาง' : 'Pre-Intermediate'}</option>
                <option value="intermediate">{language === 'th' ? 'ระดับกลาง' : 'Intermediate'}</option>
                <option value="upper-intermediate">{language === 'th' ? 'ระดับกลางสูง' : 'Upper-Intermediate'}</option>
                <option value="advanced">{language === 'th' ? 'ขั้นสูง' : 'Advanced'}</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>

            {/* Max Students */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'จำนวนนักเรียนสูงสุด' : 'Maximum Students'} *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_students}
                onChange={(e) => handleInputChange('max_students', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สถานะการชำระเงิน' : 'Payment Status'}
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => handleInputChange('payment_status', e.target.value as 'pending' | 'deposit_paid' | 'fully_paid')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">{language === 'th' ? 'รอชำระ' : 'Pending'}</option>
                <option value="deposit_paid">{language === 'th' ? 'ชำระมัดจำ' : 'Deposit Paid'}</option>
                <option value="fully_paid">{language === 'th' ? 'ชำระครบ' : 'Fully Paid'}</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'คำอธิบาย' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={language === 'th' ? 'คำอธิบายเพิ่มเติมเกี่ยวกับกลุ่ม...' : 'Additional description about the group...'}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="monthView"
              className="px-6 py-2"
              disabled={isLoading}
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="monthViewClicked"
              className="px-6 py-2"
              disabled={isLoading || formData.course_id === 0 || !formData.group_name.trim()}
            >
              {isLoading ? <LoadingSpinner /> : (language === 'th' ? 'สร้างกลุ่ม' : 'Create Group')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};