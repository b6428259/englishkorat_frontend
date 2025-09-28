"use client";

import Button from "@/components/common/Button";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useState } from "react";

type PaymentType = "weekly" | "monthly";

type Teacher =
  | {
      id: number;
      name: string;
      type: "weekly";
      rate: number;
      socialSecurity: boolean;
    }
  | {
      id: number;
      name: string;
      type: "monthly";
      salary: number;
      socialSecurity: boolean;
    };

const teachers: Teacher[] = [
  { id: 1, name: "Alec", type: "weekly", rate: 500, socialSecurity: true },
  { id: 2, name: "Angie", type: "weekly", rate: 500, socialSecurity: false },
  { id: 3, name: "Skye", type: "monthly", salary: 30000, socialSecurity: true },
];

const paymentTypeColors: Record<PaymentType, string> = {
  weekly: "bg-blue-200 text-blue-800",
  monthly: "bg-yellow-200 text-yellow-700",
};

export default function TeachersSalaryPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | PaymentType>("all");

  // Filter data
  const filteredTeachers = teachers.filter((teacher) => {
    const matchName = teacher.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || teacher.type === filterType;
    return matchName && matchType;
  });

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.teachersSalary }]}>
      <div className="space-y-2 p-6 bg-white rounded-lg shadow-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">{t.teachersSalary}</h1>
        </div>

        {/* 🔍 Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder={`🔍 ${t.searchTeacher}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/3"
          />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "all" | PaymentType)
            }
            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-40"
          >
            <option value="all">{t.all}</option>
            <option value="weekly">{t.weekly}</option>
            <option value="monthly">{t.monthly}</option>
          </select>
        </div>

        {/* 📊 Table */}
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-sm font-normal">
            <tr>
              <th className="p-3 text-left">{t.teacher}</th>
              <th className="p-3">{t.paymentType}</th>
              <th className="p-3">{t.rateOrSalary}</th>
              <th className="p-3">{t.socialSecurity}</th>
              <th className="p-3 w-auto"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="border-t">
                <td className="p-3">{teacher.name}</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-sm min-w-[80px] text-center ${
                      paymentTypeColors[teacher.type]
                    }`}
                  >
                    {teacher.type === "weekly" ? t.weekly : t.monthly}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {teacher.type === "weekly"
                    ? `${teacher.rate} / hr`
                    : `${teacher.salary?.toLocaleString()} ฿`}
                </td>
                <td className="p-3">
                  <div className="flex justify-center items-center">
                    {teacher.socialSecurity ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 w-auto whitespace-nowrap">
                  <div className="flex justify-center items-center gap-2">
                    <Button size="xs" variant="common">
                      <Link
                        href={`/teachers/teachersSalary/salaryDetail/${teacher.id}`}
                      >
                        View
                      </Link>
                    </Button>
                    <Button size="xs" variant="common">
                      Bill
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}
