import { NextRequest, NextResponse } from 'next/server';
import {
  generateQueueJoinedEmail,
  generateQueueServingEmail,
  generateQueueCompletedEmail,
  generateQueueCancelledEmail,
  generatePositionUpdateEmail,
  generateQueueCalledEmail,
} from '@/lib/sendgrid-service';
import {
  sendAndLogEmailNotification,
  getUserNotificationPreferences,
} from '@/lib/notification-service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, userId, queueEntryId, queueId, queueName, queueNumber, windowNumber, reason, announcementTitle, announcementContent, isNextInQueue } = body;

    console.log("[v0] POST /api/notifications/send - eventType:", eventType, "userId:", userId, "isNextInQueue:", isNextInQueue);

    // Validate required fields
    if (!eventType || !userId) {
      console.error("[v0] Missing required fields: eventType or userId");
      return NextResponse.json(
        { error: 'Missing required fields: eventType and userId' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error("[v0] User not found for userId:", userId, "Error:", userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log("[v0] User email:", user.email);

    // Get user notification preferences
    const preferences = await getUserNotificationPreferences(userId);

    // Check if user has enabled this notification type
    let isNotificationEnabled = true;
    switch (eventType) {
      case 'queue_joined':
        isNotificationEnabled = preferences?.queue_joined !== false;
        break;
      case 'queue_called':
        isNotificationEnabled = preferences?.queue_called !== false;
        break;
      case 'queue_serving':
        isNotificationEnabled = preferences?.queue_serving !== false;
        break;
      case 'queue_completed':
        isNotificationEnabled = preferences?.queue_completed !== false;
        break;
      case 'queue_cancelled':
        isNotificationEnabled = preferences?.queue_cancelled !== false;
        break;
      case 'position_update':
        isNotificationEnabled = preferences?.position_updates !== false;
        break;
    }

    console.log("[v0] Notification enabled for", eventType, ":", isNotificationEnabled);

    if (!isNotificationEnabled) {
      console.log("[v0] Notification disabled by user preferences for", eventType);
      return NextResponse.json(
        { message: 'Notification disabled by user preferences' },
        { status: 200 }
      );
    }

    let emailNotification;

    switch (eventType) {
      case 'queue_joined':
        if (!queueName || !queueNumber) {
          return NextResponse.json(
            { error: 'Missing required fields for queue_joined: queueName, queueNumber' },
            { status: 400 }
          );
        }
        emailNotification = generateQueueJoinedEmail(user.full_name, queueName, queueNumber);
        break;

      case 'queue_called':
        if (!queueName || !queueNumber) {
          return NextResponse.json(
            { error: 'Missing required fields for queue_called: queueName, queueNumber' },
            { status: 400 }
          );
        }
        emailNotification = generateQueueCalledEmail(user.full_name, queueName, queueNumber, windowNumber);
        break;

      case 'queue_serving':
        if (!queueName || !queueNumber) {
          return NextResponse.json(
            { error: 'Missing required fields for queue_serving: queueName, queueNumber' },
            { status: 400 }
          );
        }
        // If isNextInQueue is true, this customer is NEXT (not being served now)
        // Generate different email content based on whether customer is next or being served
        if (isNextInQueue) {
          console.log("[v0] Generating 'next in queue' notification for customer number:", queueNumber);
          emailNotification = generateQueueServingEmail(user.full_name, queueName, queueNumber, windowNumber, true);
        } else {
          console.log("[v0] Generating 'being served now' notification for customer number:", queueNumber);
          emailNotification = generateQueueServingEmail(user.full_name, queueName, queueNumber, windowNumber, false);
        }
        break;

      case 'queue_completed':
        if (!queueName || !queueNumber) {
          return NextResponse.json(
            { error: 'Missing required fields for queue_completed: queueName, queueNumber' },
            { status: 400 }
          );
        }
        emailNotification = generateQueueCompletedEmail(user.full_name, queueName, queueNumber);
        break;

      case 'queue_cancelled':
        if (!queueName || !queueNumber) {
          return NextResponse.json(
            { error: 'Missing required fields for queue_cancelled: queueName, queueNumber' },
            { status: 400 }
          );
        }
        emailNotification = generateQueueCancelledEmail(user.full_name, queueName, queueNumber, reason);
        break;

      case 'position_update':
        if (!queueName || !queueNumber || !windowNumber) {
          return NextResponse.json(
            { error: 'Missing required fields for position_update: queueName, queueNumber, windowNumber' },
            { status: 400 }
          );
        }
        emailNotification = generatePositionUpdateEmail(user.full_name, queueName, queueNumber, queueNumber, parseInt(windowNumber));
        break;

      default:
        console.error("[v0] Invalid eventType:", eventType);
        return NextResponse.json(
          { error: 'Invalid eventType' },
          { status: 400 }
        );
    }

    console.log("[v0] Generated email notification for", eventType, "to", user.email);

    // Send and log email
    const result = await sendAndLogEmailNotification(user, queueEntryId || null, emailNotification);

    console.log("[v0] Send result:", result);

    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully', messageId: result.messageId },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[v0] Send Notification API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
