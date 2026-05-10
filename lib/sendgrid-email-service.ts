import { emailTemplates } from './email-templates-html';

interface SendGridEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Function untuk mengirim email melalui SendGrid
export async function sendEmail(options: SendGridEmailOptions) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@queuemanagement.com';

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SendGrid error: ${JSON.stringify(error)}`);
    }

    return { success: true, messageId: response.headers.get('x-message-id') };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email notification functions untuk berbagai event
export async function sendQueueJoinedEmail(data: {
  to: string;
  userName: string;
  queueName: string;
  queueNumber: string;
  estimatedWaitTime: string;
  position: number;
}) {
  const html = emailTemplates.queueJoined(data);
  return sendEmail({
    to: data.to,
    subject: `✓ Antrian Berhasil Diambil - Nomor ${data.queueNumber}`,
    html,
  });
}

export async function sendQueueServingSoonEmail(data: {
  to: string;
  userName: string;
  queueNumber: string;
  queueName: string;
  windowNumber: string;
}) {
  const html = emailTemplates.queueServingSoon(data);
  return sendEmail({
    to: data.to,
    subject: `⚠️ Antrian Anda Akan Segera Dipanggil - Nomor ${data.queueNumber}`,
    html,
  });
}

export async function sendQueueNowServingEmail(data: {
  to: string;
  userName: string;
  queueNumber: string;
  queueName: string;
  windowNumber: string;
}) {
  const html = emailTemplates.queueNowServing(data);
  return sendEmail({
    to: data.to,
    subject: `✓ Antrian Anda Dipanggil - Loket ${data.windowNumber}`,
    html,
  });
}

export async function sendQueueCompletedEmail(data: {
  to: string;
  userName: string;
  queueNumber: string;
  queueName: string;
  duration: string;
}) {
  const html = emailTemplates.queueCompleted(data);
  return sendEmail({
    to: data.to,
    subject: `✓ Pelayanan Selesai - Nomor ${data.queueNumber}`,
    html,
  });
}

export async function sendQueueCancelledEmail(data: {
  to: string;
  userName: string;
  queueNumber: string;
  queueName: string;
  reason: string;
}) {
  const html = emailTemplates.queueCancelled(data);
  return sendEmail({
    to: data.to,
    subject: `✕ Antrian Dibatalkan - Nomor ${data.queueNumber}`,
    html,
  });
}

export async function sendQueuePositionUpdateEmail(data: {
  to: string;
  userName: string;
  queueNumber: string;
  queueName: string;
  position: number;
  estimatedTime: string;
}) {
  const html = emailTemplates.queuePositionUpdate(data);
  return sendEmail({
    to: data.to,
    subject: `📊 Update Posisi Antrian - Nomor ${data.queueNumber}`,
    html,
  });
}

export async function sendSystemAnnouncementEmail(data: {
  to: string;
  userName: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance';
}) {
  const html = emailTemplates.systemAnnouncement(data);
  const prefix = data.type === 'warning' ? '⚠️' : data.type === 'maintenance' ? '🔧' : 'ℹ️';
  return sendEmail({
    to: data.to,
    subject: `${prefix} ${data.title}`,
    html,
  });
}

export async function sendTestEmail(data: { to: string; userName: string }) {
  const html = emailTemplates.testEmail(data);
  return sendEmail({
    to: data.to,
    subject: '✓ Email Test Berhasil - Sistem Antrian',
    html,
  });
}
