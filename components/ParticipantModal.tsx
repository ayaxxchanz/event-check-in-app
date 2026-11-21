'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { EMAIL_REGEX, PesertaDTO, StatusHadir } from '@/lib/types';

interface ParticipantModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData: PesertaDTO | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    nama_peserta: string;
    emel: string;
    organisasi_atau_fakulti: string;
    status_hadir: StatusHadir;
  }) => Promise<void>;
}

interface ParticipantFormContentProps {
  mode: 'create' | 'edit';
  initialData: PesertaDTO | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: ParticipantModalProps['onSubmit'];
}

function ParticipantFormContent({
  mode,
  initialData,
  isSubmitting,
  onClose,
  onSubmit,
}: ParticipantFormContentProps) {
  const [namaPeserta, setNamaPeserta] = useState(
    mode === 'edit' && initialData ? initialData.nama_peserta : ''
  );
  const [emel, setEmel] = useState(
    mode === 'edit' && initialData ? initialData.emel : ''
  );
  const [organisasi, setOrganisasi] = useState(
    mode === 'edit' && initialData ? initialData.organisasi_atau_fakulti : ''
  );
  const [statusHadir, setStatusHadir] = useState<StatusHadir>(
    mode === 'edit' && initialData
      ? initialData.status_hadir === 'Sudah Daftar Masuk'
        ? 'Sudah Daftar Masuk'
        : 'Belum Hadir'
      : 'Sudah Daftar Masuk'
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = namaPeserta.trim();
    const trimmedEmail = emel.trim().toLowerCase();
    const trimmedOrg = organisasi.trim();

    if (trimmedName.length < 2) {
      setFieldError('Sila masukkan nama penuh peserta (minimum 2 aksara).');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldError('Sila masukkan alamat emel yang sah.');
      return;
    }
    if (trimmedOrg.length < 2) {
      setFieldError('Sila masukkan nama organisasi atau fakulti.');
      return;
    }

    setFieldError(null);
    await onSubmit({
      nama_peserta: trimmedName,
      emel: trimmedEmail,
      organisasi_atau_fakulti: trimmedOrg,
      status_hadir: statusHadir,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <UserPlus className="h-5 w-5 text-blue-700" aria-hidden="true" />
          <h2
            id="participant-modal-title"
            className="text-base font-semibold text-slate-900"
          >
            {mode === 'create'
              ? 'Daftar Peserta Walk-In'
              : 'Kemaskini Maklumat Peserta'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Tutup borang"
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4 px-6 py-5">
        {fieldError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {fieldError}
          </div>
        )}

        <div>
          <label
            htmlFor="nama_peserta"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Nama Penuh Peserta
          </label>
          <input
            id="nama_peserta"
            type="text"
            required
            autoFocus
            maxLength={120}
            value={namaPeserta}
            onChange={(e) => setNamaPeserta(e.target.value)}
            placeholder="Contoh: Muhammad Amirul bin Azlan"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="emel"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Alamat Emel
          </label>
          <input
            id="emel"
            type="email"
            required
            maxLength={160}
            value={emel}
            onChange={(e) => setEmel(e.target.value)}
            placeholder="contoh: amirul@utm.my"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="organisasi_atau_fakulti"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Organisasi atau Fakulti
          </label>
          <input
            id="organisasi_atau_fakulti"
            type="text"
            required
            maxLength={160}
            value={organisasi}
            onChange={(e) => setOrganisasi(e.target.value)}
            placeholder="Contoh: Fakulti Komputeran, UTM"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
        </div>

        {mode === 'create' ? (
          <div className="pt-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={statusHadir === 'Sudah Daftar Masuk'}
                onChange={(e) =>
                  setStatusHadir(
                    e.target.checked ? 'Sudah Daftar Masuk' : 'Belum Hadir'
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span>
                Terus tandakan sebagai{' '}
                <strong className="font-semibold text-slate-900">
                  Sudah Daftar Masuk
                </strong>{' '}
                sekarang
              </span>
            </label>
          </div>
        ) : (
          <div>
            <label
              htmlFor="status_hadir"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Status Kehadiran
            </label>
            <select
              id="status_hadir"
              value={statusHadir}
              onChange={(e) => setStatusHadir(e.target.value as StatusHadir)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="Belum Hadir">Belum Hadir</option>
              <option value="Sudah Daftar Masuk">Sudah Daftar Masuk</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {mode === 'create' ? 'Daftar Peserta' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export function ParticipantModal({
  isOpen,
  mode,
  initialData,
  isSubmitting,
  onClose,
  onSubmit,
}: ParticipantModalProps) {
  const formKey = `${mode}-${initialData?.id ?? 'new'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="participant-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          />

          <ParticipantFormContent
            key={formKey}
            mode={mode}
            initialData={initialData}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
