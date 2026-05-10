// Email Templates untuk SendGrid - Sistem Notifikasi Antrian
// Semua template di-optimize untuk responsive design dan semua email clients

export const emailTemplates = {
  // 1. Queue Joined - Ketika user ambil nomor antrian
  queueJoined: (data: {
    userName: string;
    queueName: string;
    queueNumber: string;
    estimatedWaitTime: string;
    position: number;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 20px; }
    .status-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .status-box h2 { color: #667eea; font-size: 18px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 20px; font-weight: bold; color: #333; }
    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Antrian Berhasil Diambil</h1>
      <p>Nomor antrian Anda telah terdaftar</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <p>Terima kasih telah mengambil nomor antrian. Berikut adalah detail antrian Anda:</p>
      <div class="status-box">
        <h2>Nomor Antrian: <strong>${data.queueNumber}</strong></h2>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Layanan</div>
          <div class="info-value">${data.queueName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Posisi</div>
          <div class="info-value">#${data.position}</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Estimasi Waktu</div>
          <div class="info-value">${data.estimatedWaitTime} menit</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value" style="color: #667eea;">Menunggu</div>
        </div>
      </div>
      <p style="margin-top: 20px; color: #666;">Anda akan menerima notifikasi berikutnya ketika nomor Anda dipanggil. Terima kasih atas kesabaran Anda.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,

  // 2. Queue Serving Soon - Ketika antrian akan segera dipanggil
  queueServingSoon: (data: {
    userName: string;
    queueNumber: string;
    queueName: string;
    windowNumber: string;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff3cd; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .alert-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; color: #92400e; }
    .alert-box h2 { font-size: 18px; margin-bottom: 10px; }
    .content { padding: 40px 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 20px; font-weight: bold; color: #333; }
    .countdown { font-size: 14px; color: #d97706; font-weight: bold; margin: 15px 0; }
    .button { display: inline-block; background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Perhatian!</h1>
      <p>Antrian Anda akan segera dipanggil</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="alert-box">
        <h2>Nomor Anda akan segera dipanggil!</h2>
        <p>Bersiaplah untuk dilayani. Nomor Anda akan dipanggil dalam waktu singkat.</p>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nomor Antrian</div>
          <div class="info-value">${data.queueNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Layanan</div>
          <div class="info-value">${data.queueName}</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Loket/Window</div>
          <div class="info-value">${data.windowNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value" style="color: #f59e0b;">Segera Dipanggil</div>
        </div>
      </div>
      <p class="countdown">⏱️ Mohon segera datang ke loket yang ditunjukkan.</p>
      <p style="margin-top: 20px; color: #666;">Jangan sampai ketinggalan! Pastikan Anda berada di lokasi untuk menerima layanan.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,

  // 3. Queue Now Serving - Ketika antrian sedang dipanggil/dilayani
  queueNowServing: (data: {
    userName: string;
    queueNumber: string;
    queueName: string;
    windowNumber: string;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #d1fae5; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .success-box h2 { color: #059669; font-size: 18px; margin-bottom: 10px; }
    .content { padding: 40px 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 20px; font-weight: bold; color: #333; }
    .instruction { background-color: #ecfdf5; border-radius: 4px; padding: 15px; margin: 15px 0; color: #065f46; }
    .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Antrian Anda Dipanggil</h1>
      <p>Segera datang ke loket</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="success-box">
        <h2>Nomor Anda sedang dilayani!</h2>
        <p>Harap segera datang ke loket yang ditunjukkan di bawah ini.</p>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nomor Antrian</div>
          <div class="info-value">${data.queueNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Loket/Window</div>
          <div class="info-value" style="color: #10b981; font-size: 24px;">${data.windowNumber}</div>
        </div>
      </div>
      <div class="instruction">
        <strong>📍 Instruksi:</strong>
        <p>Segera datang ke Loket ${data.windowNumber} untuk menerima layanan ${data.queueName}.</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Email ini dikirim otomatis. Jika Anda tidak datang dalam 5 menit, nomor Anda mungkin akan dipanggil ulang.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,

  // 4. Queue Completed - Ketika pelayanan selesai
  queueCompleted: (data: {
    userName: string;
    queueNumber: string;
    queueName: string;
    duration: string;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 20px; }
    .complete-box { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .complete-box h2 { color: #1d4ed8; font-size: 18px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 20px; font-weight: bold; color: #333; }
    .feedback-box { background-color: #f0f9ff; border-radius: 4px; padding: 15px; margin: 15px 0; }
    .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Pelayanan Selesai</h1>
      <p>Terima kasih telah menggunakan layanan kami</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="complete-box">
        <h2>Pelayanan Anda telah selesai</h2>
        <p>Kami berharap Anda puas dengan layanan yang diberikan.</p>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nomor Antrian</div>
          <div class="info-value">${data.queueNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Jenis Layanan</div>
          <div class="info-value">${data.queueName}</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Waktu Pelayanan</div>
          <div class="info-value">${data.duration}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value" style="color: #3b82f6;">Selesai</div>
        </div>
      </div>
      <div class="feedback-box">
        <p><strong>Berikan Rating:</strong> Bagikan pengalaman Anda agar kami terus meningkatkan layanan.</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Terima kasih telah mempercayai layanan kami. Sampai jumpa lagi!</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,

  // 5. Queue Cancelled - Ketika antrian dibatalkan
  queueCancelled: (data: {
    userName: string;
    queueNumber: string;
    queueName: string;
    reason: string;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fee2e2; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 20px; }
    .cancel-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .cancel-box h2 { color: #dc2626; font-size: 18px; margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 20px; font-weight: bold; color: #333; }
    .reason-box { background-color: #fef2f2; border-radius: 4px; padding: 15px; margin: 15px 0; border-left: 3px solid #ef4444; }
    .button { display: inline-block; background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✕ Antrian Dibatalkan</h1>
      <p>Nomor antrian Anda telah dihapus</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="cancel-box">
        <h2>Antrian Anda telah dibatalkan</h2>
        <p>Nomor antrian Anda tidak lagi dalam sistem.</p>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nomor Antrian</div>
          <div class="info-value">${data.queueNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Layanan</div>
          <div class="info-value">${data.queueName}</div>
        </div>
      </div>
      <div class="reason-box">
        <strong>Alasan Pembatalan:</strong>
        <p>${data.reason}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Jika Anda ingin kembali mengambil antrian, silakan kunjungi kembali sistem kami atau hubungi layanan pelanggan.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,

  // 6. Queue Position Update - Update posisi antrian
  queuePositionUpdate: (data: {
    userName: string;
    queueNumber: string;
    queueName: string;
    position: number;
    estimatedTime: string;
  }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 20px; }
    .update-box { background-color: #ede9fe; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .update-box h2 { color: #7c3aed; font-size: 18px; margin-bottom: 10px; }
    .progress-bar { height: 8px; background-color: #e5e7eb; border-radius: 10px; margin: 15px 0; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #7c3aed); width: 45%; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .info-item { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .info-label { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 20px; font-weight: bold; color: #333; }
    .button { display: inline-block; background-color: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Update Posisi Antrian</h1>
      <p>Posisi Anda dalam antrian telah diperbarui</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="update-box">
        <h2>Posisi Antrian: #${data.position}</h2>
        <p>Posisi Anda telah berubah. Cek estimasi waktu di bawah ini.</p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nomor Antrian</div>
          <div class="info-value">${data.queueNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Posisi Saat Ini</div>
          <div class="info-value">#${data.position}</div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Layanan</div>
          <div class="info-value">${data.queueName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Estimasi Waktu</div>
          <div class="info-value">${data.estimatedTime} menit</div>
        </div>
      </div>
      <p style="margin-top: 20px; color: #666;">Bersiaplah untuk menerima notifikasi ketika antrian Anda akan segera dipanggil.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,

  // 7. System Announcement - Pengumuman sistem
  systemAnnouncement: (data: {
    userName: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'maintenance';
  }) => {
    const typeConfig = {
      info: { color: '#3b82f6', bg: '#dbeafe', icon: 'ℹ️' },
      warning: { color: '#f59e0b', bg: '#fef3c7', icon: '⚠️' },
      maintenance: { color: '#ef4444', bg: '#fee2e2', icon: '🔧' },
    };
    const config = typeConfig[data.type];

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, ${config.color}, ${config.color}); color: white; padding: 40px 20px; text-align: center; opacity: 0.95; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .content { padding: 40px 20px; }
    .announcement-box { background-color: ${config.bg}; border-left: 4px solid ${config.color}; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .announcement-box h2 { color: ${config.color}; font-size: 18px; margin-bottom: 10px; }
    .button { display: inline-block; background-color: ${config.color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${config.icon} ${data.title}</h1>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="announcement-box">
        <h2>${data.title}</h2>
        <p>${data.message}</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Terima kasih atas perhatian Anda. Untuk informasi lebih lanjut, silakan hubungi layanan pelanggan kami.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
    `;
  },

  // 8. Test Email - Untuk testing
  testEmail: (data: { userName: string }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .content { padding: 40px 20px; text-align: center; }
    .test-box { background-color: #f0f9ff; border: 2px dashed #667eea; padding: 30px; margin: 20px 0; border-radius: 4px; }
    .test-box h2 { color: #667eea; font-size: 20px; margin-bottom: 10px; }
    .status { display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 20px; margin: 10px 0; font-weight: bold; }
    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Email Test Berhasil</h1>
      <p>Sistem notifikasi email kami berfungsi dengan baik</p>
    </div>
    <div class="content">
      <p>Halo <strong>${data.userName}</strong>,</p>
      <div class="test-box">
        <h2>Selamat! Email Testing Berhasil</h2>
        <div class="status">✓ Sistem Online</div>
        <p style="margin-top: 15px;">Email ini dikirim untuk memverifikasi bahwa sistem notifikasi email kami bekerja dengan sempurna.</p>
      </div>
      <p style="margin-top: 20px; color: #666;">Jika Anda menerima email ini, berarti sistem notifikasi antrian Anda sudah siap digunakan.</p>
    </div>
    <div class="footer">
      <p>© 2026 Sistem Antrian Management. Jangan reply email ini.</p>
    </div>
  </div>
</body>
</html>
  `,
};
