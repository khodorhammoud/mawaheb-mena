<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Models\Industry;
use App\Models\Language;
use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account;

        if (!$account) {
            return redirect()->route('home');
        }

        if ($account->account_type === AccountType::Freelancer->value) {
            $freelancer = $account->freelancer;
            $freelancer?->load(['skills', 'languages']);

            return Inertia::render('Onboarding/FreelancerOnboarding', [
                'freelancer' => $freelancer,
                'account' => $account,
                'user' => $user->only(['id', 'first_name', 'last_name', 'email']),
                'allSkills' => Skill::orderBy('label')->get(['id', 'label']),
                'allLanguages' => Language::all(),
            ]);
        }

        if ($account->account_type === AccountType::Employer->value) {
            $employer = $account->employer;
            $employer?->load('industries');

            return Inertia::render('Onboarding/EmployerOnboarding', [
                'employer' => $employer,
                'account' => $account,
                'user' => $user->only(['id', 'first_name', 'last_name', 'email']),
                'allIndustries' => Industry::orderBy('label')->get(),
                'allLanguages' => Language::all(),
            ]);
        }

        return redirect()->route('dashboard');
    }
}
