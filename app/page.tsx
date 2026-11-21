'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  RefreshCw,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import { StoryOrnament } from '@/components/StoryOrnament';
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
    <div className="fable-app">
      <header className="site-header">
        <a href="#" className="brand"><span className="brand-seal" aria-hidden="true">E</span><span>Event <em>Check-In</em><small>SETIAP KEHADIRAN, SEBUAH CERITA</small></span></a>
        <nav aria-label="Navigasi utama" className="header-nav">
          <a href="#ringkasan">Ringkasan</a><a href="#kaunter-carian">Kaunter Carian</a><a href="#senarai-peserta">Buku Tetamu</a>
        </nav>
        <button type="button" className="button button-cream header-cta" onClick={() => setModalState({ isOpen: true, mode: 'create', target: null })}><UserPlus size={16} aria-hidden="true" />Daftar Walk-In</button>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <StoryOrnament className="hero-branch hero-branch-left" /><StoryOrnament className="hero-branch hero-branch-right" />
          <span className="hero-spark spark-one" aria-hidden="true">&#10022;</span><span className="hero-spark spark-two" aria-hidden="true">&#10022;</span>
          <div className="hero-eyebrow">SELAMAT DATANG KE KAUNTER PENDAFTARAN</div>
          <h1 id="page-title">Sebuah pertemuan.<br /><em>Seribu cerita.</em></h1>
          <div className="hero-flourish" aria-hidden="true"><span />&#10022;<span /></div>
          <p>Raikan setiap ketibaan. Urus pendaftaran dan kehadiran<br className="desktop-break" /> acara anda dengan mudah, dari tetamu pertama hingga yang terakhir.</p>
          <div className="hero-subtitle">Sistem Pendaftaran Acara &amp; Kehadiran</div>
        </section>

        <div className="summary-wrap"><AttendanceSummary total={totalCount} checkedIn={checkedInCount} isLoading={isLoading} /></div>

        <section className="register-stage" aria-labelledby="register-title">
          <div className="register-inner">
            <div className="register-heading"><div><p className="eyebrow">BUKU TETAMU ANDA</p><h2 id="register-title">Setiap nama, <em>istimewa.</em></h2><p>Cari peserta dan sambut kehadiran mereka.</p></div>
              <button type="button" onClick={() => void fetchPeserta(true)} disabled={isLoading || isRefreshing} className="button button-outline"><RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />Muat Semula</button>
            </div>
            {loadError && <div role="alert" className="load-error"><AlertCircle size={20} aria-hidden="true" /><div><strong>Senarai peserta tidak dapat dimuatkan</strong><p>{loadError}</p></div><button type="button" className="button button-outline" onClick={() => void fetchPeserta(false)}>Cuba Semula</button></div>}
            <section id="kaunter-carian" aria-label="Carian dan tapisan peserta" className="search-panel">
              <div className="search-field"><Search size={21} aria-hidden="true" /><input ref={searchInputRef} type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama peserta..." aria-label="Cari nama peserta" />
                {searchQuery ? <button type="button" onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} aria-label="Kosongkan carian"><X size={17} /></button> : <kbd>/</kbd>}
              </div>
              <div className="filter-row"><div role="group" aria-label="Tapis status kehadiran" className="filter-tabs">
                {(['Semua', 'Belum Hadir', 'Sudah Daftar Masuk'] as const).map((tab) => <button key={tab} type="button" aria-pressed={statusFilter === tab} onClick={() => setStatusFilter(tab)} className={statusFilter === tab ? 'filter-tab active' : 'filter-tab'}>{tab}<span>{tab === 'Semua' ? totalCount : tab === 'Belum Hadir' ? totalCount - checkedInCount : checkedInCount}</span></button>)}
              </div><p className="result-count" aria-live="polite">{filteredPeserta.length} daripada {totalCount} peserta</p></div>
            </section>
            <div id="senarai-peserta" className="guest-register">
              <ParticipantTable pesertaList={filteredPeserta} isLoading={isLoading} hasSearchOrFilter={searchQuery.trim() !== '' || statusFilter !== 'Semua'} checkingInId={checkingInId} onCheckIn={handleCheckIn} onUndoCheckIn={handleUndoCheckIn} onEdit={(peserta) => setModalState({ isOpen: true, mode: 'edit', target: peserta })} onDelete={(peserta) => setDeleteTarget(peserta)} onResetFilter={() => { setSearchQuery(''); setStatusFilter('Semua'); }} onOpenCreate={() => setModalState({ isOpen: true, mode: 'create', target: null })} />
            </div>
            <p className="register-note"><span aria-hidden="true">&#10022;</span> Pertemuan yang indah bermula dengan sambutan yang mesra.</p>
          </div>
        </section>
      </main>
      <footer className="site-footer"><span className="footer-star" aria-hidden="true">&#10022;</span><p>Terima kasih kerana menjadi<br /><em>sebahagian daripada cerita.</em></p><div>EVENT CHECK-IN <span aria-hidden="true">&middot;</span> DICIPTA UNTUK SETIAP PERTEMUAN</div></footer>

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
