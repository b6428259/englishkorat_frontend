import React from 'react';
import EnhancedSelect, { type SelectOption } from '@/components/common/forms/EnhancedSelect';
import { HiUserGroup } from 'react-icons/hi2';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface StudentSelectProps {
  students: Student[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
  className?: string;
}

export default function StudentSelect({
  students,
  selectedIds,
  onChange,
  placeholder = "Select students...",
  maxHeight = "300px",
  className = ""
}: StudentSelectProps) {
  const options: SelectOption[] = students.map(student => ({
    value: student.id,
    label: student.name,
    description: student.email,
    icon: <HiUserGroup />
  }));

  return (
    <div className={className} style={{ maxHeight }}>
      <EnhancedSelect
        options={options}
        value={selectedIds}
        onChange={(value: string | string[]) => {
          // Handle both single and multiple values
          const ids = Array.isArray(value) ? value : [value];
          onChange(ids);
        }}
        placeholder={placeholder}
        searchable
        multiple
        maxHeight={maxHeight}
      />
    </div>
  );
}
