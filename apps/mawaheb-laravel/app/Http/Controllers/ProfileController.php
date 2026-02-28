<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $account = Account::where('slug', $slug)
            ->with(['user'])
            ->firstOrFail();

        if ($account->account_type === AccountType::Freelancer->value) {
            return $this->freelancerProfile($account);
        }

        return $this->employerProfile($account);
    }

    private function freelancerProfile(Account $account)
    {
        $freelancer = $account->freelancer;
        $freelancer->load(['skills', 'languages', 'videoAttachment']);

        $reviews = Review::where('freelancer_id', $freelancer->id)
            ->with(['employer.account.user'])
            ->latest('created_at')
            ->get();

        $avgRating = $reviews->avg('rating') ?? 0;

        return Inertia::render('Profile/FreelancerProfile', [
            'account' => $account,
            'freelancer' => $freelancer,
            'reviews' => $reviews,
            'avgRating' => round($avgRating, 1),
        ]);
    }

    private function employerProfile(Account $account)
    {
        $employer = $account->employer;
        $employer->load(['industries', 'jobs' => fn ($q) => $q->where('status', 'active')->latest('created_at')->take(5)]);

        $reviews = Review::where('employer_id', $employer->id)
            ->with(['freelancer.account.user'])
            ->latest('created_at')
            ->get();

        $avgRating = $reviews->avg('rating') ?? 0;

        return Inertia::render('Profile/EmployerProfile', [
            'account' => $account,
            'employer' => $employer,
            'reviews' => $reviews,
            'avgRating' => round($avgRating, 1),
        ]);
    }

    public function storeReview(Request $request)
    {
        $validated = $request->validate([
            'employer_id' => 'nullable|integer|exists:employers,id',
            'freelancer_id' => 'nullable|integer|exists:freelancers,id',
            'rating' => 'required|numeric|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
            'review_type' => 'required|string',
        ]);

        Review::create([
            ...$validated,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Review submitted.');
    }
}
