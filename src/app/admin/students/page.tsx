"use client";

import { useState, useEffect } from 'react';
import { IStudent } from '@/types';

export default function StudentsPage() {
  const [students, setStudents] = useState<IStudent[]>([]);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Students</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
              <th className="px-6 py-4 border-b">Name</th>
              <th className="px-6 py-4 border-b">Team</th>
              <th className="px-6 py-4 border-b">Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(s => (
              <tr key={s._id as string}>
                <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: (s.teamId as { name: string, color: string }).color}}></div>
                    <span className="text-slate-600">{(s.teamId as { name: string, color: string }).name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{s.className}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
