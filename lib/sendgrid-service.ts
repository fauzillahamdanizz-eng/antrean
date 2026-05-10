// SendGrid Template Functions - Using SendGrid Dynamic Templates
// This service generates the email objects that will be sent via SendGrid API

export interface EmailNotification {
  to: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
  subject?: string;
  type?: string;
}

// Generate Queue Joined Email
export function generateQueueJoinedEmail(
  userName: string,
  queueName: string,
  queueNumber: string,
  estimatedWaitTime?: string,
  position?: number
): EmailNotification {
  return {
    to: "",
    templateId: process.env.SENDGRID_TEMPLATE_ID_QUEUE_JOINED?.trim() || "d-queue-joined",
    dynamicTemplateData: {
      userName,
      queueName,
      queueNumber,
      estimatedWaitTime: estimatedWaitTime || "15",
      position: position || 1,
      timestamp: new Date().toLocaleString("id-ID"),
    },
    subject: `✓ Antrian Berhasil Diambil - Nomor ${queueNumber}`,
    type: "queue_joined",
  };
}

// Generate Queue Called Email (Segera Dipanggil)
export function generateQueueCalledEmail(
  userName: string,
  queueName: string,
  queueNumber: string,
  windowNumber?: string
): EmailNotification {
  return {
    to: "",
    templateId: process.env.SENDGRID_TEMPLATE_ID_QUEUE_CALLED?.trim() || "d-queue-called",
    dynamicTemplateData: {
      userName,
      queueName,
      queueNumber,
      windowNumber: windowNumber || "1",
      timestamp: new Date().toLocaleString("id-ID"),
    },
    subject: `⚠️ Antrian Anda Akan Segera Dipanggil - Nomor ${queueNumber}`,
    type: "queue_called",
  };
}

// Generate Queue Serving Email (Sedang Dilayani atau Segera Dipanggil)
export function generateQueueServingEmail(
  userName: string,
  queueName: string,
  queueNumber: string,
  windowNumber?: string,
  isNextInQueue: boolean = false
): EmailNotification {
  // Use DIFFERENT template IDs based on whether customer is next or being served
  // TRIM spaces from env variables to avoid SendGrid errors
  const templateId = isNextInQueue
    ? process.env.SENDGRID_TEMPLATE_ID_QUEUE_SERVING_SOON?.trim()
    : process.env.SENDGRID_TEMPLATE_ID_QUEUE_NOW_SERVING?.trim();
  
  console.log("[SendGrid Service] generateQueueServingEmail - Template ID:", templateId, "isNextInQueue:", isNextInQueue, "Using:", isNextInQueue ? "QUEUE_SERVING_SOON" : "QUEUE_NOW_SERVING");
  
  // Different subject based on whether customer is next or being served
  const subject = isNextInQueue 
    ? `⏳ Nomor ${queueNumber} - Antrian Anda Akan Segera Dipanggil`
    : `✓ Nomor ${queueNumber} - Antrian Anda Sedang Dilayani`;

  return {
    to: "",
    templateId: templateId || (isNextInQueue ? "d-queue-serving-soon" : "d-queue-now-serving"),
    dynamicTemplateData: {
      userName,
      queueName,
      queueNumber,
      windowNumber: windowNumber || "1",
      timestamp: new Date().toLocaleString("id-ID"),
      isNextInQueue: isNextInQueue,
    },
    subject: subject,
    type: "queue_serving",
  };
}

// Generate Queue Completed Email
export function generateQueueCompletedEmail(
  userName: string,
  queueName: string,
  queueNumber: string,
  duration?: string
): EmailNotification {
  const templateId = process.env.SENDGRID_TEMPLATE_ID_QUEUE_COMPLETED?.trim();
  console.log("[SendGrid Service] generateQueueCompletedEmail - Template ID:", templateId);
  
  return {
    to: "",
    templateId: templateId || "d-queue-completed",
    dynamicTemplateData: {
      userName,
      queueName,
      queueNumber,
      duration: duration || "5 menit",
      timestamp: new Date().toLocaleString("id-ID"),
    },
    subject: `✓ Pelayanan Selesai - Nomor ${queueNumber}`,
    type: "queue_completed",
  };
}

