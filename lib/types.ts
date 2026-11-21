export type StatusHadir = 'Belum Hadir' | 'Sudah Daftar Masuk';

export interface PesertaDTO {
  id: number;
  nama_peserta: string;
  emel: string;
  organisasi_atau_fakulti: string;
  status_hadir: StatusHadir | string;
  masa_checkin: string | null;
  createdAt: string;
}

export interface PesertaInput {
  nama_peserta: string;
  emel: string;
  organisasi_atau_fakulti: string;
  status_hadir?: StatusHadir;
}

export const ALLOWED_STATUSES: readonly StatusHadir[] = [
  'Belum Hadir',
  'Sudah Daftar Masuk',
];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidStatus(value: unknown): value is StatusHadir {
  return (
    typeof value === 'string' &&
    (value === 'Belum Hadir' || value === 'Sudah Daftar Masuk')
  );
}
