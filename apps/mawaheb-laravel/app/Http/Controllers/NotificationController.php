<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest('created_at')
            ->paginate(20);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function show(Request $request, int $notificationId)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($notificationId);

        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return Inertia::render('Notifications/Show', [
            'notification' => $notification,
        ]);
    }

    public function markAsRead(Request $request, int $notificationId)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('id', $notificationId)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back()->with('success', 'Notification marked as read.');
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Server-Sent Events endpoint for real-time notifications.
     */
    public function stream(Request $request): StreamedResponse
    {
        $userId = $request->user()->id;

        return new StreamedResponse(function () use ($userId) {
            $lastCheck = now();

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                $newNotifications = Notification::where('user_id', $userId)
                    ->where('created_at', '>', $lastCheck)
                    ->orderBy('created_at', 'desc')
                    ->get();

                if ($newNotifications->isNotEmpty()) {
                    echo "data: " . json_encode([
                        'type' => 'notifications',
                        'data' => $newNotifications,
                    ]) . "\n\n";
                    ob_flush();
                    flush();
                }

                $lastCheck = now();
                sleep(5);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
