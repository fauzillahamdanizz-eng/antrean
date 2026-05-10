import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getNotificationHistory } from '@/lib/notification-service';

// GET - Retrieve user notification history
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const isAdmin = request.nextUrl.searchParams.get('isAdmin') === 'true';

    console.log('[Notifications History API] userId:', userId, 'isAdmin:', isAdmin, 'limit:', limit);

    // If admin and no userId, fetch all notifications
    if (isAdmin && !userId) {
      console.log('[Notifications History API] Admin request - fetching all notifications');
      
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 200));

      if (error) {
        console.error('[Notifications History API] Error fetching all notifications:', error);
        return NextResponse.json(
          { error: 'Failed to fetch notifications', details: error.message },
          { status: 500 }
        );
      }

      console.log('[Notifications History API] Found', data?.length || 0, 'notifications');
      return NextResponse.json(
        { history: data || [], count: data?.length || 0 },
        { status: 200 }
      );
    }

    // If userId provided, fetch for that user only
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
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
      console.error('[Notifications History API] User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get notification history for specific user
    const history = await getNotificationHistory(userId, Math.min(limit, 100));

    console.log('[Notifications History API] Found', history.length, 'notifications for user:', userId);
    return NextResponse.json(
      { history, count: history.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Notifications History API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
