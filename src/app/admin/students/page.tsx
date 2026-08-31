"use client";

import { useState, useEffect } from 'react';
import { IStudent } from '@/types';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';

export default function StudentsPage() {
  const [students, setStudents] = useState<IStudent[]>([]);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-purple to-primary-pink tracking-tight">Students</h1>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-row text-text-muted text-xs uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-border-card">Name</th>
                <th className="px-6 py-4 border-b border-border-card">Team</th>
                <th className="px-6 py-4 border-b border-border-card">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card bg-card">
              {students.map(s => (
                <tr key={s._id as string} className="hover:bg-row transition-colors">
                  <td className="px-6 py-4 font-bold text-text-primary">{s.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{backgroundColor: (s.teamId as { name: string, color: string }).color}}></div>
                      <span className="text-text-secondary font-medium">{(s.teamId as { name: string, color: string }).name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-muted font-medium">{s.className}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
