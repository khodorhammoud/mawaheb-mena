<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account;
        $settings = $this->userService->getUserSettings($user->id);

        return Inertia::render('Dashboard/Settings', [
            'settings' => $settings,
            'accountStatus' => $account?->account_status ?? 'published',
            'accountType' => $account?->account_type ?? 'freelancer',
        ]);
    }

    public function updateAccount(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'country' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'website_url' => 'nullable|url|max:255',
        ]);

        $user = $request->user();
        $this->userService->updateUserSettings($user->id, $validated);

        return back()->with('success', 'Account settings updated.');
    }

    public function updateNotificationPrefs(Request $request)
    {
        return back()->with('success', 'Notification preferences saved.');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password_hash)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $this->userService->updatePassword($user->id, $validated['password']);

        return back()->with('success', 'Password updated successfully.');
    }

    public function deactivateAccount(Request $request)
    {
        $user = $request->user();
        $this->userService->deactivateAccount($user->id);

        Auth::logout();
        $request->session()->invalidate();

        return redirect()->route('home')->with('success', 'Account deactivated.');
    }

    public function requestDeletion(Request $request)
    {
        $validated = $request->validate([
            'feedback' => 'nullable|string|max:2000',
        ]);

        $this->userService->requestDeletion($request->user()->id, $validated['feedback'] ?? null);

        Auth::logout();
        $request->session()->invalidate();

        return redirect()->route('home')->with('success', 'Deletion request submitted.');
    }

    public function exportData(Request $request)
    {
        $user = $request->user();
        $user->load(['account.freelancer.skills', 'account.freelancer.languages', 'account.employer.industries']);

        return response()->json([
            'user' => $user->toArray(),
        ])->header('Content-Disposition', 'attachment; filename="my-data.json"');
    }
}
