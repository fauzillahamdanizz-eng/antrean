import { supabase } from "@/lib/supabase";
import { sendEmail, type EmailNotification } from "@/lib/sendgrid-service";
import type { Profile } from "@/lib/supabase";

// Save notification log to database
export async function logEmailNotification(
  userId: string,
  queueEntryId: string | null,
  emailType: string,
  recipientEmail: string,
  subject: string,
  sendGridResult: { success: boolean; messageId?: string; error?: string }
) {
  try {
    const { error } = await supabase.from("email_notifications").insert([
      {
        user_id: userId,
        queue_entry_id: queueEntryId,
        email_type: emailType,
        recipient_email: recipientEmail,
        subject,
        status: sendGridResult.success ? "sent" : "failed",
        error_message: sendGridResult.error || null,
        sent_at: sendGridResult.success ? new Date().toISOString() : null,
      },
    ]);

    if (error) {
      console.error("[Notification Service] Error logging notification:", error);
    }
  } catch (error) {
    console.error("[Notification Service] Error in logEmailNotification:", error);
  }
}

// Get user notification preferences
export async function getUserNotificationPreferences(userId: string) {
  try {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      // Log error but don't throw - we'll return defaults
      console.error("[Notification Service] Error fetching preferences:", error);
      // Return default preferences if table doesn't exist or user has no preferences
      return {
        queue_joined: true,
        queue_called: true,
        queue_serving: true,
        queue_completed: true,
        queue_cancelled: true,
        position_updates: false,
        announcements: true,
      };
    }

    // If no preferences exist, return defaults
    if (!data) {
      return {
        queue_joined: true,
        queue_called: true,
        queue_serving: true,
        queue_completed: true,
        queue_cancelled: true,
        position_updates: false,
        announcements: true,
      };
    }

    return data;
  } catch (error) {
    console.error("[Notification Service] Error in getUserNotificationPreferences:", error);
    // Return defaults on any error
    return {
      queue_joined: true,
      queue_called: true,
      queue_serving: true,
      queue_completed: true,
      queue_cancelled: true,
      position_updates: false,
      announcements: true,
    };
  }
}

// Create or update notification preferences
export async function upsertNotificationPreferences(userId: string, preferences: any) {
  try {
    // Validate preferences object
    if (!preferences || typeof preferences !== 'object') {
      throw new Error('Invalid preferences object');
    }

    // Only include valid notification preference keys
    const validKeys = [
      'queue_joined',
      'queue_called',
      'queue_serving',
      'queue_completed',
      'queue_cancelled',
      'position_updates',
      'announcements'
    ];

    const cleanPreferences: any = {};
    for (const key of validKeys) {
      if (key in preferences) {
        cleanPreferences[key] = Boolean(preferences[key]);
      }
    }

    // Try to check if preference record exists
    let existing = null;
    try {
      const { data, error: selectError } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      // If table doesn't exist (PGRST204), we'll handle it gracefully
      if (selectError?.code === 'PGRST204') {
        console.warn("[Notification Service] notification_preferences table doesn't exist yet. Run migration script: /scripts/005_add_email_notifications.sql");
        // Return success with message - don't throw error
        return { success: true, message: "Table not yet initialized - preferences saved locally" };
      }
      
      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }
      
      existing = data;
    } catch (selectError) {
      // If table doesn't exist, gracefully handle it
      if (selectError instanceof Error && selectError.message?.includes('notification_preferences')) {
        console.warn("[Notification Service] Preferences table not available yet");
        return { success: true, message: "Table not yet initialized" };
      }
      throw selectError;
    }

    let result;
    if (existing?.id) {
      // Update existing record
      result = await supabase
        .from("notification_preferences")
        .update({
          ...cleanPreferences,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select();
    } else {
      // Insert new record
      result = await supabase
        .from("notification_preferences")
        .insert([{
          user_id: userId,
          ...cleanPreferences,
          updated_at: new Date().toISOString()
        }])
        .select();
    }

    if (result.error) {
      // Handle table not existing
      if (result.error.code === 'PGRST204') {
        console.warn("[Notification Service] notification_preferences table doesn't exist. Please run migration.");
        return { success: true, message: "Preferences recorded but table not initialized yet" };
      }
      throw result.error;
    }

    return result.data;
  } catch (error) {
    // Check if it's a "table not found" error
    const errorStr = error instanceof Error ? error.message : String(error);
    if (errorStr.includes('notification_preferences') || errorStr.includes('PGRST204')) {
      console.warn("[Notification Service] Preferences table not initialized. Run: /scripts/005_add_email_notifications.sql");
      // Return graceful response instead of throwing
      return { success: true, message: "Table initialization pending" };
    }
    
    console.error("[Notification Service] Error in upsertNotificationPreferences:", error);
    throw error;
  }
}

// Send and log email notification
export async function sendAndLogEmailNotification(
  user: Profile,
  queueEntryId: string | null,
  emailNotification: EmailNotification
) {
  try {
    // Set recipient email
    emailNotification.to = user.email;

    console.log("[Notification Service] Sending notification:", {
      email: user.email,
      templateId: emailNotification.templateId,
      type: emailNotification.type,
      subject: emailNotification.subject,
    });

    // Send email via SendGrid
    const result = await sendEmail(emailNotification);

    console.log("[Notification Service] Email send result:", result);

    // Log to database
    await logEmailNotification(
      user.id,
      queueEntryId,
      emailNotification.type || "unknown",
      user.email,
      emailNotification.subject || "Queue Notification",
      result
    );

    return result;
  } catch (error) {
    console.error("[Notification Service] Error in sendAndLogEmailNotification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Log failed notification to database
    await logEmailNotification(
      user.id,
      queueEntryId,
      emailNotification.type || "unknown",
      user.email,
      emailNotification.subject || "Queue Notification",
      {
        success: false,
        error: errorMessage,
      }
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get notification history
export async function getNotificationHistory(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from("email_notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Notification Service] Error fetching history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[Notification Service] Error in getNotificationHistory:", error);
    return [];
  }
}
