<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Enums\JobApplicationStatus;
use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account;

        if (!$account) {
            return redirect()->route('onboarding');
        }

        if ($account->account_type === AccountType::Freelancer->value) {
            return $this->freelancerDashboard($user, $account);
        }

        if ($account->account_type === AccountType::Employer->value) {
            return $this->employerDashboard($user, $account);
        }

        if ($user->role === 'admin') {
            return $this->adminDashboard($user);
        }

        return redirect()->route('home');
    }

    private function freelancerDashboard($user, $account)
    {
        $freelancer = $account->freelancer;
        if (!$freelancer) {
            return redirect()->route('onboarding');
        }

        $applications = JobApplication::with(['job.employer.account', 'job.skills'])
            ->where('freelancer_id', $freelancer->id)
            ->latest('created_at')
            ->take(5)
            ->get();

        $stats = [
            'total_applications' => JobApplication::where('freelancer_id', $freelancer->id)->count(),
            'approved_applications' => JobApplication::where('freelancer_id', $freelancer->id)
                ->where('status', JobApplicationStatus::Approved->value)->count(),
            'pending_applications' => JobApplication::where('freelancer_id', $freelancer->id)
                ->where('status', JobApplicationStatus::Pending->value)->count(),
        ];

        return Inertia::render('Dashboard/FreelancerDashboard', [
            'freelancer' => $freelancer,
            'applications' => $applications,
            'stats' => $stats,
        ]);
    }

    private function employerDashboard($user, $account)
    {
        $employer = $account->employer;
        if (!$employer) {
            return redirect()->route('onboarding');
        }

        $jobs = Job::with(['skills', 'applications'])
            ->where('employer_id', $employer->id)
            ->latest('created_at')
            ->take(5)
            ->get();

        $stats = [
            'total_jobs' => Job::where('employer_id', $employer->id)->count(),
            'active_jobs' => Job::where('employer_id', $employer->id)->where('status', 'active')->count(),
            'total_applicants' => JobApplication::whereIn(
                'job_id',
                Job::where('employer_id', $employer->id)->pluck('id')
            )->count(),
        ];

        return Inertia::render('Dashboard/EmployerDashboard', [
            'employer' => $employer,
            'jobs' => $jobs,
            'stats' => $stats,
        ]);
    }

    private function adminDashboard($user)
    {
        return Inertia::render('Dashboard/AdminDashboard');
    }
}
