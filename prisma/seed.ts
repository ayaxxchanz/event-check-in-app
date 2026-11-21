import { prisma } from '../lib/prisma';

async function main() {
  await prisma.peserta.deleteMany();

  const now = new Date();
  const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);

  await prisma.peserta.createMany({
    data: [
      {
        nama_peserta: 'Ahmad Faiz bin Razak',
        emel: 'ahmad.faiz@utm.my',
        organisasi_atau_fakulti: 'Fakulti Komputeran, UTM',
        status_hadir: 'Sudah Daftar Masuk',
        masa_checkin: minutesAgo(42),
      },
      {
        nama_peserta: 'Nurul Huda binti Ismail',
        emel: 'nurul.huda@um.edu.my',
        organisasi_atau_fakulti: 'Fakulti Sains Komputer & Teknologi Maklumat, UM',
        status_hadir: 'Sudah Daftar Masuk',
        masa_checkin: minutesAgo(35),
      },
      {
        nama_peserta: 'Tan Wei Ming',
        emel: 'weiming.tan@petronas.com.my',
        organisasi_atau_fakulti: 'Petronas Digital Sdn Bhd',
        status_hadir: 'Sudah Daftar Masuk',
        masa_checkin: minutesAgo(28),
      },
      {
        nama_peserta: 'Siti Aishah binti Mohamad',
        emel: 'siti.aishah@ukm.edu.my',
        organisasi_atau_fakulti: 'Fakulti Teknologi & Sains Maklumat, UKM',
        status_hadir: 'Sudah Daftar Masuk',
        masa_checkin: minutesAgo(19),
      },
      {
        nama_peserta: 'Kavitha a/p Subramaniam',
        emel: 'kavitha.s@mdec.com.my',
        organisasi_atau_fakulti: 'Perbadanan Ekonomi Digital Malaysia (MDEC)',
        status_hadir: 'Sudah Daftar Masuk',
        masa_checkin: minutesAgo(11),
      },
      {
        nama_peserta: 'Muhammad Danial Hakim bin Roslan',
        emel: 'danial.hakim@uitm.edu.my',
        organisasi_atau_fakulti: 'Kolej Pengkomputeran, Informatik & Matematik, UiTM',
        status_hadir: 'Sudah Daftar Masuk',
        masa_checkin: minutesAgo(4),
      },
      {
        nama_peserta: 'Chong Mei Ling',
        emel: 'meiling.chong@usm.my',
        organisasi_atau_fakulti: 'Pusat Pengajian Sains Komputer, USM',
        status_hadir: 'Belum Hadir',
        masa_checkin: null,
      },
      {
        nama_peserta: 'Wan Nur Syafiqah binti Wan Azman',
        emel: 'syafiqah.azman@upm.edu.my',
        organisasi_atau_fakulti: 'Fakulti Kejuruteraan, UPM',
        status_hadir: 'Belum Hadir',
        masa_checkin: null,
      },
      {
        nama_peserta: 'Arvind Kumar a/l Rajan',
        emel: 'arvind.rajan@tm.com.my',
        organisasi_atau_fakulti: 'TM One Enterprise Solutions',
        status_hadir: 'Belum Hadir',
        masa_checkin: null,
      },
      {
        nama_peserta: 'Dayang Nurul Izzah binti Abang Yusof',
        emel: 'izzah.yusof@unimas.my',
        organisasi_atau_fakulti: 'Fakulti Sains Kognitif & Pembangunan Manusia, UNIMAS',
        status_hadir: 'Belum Hadir',
        masa_checkin: null,
      },
    ],
  });

  console.log('Seeded 10 Malaysian event participants successfully.');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
