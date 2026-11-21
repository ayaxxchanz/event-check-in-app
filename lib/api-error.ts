import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export function handleApiError(error: unknown, fallbackMessage: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Rekod peserta tidak dijumpai.' },
        { status: 404 }
      );
    }
    if (error.code === 'P2021') {
      return NextResponse.json(
        {
          error:
            'Jadual pangkalan data belum dicipta. Sila jalankan `npx prisma db push`.',
        },
        { status: 503 }
      );
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        error:
          'Tidak dapat menyambung ke pangkalan data PostgreSQL. Sila semak pemboleh ubah DATABASE_URL.',
      },
      { status: 503 }
    );
  }

  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
