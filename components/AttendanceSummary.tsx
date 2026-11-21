'use client';

import { CheckCheck, Hourglass, UsersRound } from 'lucide-react';

interface AttendanceSummaryProps { total: number; checkedIn: number; isLoading: boolean; }

export function AttendanceSummary({ total, checkedIn, isLoading }: AttendanceSummaryProps) {
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const cards = [
    { label: 'Jumlah Peserta', value: total, caption: 'Nama dalam buku tetamu', Icon: UsersRound, tone: 'cream' },
    { label: 'Sudah Daftar Masuk', value: checkedIn, caption: 'Kehadiran yang diraikan', Icon: CheckCheck, tone: 'sage' },
    { label: 'Belum Hadir', value: Math.max(total - checkedIn, 0), caption: 'Masih menanti ketibaan', Icon: Hourglass, tone: 'violet' },
  ];
  return (
    <section id="ringkasan" className="attendance-section" aria-label="Ringkasan kehadiran">
      <div className="section-caption"><span /> SEKILAS KEHADIRAN <span /></div>
      <div className="attendance-grid">
        {cards.map(({ label, value, caption, Icon, tone }) => (
          <article className={`attendance-card attendance-card--${tone}`} key={label}>
            <div className="arch-inset" aria-hidden="true" />
            <Icon className="attendance-icon" strokeWidth={1.25} aria-hidden="true" />
            <p className="attendance-label">{label}</p>
            <p className="attendance-number" aria-live="polite">{isLoading ? '\u2014' : String(value).padStart(2, '0')}</p>
            <p className="attendance-caption">{caption}</p>
            <span className="card-star" aria-hidden="true">&#10022;</span>
          </article>
        ))}
      </div>
      <div className="attendance-progress">
        <div><span>Setiap kehadiran melengkapkan cerita.</span><strong>{isLoading ? '\u2014' : `${percentage}%`} kehadiran</strong></div>
        <div className="progress-track" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label="Peratusan kehadiran peserta"><div style={{ width: `${percentage}%` }} /></div>
      </div>
    </section>
  );
}
