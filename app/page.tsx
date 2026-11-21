'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  RefreshCw,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import { AttendanceSummary } from '@/components/AttendanceSummary';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ParticipantModal } from '@/components/ParticipantModal';
import { ParticipantTable } from '@/components/ParticipantTable';
import { ToastItem, ToastStack } from '@/components/ToastStack';
import { PesertaDTO, StatusHadir } from '@/lib/types';

type FilterStatus = 'Semua' | 'Belum Hadir' | 'Sudah Daftar Masuk';

export default function EventCheckInPage() {
  const [pesertaList, setPesertaList] = useState<PesertaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Semua');

  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    target: PesertaDTO | null;
  }>({
    isOpen: false,
    mode: 'create',
    target: null,
  });
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PesertaDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pushToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadPesertaData = useCallback(async () => {
    const response = await fetch('/api/peserta', {
      cache: 'no-store',
    });
    const json = (await response.json()) as {
      data?: PesertaDTO[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(json.error || 'Gagal memuatkan senarai peserta.');
    }

    return Array.isArray(json.data) ? json.data : [];
  }, []);

  const fetchPeserta = useCallback(
    async (silent = false) => {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadError(null);

      try {
        const data = await loadPesertaData();
        setPesertaList(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Ralat rangkaian semasa memuatkan data.';
        setLoadError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadPesertaData]
  );

  useEffect(() => {
    let cancelled = false;
    loadPesertaData()
      .then((data) => {
        if (!cancelled) {
          setPesertaList(data);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : 'Ralat rangkaian semasa memuatkan data.';
          setLoadError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loadPesertaData]);

  useEffect(() => {
    const handleSlashShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleSlashShortcut);
    return () => window.removeEventListener('keydown', handleSlashShortcut);
  }, []);

  const totalCount = pesertaList.length;
  const checkedInCount = useMemo(
    () =>
      pesertaList.filter((item) => item.status_hadir === 'Sudah Daftar Masuk')
        .length,
    [pesertaList]
  );

  const filteredPeserta = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return pesertaList.filter((item) => {
      const matchesName =
        query === '' || item.nama_peserta.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'Semua' || item.status_hadir === statusFilter;
      return matchesName && matchesStatus;
    });
  }, [pesertaList, searchQuery, statusFilter]);

  const handleCheckIn = async (peserta: PesertaDTO) => {
    setCheckingInId(peserta.id);
    try {
      const response = await fetch(`/api/peserta/${peserta.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkin' }),
      });
      const json = (await response.json()) as {
        data?: PesertaDTO;
        error?: string;
      };

      if (!response.ok || !json.data) {
        throw new Error(json.error || 'Gagal melaksanakan check-in.');
      }

      setPesertaList((prev) =>
        prev.map((row) => (row.id === peserta.id ? json.data! : row))
      );
      pushToast(
        'success',
        `${peserta.nama_peserta} berjaya daftar masuk (Hadir ✓).`
      );
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Ralat semasa check-in peserta.'
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const handleUndoCheckIn = async (peserta: PesertaDTO) => {
    setCheckingInId(peserta.id);
    try {
      const response = await fetch(`/api/peserta/${peserta.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const json = (await response.json()) as {
        data?: PesertaDTO;
        error?: string;
      };

      if (!response.ok || !json.data) {
        throw new Error(json.error || 'Gagal membatalkan check-in.');
      }

      setPesertaList((prev) =>
        prev.map((row) => (row.id === peserta.id ? json.data! : row))
      );
      pushToast(
        'success',
        `Status ${peserta.nama_peserta} ditetapkan kepada Belum Hadir.`
      );
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error
          ? error.message
          : 'Ralat semasa membatalkan check-in.'
      );
    } finally {
      setCheckingInId(null);
    }
  };

  const handleModalSubmit = async (payload: {
    nama_peserta: string;
    emel: string;
    organisasi_atau_fakulti: string;
    status_hadir: StatusHadir;
  }) => {
    setIsSubmittingModal(true);
    try {
      if (modalState.mode === 'create') {
        const response = await fetch('/api/peserta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = (await response.json()) as {
          data?: PesertaDTO;
          error?: string;
        };

        if (!response.ok || !json.data) {
          throw new Error(json.error || 'Gagal mendaftarkan peserta.');
        }

        setPesertaList((prev) => [json.data!, ...prev]);
        setModalState({ isOpen: false, mode: 'create', target: null });
        pushToast(
          'success',
          `${json.data.nama_peserta} berjaya didaftarkan.`
        );
      } else if (modalState.target) {
        const targetId = modalState.target.id;
        const response = await fetch(`/api/peserta/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = (await response.json()) as {
          data?: PesertaDTO;
          error?: string;
        };

        if (!response.ok || !json.data) {
          throw new Error(json.error || 'Gagal mengemaskini rekod peserta.');
        }

        setPesertaList((prev) =>
          prev.map((row) => (row.id === targetId ? json.data! : row))
        );
        setModalState({ isOpen: false, mode: 'create', target: null });
        pushToast(
          'success',
          `Maklumat ${json.data.nama_peserta} berjaya dikemaskini.`
        );
      }
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error ? error.message : 'Operasi gagal dilaksanakan.'
      );
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/peserta/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error || 'Gagal memadam rekod peserta.');
      }

      const deletedName = deleteTarget.nama_peserta;
      setPesertaList((prev) =>
        prev.filter((row) => row.id !== deleteTarget.id)
      );
      setDeleteTarget(null);
      pushToast('success', `Rekod ${deletedName} telah dipadam.`);
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error ? error.message : 'Gagal memadam rekod.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#ringkasan"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Event Check-In
          </a>

          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#ringkasan"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#kaunter-carian"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Kaunter Carian
            </a>
            <a
              href="#senarai-peserta"
              className="transition-colors hover:text-slate-900 whitespace-nowrap shrink-0"
            >
              Senarai Peserta
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() =>
                setModalState({ isOpen: true, mode: 'create', target: null })
              }
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span>Daftar Walk-In</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
              Sistem Pendaftaran Acara &amp; Kehadiran
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
              Kaunter semakan masuk pantas untuk bengkel, seminar, dan aktiviti
              kolej. Cari nama peserta, tekan Check-In, atau daftar peserta
              walk-in baharu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchPeserta(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap shrink-0 sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>Muat Semula</span>
          </button>
        </div>

        {loadError && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-red-900">
                  Sambungan pangkalan data memerlukan perhatian
                </p>
                <p className="mt-0.5 text-red-700">{loadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void fetchPeserta(false)}
              className="min-h-[38px] self-start rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 whitespace-nowrap shrink-0 sm:self-auto"
            >
              Cuba Semula
            </button>
          </div>
        )}

        <AttendanceSummary
          total={totalCount}
          checkedIn={checkedInCount}
          isLoading={isLoading}
        />

        <section
          id="kaunter-carian"
          aria-label="Carian dan tapisan peserta"
          className="space-y-3"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama peserta dengan pantas di kaunter pendaftaran (tekan / )..."
              aria-label="Cari nama peserta"
              className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-base text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/15"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Kosongkan carian"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Tapis status kehadiran"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1"
            >
              {(['Semua', 'Belum Hadir', 'Sudah Daftar Masuk'] as const).map(
                (tab) => {
                  const active = statusFilter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={`min-h-[34px] rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        active
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                }
              )}
            </div>

            <p className="text-xs font-medium text-slate-500 font-mono tabular-nums">
              Menunjukkan {filteredPeserta.length} daripada {totalCount} peserta
            </p>
          </div>
        </section>

        <ParticipantTable
          pesertaList={filteredPeserta}
          isLoading={isLoading}
          hasSearchOrFilter={
            searchQuery.trim() !== '' || statusFilter !== 'Semua'
          }
          checkingInId={checkingInId}
          onCheckIn={handleCheckIn}
          onUndoCheckIn={handleUndoCheckIn}
          onEdit={(peserta) =>
            setModalState({ isOpen: true, mode: 'edit', target: peserta })
          }
          onDelete={(peserta) => setDeleteTarget(peserta)}
          onResetFilter={() => {
            setSearchQuery('');
            setStatusFilter('Semua');
          }}
          onOpenCreate={() =>
            setModalState({ isOpen: true, mode: 'create', target: null })
          }
        />
      </main>

      <ParticipantModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        initialData={modalState.target}
        isSubmitting={isSubmittingModal}
        onClose={() => {
          if (!isSubmittingModal) {
            setModalState({ isOpen: false, mode: 'create', target: null });
          }
        }}
        onSubmit={handleModalSubmit}
      />

      <DeleteConfirmModal
        peserta={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
