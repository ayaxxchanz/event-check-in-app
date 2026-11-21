'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { PesertaDTO } from '@/lib/types';

interface DeleteConfirmModalProps {
  peserta: PesertaDTO | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  peserta,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!peserta) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [peserta, isDeleting, onCancel]);

  return (
    <AnimatePresence>
      {peserta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (!isDeleting) onCancel();
            }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle
                  className="h-5 w-5 text-red-600"
                  aria-hidden="true"
                />
                <h2
                  id="delete-modal-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Padam Rekod Peserta
                </h2>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                aria-label="Tutup pengesahan"
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-slate-600">
                Adakah anda pasti mahu memadam rekod pendaftaran bagi peserta
                berikut? Tindakan ini tidak boleh dikembalikan.
              </p>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {peserta.nama_peserta}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">
                  {peserta.emel} <span aria-hidden="true">·</span>{' '}
                  {peserta.organisasi_atau_fakulti}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  {isDeleting && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Ya, Padam Rekod
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
