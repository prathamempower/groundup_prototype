// GroundUp AI — Operational Tasks & Statutory Inspection Checklist
// Drill-down child item list for actionable project execution

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, User, Calendar, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  role: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  isCompleted: boolean;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Collect unconditional interim lien waivers for Framing (AIA G706A)',
    assignee: 'Sarah Jenkins',
    role: 'CFO',
    dueDate: 'Oct 14, 2026',
    priority: 'HIGH',
    isCompleted: true,
  },
  {
    id: 't-2',
    title: 'Schedule Hoboken Municipal Township Rough Plumbing Inspection',
    assignee: 'Dave Miller',
    role: 'Project Manager',
    dueDate: 'Oct 18, 2026',
    priority: 'HIGH',
    isCompleted: false,
  },
  {
    id: 't-3',
    title: 'Audit and approve Change Order #3 structural soil piers ($18,500)',
    assignee: 'Hardik Parikh',
    role: 'Developer / Owner',
    dueDate: 'Oct 20, 2026',
    priority: 'MEDIUM',
    isCompleted: false,
  },
  {
    id: 't-4',
    title: 'Review BCB Community Bank Draw #3 site inspection photos',
    assignee: 'BCB Title Officer',
    role: 'Lender Inspector',
    dueDate: 'Oct 22, 2026',
    priority: 'NORMAL',
    isCompleted: false,
  },
];

export const ProjectTaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)));
  };

  const filtered = tasks.filter(t => {
    if (filter === 'PENDING') return !t.isCompleted;
    if (filter === 'COMPLETED') return t.isCompleted;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Operational Task Checklist & Inspections</h3>
            <p className="text-xs text-slate-500">Live action items assigned across Owner, CFO, PM, and GC</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode === 'ALL' ? 'All Tasks' : mode === 'PENDING' ? 'Pending' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {filtered.map(task => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-emerald-600 transition">
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300" />
                )}
              </button>
              <div>
                <span
                  className={`text-xs font-semibold ${
                    task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <strong>{task.assignee}</strong> ({task.role})
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Due {task.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  task.priority === 'HIGH'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : task.priority === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