// Generate Queue Cancelled Email
export function generateQueueCancelledEmail(
  userName: string,
  queueName: string,
  queueNumber: string,
  reason?: string
): EmailNotification {
  return {
    to: "",
    templateId: process.env.SENDGRID_TEMPLATE_ID_QUEUE_CANCELLED?.trim() || "d-queue-cancelled",
    dynamicTemplateData: {
      userName,
      queueName,
      queueNumber,
      reason: reason || "Dibatalkan oleh pengguna",
      timestamp: new Date().toLocaleString("id-ID"),
    },
    subject: `✕ Antrian Dibatalkan - Nomor ${queueNumber}`,
    type: "queue_cancelled",
  };
}

// Generate Position Update Email
export function generatePositionUpdateEmail(
  userName: string,
  queueName: string,
  queueNumber: string,
  currentPosition: string,
  estimatedMinutes: number
): EmailNotification {
  return {
    to: "",
    templateId: process.env.SENDGRID_TEMPLATE_ID_POSITION_UPDATE?.trim() || "d-position-update",
    dynamicTemplateData: {
      userName,
      queueName,
      queueNumber,
      currentPosition,
      estimatedMinutes,
      timestamp: new Date().toLocaleString("id-ID"),
    },
    subject: `📊 Update Posisi Antrian - Nomor ${queueNumber}`,
    type: "position_update",
  };
}

// Send Email via SendGrid API
export async function sendEmail(notification: EmailNotification) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@queuemanagement.com";

  // Check if API key is configured
  if (!apiKey) {
    console.error("[SendGrid Service] SENDGRID_API_KEY not configured - email sending will fail in production");
    console.error("[SendGrid Service] Instructions: Set SENDGRID_API_KEY in Vercel environment variables");
    
    // In development, log the email details for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("[SendGrid Service] [DEV MODE] Would send email:");
      console.log("  To:", notification.to);
      console.log("  Template:", notification.templateId);
      console.log("  Subject:", notification.subject);
      return {
        success: true,
        messageId: "dev-" + Date.now(),
        message: "Email logged in development mode",
      };
    }
    
    return {
      success: false,
      error: "SENDGRID_API_KEY not configured. Please set it in Vercel environment variables.",
    };
  }

  if (!notification.to) {
    return {
      success: false,
      error: "Recipient email (to) is required",
    };
  }

  if (!notification.templateId) {
    console.error("[SendGrid Service] Template ID is missing!");
    console.error("[SendGrid Service] Check if env var is set:", {
      SENDGRID_TEMPLATE_ID_QUEUE_JOINED: !!process.env.SENDGRID_TEMPLATE_ID_QUEUE_JOINED,
      SENDGRID_TEMPLATE_ID_QUEUE_CALLED: !!process.env.SENDGRID_TEMPLATE_ID_QUEUE_CALLED,
      SENDGRID_TEMPLATE_ID_QUEUE_SERVING_SOON: !!process.env.SENDGRID_TEMPLATE_ID_QUEUE_SERVING_SOON,
      SENDGRID_TEMPLATE_ID_QUEUE_NOW_SERVING: !!process.env.SENDGRID_TEMPLATE_ID_QUEUE_NOW_SERVING,
      SENDGRID_TEMPLATE_ID_QUEUE_COMPLETED: !!process.env.SENDGRID_TEMPLATE_ID_QUEUE_COMPLETED,
      SENDGRID_TEMPLATE_ID_QUEUE_CANCELLED: !!process.env.SENDGRID_TEMPLATE_ID_QUEUE_CANCELLED,
      SENDGRID_TEMPLATE_ID_POSITION_UPDATE: !!process.env.SENDGRID_TEMPLATE_ID_POSITION_UPDATE,
      SENDGRID_TEMPLATE_ID_ANNOUNCEMENT: !!process.env.SENDGRID_TEMPLATE_ID_ANNOUNCEMENT,
    });
    return {
      success: false,
      error: "Template ID is required",
    };
  }

  try {
    console.log("[SendGrid Service] Sending email to:", notification.to);
    console.log("[SendGrid Service] Template ID:", notification.templateId);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: notification.to }],
            dynamic_template_data: notification.dynamicTemplateData,
          },
        ],
        from: { email: fromEmail },
        template_id: notification.templateId,
      }),
    });

    console.log("[SendGrid Service] Response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[SendGrid Service] SendGrid API error:", error);
      return {
        success: false,
        error: `SendGrid error (${response.status}): ${JSON.stringify(error)}`,
      };
    }

    const messageId = response.headers.get("x-message-id");
    console.log("[SendGrid Service] Email sent successfully. Message ID:", messageId);

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    console.error("[SendGrid Service] Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
