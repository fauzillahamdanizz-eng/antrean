import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email-templates-html';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');

    if (!template) {
      return NextResponse.json({
        error: 'Template parameter is required',
        available: [
          'queueJoined',
          'queueServingSoon',
          'queueNowServing',
          'queueCompleted',
          'queueCancelled',
          'queuePositionUpdate',
          'systemAnnouncement',
          'testEmail',
        ],
      });
    }

    // Mock data untuk preview
    const mockDataMap: Record<string, any> = {
      queueJoined: {
        userName: 'Budi Santoso',
        queueName: 'Konsultasi Hukum',
        queueNumber: 'A-001',
        estimatedWaitTime: '15',
        position: 5,
      },
      queueServingSoon: {
        userName: 'Budi Santoso',
        queueNumber: 'A-001',
        queueName: 'Konsultasi Hukum',
        windowNumber: '3',
      },
      queueNowServing: {
        userName: 'Budi Santoso',
        queueNumber: 'A-001',
        queueName: 'Konsultasi Hukum',
        windowNumber: '3',
      },
      queueCompleted: {
        userName: 'Budi Santoso',
        queueNumber: 'A-001',
        queueName: 'Konsultasi Hukum',
        duration: '15 menit',
      },
      queueCancelled: {
        userName: 'Budi Santoso',
        queueNumber: 'A-001',
        queueName: 'Konsultasi Hukum',
        reason: 'Dibatalkan oleh pengguna',
      },
      queuePositionUpdate: {
        userName: 'Budi Santoso',
        queueNumber: 'A-001',
        queueName: 'Konsultasi Hukum',
        position: 3,
        estimatedTime: '10',
      },
      systemAnnouncement: {
        userName: 'Budi Santoso',
        title: 'Pemeliharaan Sistem',
        message:
          'Sistem antrian akan diputus pada tanggal 25 Januari 2026 pukul 22:00-23:00 WIB untuk pemeliharaan. Mohon maaf atas ketidaknyamanannya.',
        type: 'maintenance',
      },
      testEmail: {
        userName: 'Budi Santoso',
      },
    };

    const mockData = mockDataMap[template];

    if (!mockData) {
      return NextResponse.json({ error: `Template '${template}' not found` }, { status: 404 });
    }

    let html;
    if (template === 'systemAnnouncement') {
      html = emailTemplates.systemAnnouncement(mockData);
    } else {
      html = (emailTemplates as any)[template](mockData);
    }

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
