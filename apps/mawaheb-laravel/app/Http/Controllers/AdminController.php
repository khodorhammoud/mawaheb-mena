<?php

namespace App\Http\Controllers;

use App\Enums\AccountStatus;
use App\Models\Account;
use App\Models\User;
use App\Models\Job;
use App\Models\Freelancer;
use App\Models\Employer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_freelancers' => Account::where('account_type', 'freelancer')->count(),
            'total_employers' => Account::where('account_type', 'employer')->count(),
            'total_jobs' => Job::count(),
            'active_jobs' => Job::where('status', 'active')->count(),
            'pending_accounts' => Account::where('account_status', AccountStatus::Pending->value)->count(),
        ];

        return Inertia::render('Dashboard/AdminDashboard', [
            'stats' => $stats,
        ]);
    }

    public function pendingAccounts(Request $request)
    {
        $accounts = Account::with(['user', 'freelancer', 'employer'])
            ->where('account_status', AccountStatus::Pending->value)
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/PendingAccounts', [
            'accounts' => $accounts,
        ]);
    }

    public function approveAccount(Request $request, int $accountId)
    {
        $account = Account::findOrFail($accountId);
        $account->update([
            'account_status' => AccountStatus::Published->value,
            'is_creation_complete' => true,
        ]);

        // Trigger skillfolio generation for freelancers
        if ($account->account_type === 'freelancer') {
            $user = $account->user;
            if ($user) {
                \App\Jobs\ProcessSkillfolio::dispatch($user->id);
            }
        }

        return back()->with('success', 'Account approved.');
    }

    public function rejectAccount(Request $request, int $accountId)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $account = Account::findOrFail($accountId);
        $account->update([
            'account_status' => AccountStatus::Suspended->value,
        ]);

        return back()->with('success', 'Account rejected.');
    }

    public function users(Request $request)
    {
        $query = User::with('account');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'ilike', "%{$search}%")
                  ->orWhere('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }
}
