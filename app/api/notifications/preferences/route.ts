import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { upsertNotificationPreferences, getUserNotificationPreferences } from '@/lib/notification-service';

// GET - Retrieve user notification preferences
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const preferences = await getUserNotificationPreferences(userId);

    // Always return preferences (with defaults if not found)
    return NextResponse.json(
      { 
        preferences: preferences || {
          queue_joined: true,
          queue_called: true,
          queue_serving: true,
          queue_completed: true,
          queue_cancelled: true,
          position_updates: false,
          announcements: true,
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('[Get Preferences API] Error:', error);
    // Return default preferences even on error
    return NextResponse.json(
      { 
        preferences: {
          queue_joined: true,
          queue_called: true,
          queue_serving: true,
          queue_completed: true,
          queue_cancelled: true,
          position_updates: false,
          announcements: true,
        }
      },
      { status: 200 }
    );
  }
}

// PUT - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and preferences' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update preferences - upsertNotificationPreferences handles all logic
    try {
      const result = await upsertNotificationPreferences(userId, preferences);
      
      // Check if result indicates table not initialized
      if (result && typeof result === 'object' && 'message' in result && result.message) {
        return NextResponse.json(
          { 
            message: result.message,
            status: 'pending_initialization'
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { message: 'Preferences updated successfully' },
        { status: 200 }
      );
    } catch (upsertError) {
      console.error('[Update Preferences API] Upsert error:', upsertError);
      
      // Check if it's a table-doesn't-exist error
      const errorMessage = upsertError instanceof Error ? upsertError.message : String(upsertError);
      if (errorMessage.includes('notification_preferences') || errorMessage.includes('PGRST204')) {
        return NextResponse.json(
          { 
            message: 'Database table not initialized yet. Running initialization...',
            status: 'table_not_found',
            instruction: 'Run migration: /scripts/005_add_email_notifications.sql in Supabase SQL Editor'
          },
          { status: 200 }
        );
      }
      
      throw upsertError;
    }
  } catch (error) {
    console.error('[Update Preferences API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
