import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      bg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      btnColor: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    },
    warning: {
      bg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      btnColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    info: {
      bg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onCancel} />

        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${typeConfig.bg}`}>
                <AlertTriangle className={`h-6 w-6 ${typeConfig.iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3 className="text-base font-semibold leading-6 text-slate-900">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500">{message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-500 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto disabled:opacity-50 ${typeConfig.btnColor}`}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:mt-0 sm:w-auto disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
