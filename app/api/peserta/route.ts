import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { EMAIL_REGEX, isValidStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const peserta = await prisma.peserta.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return NextResponse.json({ data: peserta }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Gagal memuat turun senarai peserta.');
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Format JSON tidak sah.' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Data permintaan tidak sah.' },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const nama_peserta =
      typeof payload.nama_peserta === 'string'
        ? payload.nama_peserta.trim()
        : '';
    const emel =
      typeof payload.emel === 'string' ? payload.emel.trim().toLowerCase() : '';
    const organisasi_atau_fakulti =
      typeof payload.organisasi_atau_fakulti === 'string'
        ? payload.organisasi_atau_fakulti.trim()
        : '';

    if (!nama_peserta || nama_peserta.length < 2 || nama_peserta.length > 120) {
      return NextResponse.json(
        { error: 'Nama peserta wajib diisi (2 hingga 120 aksara).' },
        { status: 400 }
      );
    }

    if (!emel || !EMAIL_REGEX.test(emel) || emel.length > 160) {
      return NextResponse.json(
        { error: 'Sila masukkan alamat emel yang sah.' },
        { status: 400 }
      );
    }

    if (
      !organisasi_atau_fakulti ||
      organisasi_atau_fakulti.length < 2 ||
      organisasi_atau_fakulti.length > 160
    ) {
      return NextResponse.json(
        { error: 'Organisasi atau fakulti wajib diisi (2 hingga 160 aksara).' },
        { status: 400 }
      );
    }

    let status_hadir = 'Belum Hadir';
    if (payload.status_hadir !== undefined) {
      if (!isValidStatus(payload.status_hadir)) {
        return NextResponse.json(
          {
            error:
              'Status hadir tidak sah. Gunakan "Belum Hadir" atau "Sudah Daftar Masuk".',
          },
          { status: 400 }
        );
      }
      status_hadir = payload.status_hadir;
    }

    const masa_checkin =
      status_hadir === 'Sudah Daftar Masuk' ? new Date() : null;

    const created = await prisma.peserta.create({
      data: {
        nama_peserta,
        emel,
        organisasi_atau_fakulti,
        status_hadir,
        masa_checkin,
      },
    });

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'Gagal mendaftarkan peserta baharu.');
  }
}
