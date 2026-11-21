'use client';

import {
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { PesertaDTO } from '@/lib/types';

interface ParticipantTableProps {
  pesertaList: PesertaDTO[];
  isLoading: boolean;
  hasSearchOrFilter: boolean;
  checkingInId: number | null;
  onCheckIn: (peserta: PesertaDTO) => Promise<void>;
  onUndoCheckIn: (peserta: PesertaDTO) => Promise<void>;
  onEdit: (peserta: PesertaDTO) => void;
  onDelete: (peserta: PesertaDTO) => void;
  onResetFilter: () => void;
  onOpenCreate: () => void;
}

function formatCheckInTime(isoString: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function ParticipantTable({
  pesertaList,
  isLoading,
  hasSearchOrFilter,
  checkingInId,
  onCheckIn,
  onUndoCheckIn,
  onEdit,
  onDelete,
  onResetFilter,
  onOpenCreate,
}: ParticipantTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-200">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 rounded bg-slate-100" />
                <div className="h-3 w-64 rounded bg-slate-100" />
              </div>
              <div className="hidden h-4 w-44 rounded bg-slate-100 md:block" />
              <div className="h-9 w-28 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pesertaList.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
        <Users
          className="mx-auto h-10 w-10 text-slate-400"
          aria-hidden="true"
        />
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          {hasSearchOrFilter
            ? 'Tiada peserta sepadan dengan carian'
            : 'Belum ada peserta berdaftar'}
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          {hasSearchOrFilter
            ? 'Cuba semak ejaan nama atau kosongkan tapisan untuk melihat semua peserta yang berdaftar.'
            : 'Daftarkan peserta pertama anda untuk mula menyambut kehadiran di acara ini.'}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {hasSearchOrFilter ? (
            <button
              type="button"
              onClick={onResetFilter}
              className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Reset Carian
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Daftar Walk-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
              <th scope="col" className="w-16 px-6 py-3.5">
                ID
              </th>
              <th scope="col" className="px-4 py-3.5">
                Peserta &amp; Emel
              </th>
              <th scope="col" className="px-4 py-3.5">
                Organisasi / Fakulti
              </th>
              <th scope="col" className="px-4 py-3.5">
                Kehadiran
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {pesertaList.map((peserta) => {
              const isCheckedIn =
                peserta.status_hadir === 'Sudah Daftar Masuk';
              const isBusy = checkingInId === peserta.id;
              const formattedTime = formatCheckInTime(peserta.masa_checkin);

              return (
                <tr
                  key={peserta.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500 tabular-nums">
                    #{peserta.id}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900">
                      {peserta.nama_peserta}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {peserta.emel}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-4 text-slate-700">
                    <span className="line-clamp-2">
                      {peserta.organisasi_atau_fakulti}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {isCheckedIn ? (
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 whitespace-nowrap shrink-0">
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-600"
                            aria-hidden="true"
                          />
                          <span>Hadir ✓</span>
                        </span>
                        {formattedTime && (
                          <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formattedTime}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onUndoCheckIn(peserta)}
                          disabled={isBusy}
                          title="Tetapkan semula kepada Belum Hadir"
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                        >
                          {isBusy ? (
                            <Loader2
                              className="h-3.5 w-3.5 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <RotateCcw
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          )}
                          <span>Batal</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCheckIn(peserta)}
                        disabled={isBusy}
                        className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                      >
                        {isBusy ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>Check-In</span>
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(peserta)}
                        aria-label={`Edit ${peserta.nama_peserta}`}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(peserta)}
                        aria-label={`Padam ${peserta.nama_peserta}`}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Padam</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked List */}
      <div className="divide-y divide-slate-200 md:hidden">
        {pesertaList.map((peserta) => {
          const isCheckedIn = peserta.status_hadir === 'Sudah Daftar Masuk';
          const isBusy = checkingInId === peserta.id;
          const formattedTime = formatCheckInTime(peserta.masa_checkin);

          return (
            <div key={peserta.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      #{peserta.id}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{peserta.emel}</span>
                  </div>
                  <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                    {peserta.nama_peserta}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {peserta.organisasi_atau_fakulti}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div>
                  {isCheckedIn ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 whitespace-nowrap">
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span>Hadir ✓</span>
                      </span>
                      {formattedTime && (
                        <span className="font-mono text-xs text-slate-600 tabular-nums">
                          {formattedTime}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onUndoCheckIn(peserta)}
                        disabled={isBusy}
                        className="inline-flex min-h-[36px] items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Batal</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onCheckIn(peserta)}
                      disabled={isBusy}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap"
                    >
                      {isBusy ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>Check-In</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(peserta)}
                    aria-label={`Edit ${peserta.nama_peserta}`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(peserta)}
                    aria-label={`Padam ${peserta.nama_peserta}`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Padam</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
