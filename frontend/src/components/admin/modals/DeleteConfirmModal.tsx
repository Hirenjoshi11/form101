import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  warningNote?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  description,
  warningNote,
  confirmLabel = 'Confirm Delete',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-in text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <Trash2 className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-lg text-[#18232D]">
          {title}
        </h3>
        <p className="text-xs text-[#5B6470] leading-relaxed">
          {description}
        </p>

        {warningNote && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Important Note:</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              {warningNote}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
