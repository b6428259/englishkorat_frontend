import React from 'react';
import { Teacher } from '../../services/api/teachers';
import Avatar from './Avatar';
import { getAvatarUrl } from '../../utils/config';

interface TeachersTableProps {
  teachers: Teacher[];
  loading?: boolean;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacher: Teacher) => void;
  onView?: (teacher: Teacher) => void;
}

const getTeacherTypeColor = (type: string) => {
  switch (type) {
    case 'Both':
      return 'bg-blue-100 text-blue-800';
    case 'Kid':
      return 'bg-green-100 text-green-800';
    case 'Adults':
      return 'bg-purple-100 text-purple-800';
    case 'Admin Team':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (active: number) => {
  return active === 1 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

const TeachersTable: React.FC<TeachersTableProps> = ({ 
  teachers, 
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">ไม่พบข้อมูลครู</div>
        <div className="text-gray-400 text-sm mt-2">ยังไม่มีครูในระบบ</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile View - Card Layout */}
      <div className="lg:hidden space-y-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {teacher.first_name} {teacher.last_name}
                </h3>
                <p className="text-sm text-gray-600">{teacher.nickname}</p>
              </div>
              <div className="flex space-x-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTeacherTypeColor(teacher.teacher_type)}`}>
                  {teacher.teacher_type}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(teacher.active)}`}>
                  {teacher.active === 1 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">ความเชี่ยวชาญ:</span>
                <p className="text-gray-600 mt-1">{teacher.specializations || 'ไม่ระบุ'}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">คุณสมบัติ:</span>
                <p className="text-gray-600 mt-1 line-clamp-2">{teacher.certifications || 'ไม่ระบุ'}</p>
              </div>
              
              {(teacher.email || teacher.phone) && (
                <div>
                  <span className="font-medium text-gray-700">ติดต่อ:</span>
                  <div className="text-gray-600 mt-1">
                    {teacher.email && <div>{teacher.email}</div>}
                    {teacher.phone && <div>{teacher.phone}</div>}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
              {onView && (
                <button
                  onClick={() => onView(teacher)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ดูรายละเอียด
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(teacher)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  แก้ไข
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(teacher)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  ลบ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ครู
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ความเชี่ยวชาญ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                คุณสมบัติ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={getAvatarUrl(teacher.avatar)}
                        alt={`${teacher.first_name} ${teacher.last_name}`}
                        size="md"
                        fallbackInitials={`${teacher.first_name.charAt(0)}${teacher.last_name.charAt(0)}`}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.first_name} {teacher.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {teacher.nickname}
                      </div>
                      {teacher.email && (
                        <div className="text-sm text-gray-500">
                          {teacher.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTeacherTypeColor(teacher.teacher_type)}`}>
                    {teacher.teacher_type}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="text-sm text-gray-900 truncate">
                    {teacher.specializations || 'ไม่ระบุ'}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-sm">
                  <div className="text-sm text-gray-900 line-clamp-2">
                    {teacher.certifications || 'ไม่ระบุ'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(teacher.active)}`}>
                    {teacher.active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    {onView && (
                      <button
                        onClick={() => onView(teacher)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ดู
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(teacher)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        แก้ไข
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(teacher)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeachersTable;
