import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Edit3 } from 'lucide-react';
import { Project } from '../../shared/types';
import { ProjectStatusSelector } from './project-edit/ProjectStatusSelector';
import { ProjectFormFields } from './project-edit/ProjectFormFields';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: string, updates: Partial<Project>) => void;
}

export function EditProjectModal({ project, isOpen, onClose, onSave }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [gcName, setGcName] = useState('');
  const [lenderName, setLenderName] = useState('');
  const [targetBudget, setTargetBudget] = useState<number>(0);
  const [units, setUnits] = useState<number>(1);
  const [squareFeet, setSquareFeet] = useState<number>(3000);
  const [status, setStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'COMPLETED'>('ACTIVE');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setAddress(project.address);
      setGcName(project.gc_name);
      setLenderName(project.lender_name);
      setTargetBudget(project.target_budget);
      setUnits(project.units);
      setSquareFeet(project.square_feet || 3000);
      setStatus(project.status);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(project.id, {
      name,
      address,
      gc_name: gcName,
      lender_name: lenderName,
      target_budget: targetBudget,
      units,
      square_feet: squareFeet,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Edit Project Details</h2>
              <p className="text-[11px] text-slate-500">Update project parameters & live status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <ProjectStatusSelector status={status} setStatus={setStatus} />

          <ProjectFormFields
            name={name}
            setName={setName}
            address={address}
            setAddress={setAddress}
            targetBudget={targetBudget}
            setTargetBudget={setTargetBudget}
            lenderName={lenderName}
            setLenderName={setLenderName}
            squareFeet={squareFeet}
            setSquareFeet={setSquareFeet}
            units={units}
            setUnits={setUnits}
          />

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
