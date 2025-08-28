"use client";

import { useState } from "react";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";
import { colors } from "@/styles/colors";
import { ButtonGroup } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/react";

export const columns = [
  {name: "Lesson plan", uid: "lessonPlan"},
  {name: "Date", uid: "date"},
  {name: "Hours", uid: "hours"},
  {name: "Warm-Up", uid: "warmUp"},
  {name: "Topic", uid: "topic"},
  {name: "Last Page", uid: "lastPage"},
  {name: "Teacher's Name", uid: "teacherName"},
];

export default function TeachingReport()  {
    const { t } = useLanguage();

    return (
        <SidebarLayout  breadcrumbItems={[{  label:  t.teachingReport }]}>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold text-black mb-6">{t.teachingReport} : ชื่อคอร์ส</h1>

                <h2 className="font-bold text-gray-700 mb-2">Book: </h2>
                <h2 className="font-bold text-gray-700 mb-2">Goal of this class: </h2>
                    
                
                

                <Table
                    aria-label="Teaching Report Table"
                    className="min-w-full rounded-lg text-sm divide-x divide-gray-300 border-collapse border border-gray-300 shadow-md"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.uid}  
                                className="bg-[#334293] text-center font-bold text-white border border-gray-200"
                            >
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-200">

                    </TableBody>
                </Table>
              </div>
            </div>
        </SidebarLayout>
    )
}