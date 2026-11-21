'use client';

interface AttendanceSummaryProps {
  total: number;
  checkedIn: number;
  isLoading: boolean;
}

export function AttendanceSummary({
  total,
  checkedIn,
  isLoading,
}: AttendanceSummaryProps) {
  const pending = Math.max(total - checkedIn, 0);
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <section
      id="ringkasan"
      aria-label="Ringkasan Kehadiran Langsung"
      className="rounded-xl border border-slate-200 bg-white"
    >
      <div className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Kehadiran Semasa
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums sm:text-3xl">
              {isLoading ? (
                <span className="inline-block h-8 w-64 rounded bg-slate-100 align-middle" />
              ) : (
                `${checkedIn} / ${total} Peserta Hadir (${percentage}%)`
              )}
            </h2>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div>
              <span className="text-slate-500">Sudah Daftar Masuk: </span>
              <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                {isLoading ? '—' : checkedIn}
              </span>
            </div>
            <span className="text-slate-300" aria-hidden="true">
              |
            </span>
            <div>
              <span className="text-slate-500">Belum Hadir: </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {isLoading ? '—' : pending}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div
            className="h-3 w-full overflow-hidden rounded-md bg-slate-100"
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Peratusan kehadiran peserta"
          >
            <div
              className="h-full rounded-md bg-emerald-600 transition-[width] duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
