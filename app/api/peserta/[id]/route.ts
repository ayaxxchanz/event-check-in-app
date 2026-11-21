import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { EMAIL_REGEX, isValidStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parsePositiveId(rawId: string): number | null {
  if (!/^\d+$/.test(rawId)) return null;
  const parsed = Number.parseInt(rawId, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = parsePositiveId(id);

    if (numericId === null) {
      return NextResponse.json(
        { error: 'ID peserta tidak sah.' },
        { status: 400 }
      );
    }

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
        { error: 'Data kemaskini tidak sah.' },
        { status: 400 }
      );
    }

    const existing = await prisma.peserta.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Rekod peserta tidak dijumpai.' },
        { status: 404 }
      );
    }

    const payload = body as Record<string, unknown>;
    const updateData: {
      nama_peserta?: string;
      emel?: string;
      organisasi_atau_fakulti?: string;
      status_hadir?: string;
      masa_checkin?: Date | null;
    } = {};

    if (payload.nama_peserta !== undefined) {
      if (typeof payload.nama_peserta !== 'string') {
        return NextResponse.json(
          { error: 'Nama peserta mesti berupa teks.' },
          { status: 400 }
        );
      }
      const trimmedName = payload.nama_peserta.trim();
      if (trimmedName.length < 2 || trimmedName.length > 120) {
        return NextResponse.json(
          { error: 'Nama peserta wajib diisi (2 hingga 120 aksara).' },
          { status: 400 }
        );
      }
      updateData.nama_peserta = trimmedName;
    }

    if (payload.emel !== undefined) {
      if (typeof payload.emel !== 'string') {
        return NextResponse.json(
          { error: 'Emel mesti berupa teks.' },
          { status: 400 }
        );
      }
      const normalizedEmail = payload.emel.trim().toLowerCase();
      if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.length > 160) {
        return NextResponse.json(
          { error: 'Sila masukkan alamat emel yang sah.' },
          { status: 400 }
        );
      }
      updateData.emel = normalizedEmail;
    }

    if (payload.organisasi_atau_fakulti !== undefined) {
      if (typeof payload.organisasi_atau_fakulti !== 'string') {
        return NextResponse.json(
          { error: 'Organisasi atau fakulti mesti berupa teks.' },
          { status: 400 }
        );
      }
      const trimmedOrg = payload.organisasi_atau_fakulti.trim();
      if (trimmedOrg.length < 2 || trimmedOrg.length > 160) {
        return NextResponse.json(
          {
            error:
              'Organisasi atau fakulti wajib diisi (2 hingga 160 aksara).',
          },
          { status: 400 }
        );
      }
      updateData.organisasi_atau_fakulti = trimmedOrg;
    }

    if (payload.action === 'checkin') {
      updateData.status_hadir = 'Sudah Daftar Masuk';
      updateData.masa_checkin = new Date();
    } else if (payload.action === 'reset') {
      updateData.status_hadir = 'Belum Hadir';
      updateData.masa_checkin = null;
    } else if (payload.status_hadir !== undefined) {
      if (!isValidStatus(payload.status_hadir)) {
        return NextResponse.json(
          {
            error:
              'Status hadir tidak sah. Gunakan "Belum Hadir" atau "Sudah Daftar Masuk".',
          },
          { status: 400 }
        );
      }
      updateData.status_hadir = payload.status_hadir;
      if (payload.status_hadir === 'Sudah Daftar Masuk') {
        updateData.masa_checkin =
          existing.status_hadir === 'Sudah Daftar Masuk' &&
          existing.masa_checkin
            ? existing.masa_checkin
            : new Date();
      } else {
        updateData.masa_checkin = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Tiada medan sah dihantar untuk dikemaskini.' },
        { status: 400 }
      );
    }

    const updated = await prisma.peserta.update({
      where: { id: numericId },
      data: updateData,
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Gagal mengemaskini rekod peserta.');
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = parsePositiveId(id);

    if (numericId === null) {
      return NextResponse.json(
        { error: 'ID peserta tidak sah.' },
        { status: 400 }
      );
    }

    await prisma.peserta.delete({
      where: { id: numericId },
    });

    return NextResponse.json(
      { message: 'Rekod peserta berjaya dipadam.', id: numericId },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'Gagal memadam rekod peserta.');
  }
}
