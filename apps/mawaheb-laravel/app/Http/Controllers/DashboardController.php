<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Enums\JobApplicationStatus;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Review;
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
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('home');
    }

    private function freelancerDashboard($user, $account)
    {
        $freelancer = $account->freelancer;
        if (!$freelancer) {
            return redirect()->route('onboarding');
        }

        $freelancerData = $freelancer->toArray();
        $freelancerData['first_name'] = $user->first_name;
        $freelancerData['last_name'] = $user->last_name;
        $freelancerData['account'] = [
            'country' => $account->country ?? null,
            'website_url' => $account->website_url ?? null,
            'account_status' => $account->account_status,
        ];

        // Decode JSON fields
        foreach (['portfolio', 'work_history', 'certificates', 'educations', 'languages', 'skills'] as $field) {
            if (isset($freelancerData[$field]) && is_string($freelancerData[$field])) {
                $freelancerData[$field] = json_decode($freelancerData[$field], true) ?? [];
            }
        }

        // Overall rating
        $overallRating = 0;
        $reviewCount = 0;
        if (class_exists(Review::class)) {
            $reviews = Review::where('freelancer_id', $freelancer->id)
                ->where('review_type', 'employer_review')
                ->get();
            $reviewCount = $reviews->count();
            $overallRating = $reviewCount > 0 ? round($reviews->avg('rating'), 1) : 0;
        }

        return Inertia::render('Dashboard/FreelancerDashboard', [
            'profile' => $freelancerData,
            'canEdit' => true,
            'overallRating' => $overallRating,
            'reviewCount' => $reviewCount,
            'myReview' => null,
        ]);
    }

    private function employerDashboard($user, $account)
    {
        $employer = $account->employer;
        if (!$employer) {
            return redirect()->route('onboarding');
        }

        $jobIds = Job::where('employer_id', $employer->id)->pluck('id');

        $jobStats = [
            'active' => Job::where('employer_id', $employer->id)->where('status', 'active')->count(),
            'drafted' => Job::where('employer_id', $employer->id)->where('status', 'draft')->count(),
            'closed' => Job::where('employer_id', $employer->id)->where('status', 'closed')->count(),
            'paused' => Job::where('employer_id', $employer->id)->where('status', 'paused')->count(),
            'total' => Job::where('employer_id', $employer->id)->count(),
        ];

        $applicantStats = [
            'total' => JobApplication::whereIn('job_id', $jobIds)->count(),
            'shortlisted' => JobApplication::whereIn('job_id', $jobIds)
                ->where('status', JobApplicationStatus::Shortlisted->value ?? 'shortlisted')->count(),
            'interviewed' => JobApplication::whereIn('job_id', $jobIds)
                ->where('status', JobApplicationStatus::Interviewed->value ?? 'interviewed')->count(),
        ];

        return Inertia::render('Dashboard/EmployerDashboard', [
            'firstName' => $user->first_name,
            'accountStatus' => $account->account_status,
            'jobStats' => $jobStats,
            'applicantStats' => $applicantStats,
            'jobAddedSuccess' => session('job_added') === true,
        ]);
    }
}
