<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Enums\JobApplicationStatus;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\JobCategory;
use App\Models\JobSkill;
use App\Models\Skill;
use App\Models\Freelancer;
use App\Services\JobRecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JobController extends Controller
{
    public function __construct(
        private readonly JobRecommendationService $recommendationService,
    ) {}

    public function index(Request $request)
    {
        $query = Job::with(['employer.account', 'skills', 'category'])
            ->where('status', 'active');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('project_type')) {
            $query->where('project_type', $request->input('project_type'));
        }

        if ($request->filled('experience_level')) {
            $query->where('experience_level', $request->input('experience_level'));
        }

        if ($request->filled('min_budget')) {
            $query->where('budget', '>=', $request->input('min_budget'));
        }

        if ($request->filled('max_budget')) {
            $query->where('budget', '<=', $request->input('max_budget'));
        }

        if ($request->filled('skills')) {
            $skillIds = $request->input('skills');
            $query->whereHas('skills', function ($q) use ($skillIds) {
                $q->whereIn('skill_id', $skillIds);
            });
        }

        if ($request->filled('working_hours_min')) {
            $query->where('working_hours_per_week', '>=', $request->input('working_hours_min'));
        }

        if ($request->filled('working_hours_max')) {
            $query->where('working_hours_per_week', '<=', $request->input('working_hours_max'));
        }

        $jobs = $query->latest('created_at')->paginate(12);

        $user = $request->user();
        $freelancer = null;
        $recommendedJobs = [];
        $myJobs = [];

        if ($user && $user->account?->account_type === AccountType::Freelancer->value) {
            $freelancer = $user->account->freelancer;
            if ($freelancer) {
                $recommendedJobs = $this->recommendationService->getRecommendations($freelancer);
                $myJobs = JobApplication::with(['job.employer.account', 'job.skills'])
                    ->where('freelancer_id', $freelancer->id)
                    ->latest('created_at')
                    ->get();
            }
        }

        $allSkills = Skill::orderBy('label')->get();
        $categories = JobCategory::orderBy('label')->get();

        return Inertia::render('Jobs/BrowseJobs', [
            'jobs' => $jobs,
            'recommendedJobs' => $recommendedJobs,
            'myJobs' => $myJobs,
            'allSkills' => $allSkills,
            'categories' => $categories,
            'filters' => $request->only([
                'search', 'project_type', 'experience_level',
                'min_budget', 'max_budget', 'skills',
                'working_hours_min', 'working_hours_max',
            ]),
        ]);
    }

    public function show(Request $request, int $jobId)
    {
        $job = Job::with(['employer.account.user', 'skills', 'category', 'applications.freelancer.account.user'])
            ->findOrFail($jobId);

        $user = $request->user();
        $hasApplied = false;
        $application = null;

        if ($user && $user->account?->freelancer) {
            $application = JobApplication::where('job_id', $jobId)
                ->where('freelancer_id', $user->account->freelancer->id)
                ->first();
            $hasApplied = $application !== null;
        }

        return Inertia::render('Jobs/JobDetail', [
            'job' => $job,
            'hasApplied' => $hasApplied,
            'application' => $application,
        ]);
    }

    public function create(Request $request)
    {
        $skills = Skill::orderBy('label')->get();
        $categories = JobCategory::orderBy('label')->get();

        return Inertia::render('Jobs/NewJob', [
            'allSkills' => $skills,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'job_category_id' => 'nullable|integer|exists:job_categories,id',
            'working_hours_per_week' => 'nullable|integer|min:1|max:168',
            'location_preference' => 'nullable|string',
            'project_type' => 'nullable|string',
            'budget' => 'nullable|integer|min:0',
            'expected_hourly_rate' => 'nullable|integer|min:0',
            'experience_level' => 'nullable|string',
            'status' => 'nullable|string',
            'skills' => 'nullable|array',
            'skills.*.skill_id' => 'required|integer|exists:skills,id',
            'skills.*.is_starred' => 'nullable|boolean',
        ]);

        $employer = $request->user()->account->employer;
        if (!$employer) {
            return back()->with('error', 'Only employers can create jobs.');
        }

        $job = DB::transaction(function () use ($validated, $employer) {
            $job = Job::create([
                'employer_id' => $employer->id,
                'title' => $validated['title'],
                'description' => $validated['description'],
                'job_category_id' => $validated['job_category_id'] ?? null,
                'working_hours_per_week' => $validated['working_hours_per_week'] ?? null,
                'location_preference' => $validated['location_preference'] ?? null,
                'project_type' => $validated['project_type'] ?? null,
                'budget' => $validated['budget'] ?? null,
                'expected_hourly_rate' => $validated['expected_hourly_rate'] ?? null,
                'experience_level' => $validated['experience_level'] ?? null,
                'status' => $validated['status'] ?? 'draft',
                'created_at' => now(),
            ]);

            if (!empty($validated['skills'])) {
                foreach ($validated['skills'] as $skill) {
                    JobSkill::create([
                        'job_id' => $job->id,
                        'skill_id' => $skill['skill_id'],
                        'is_starred' => $skill['is_starred'] ?? false,
                    ]);
                }
            }

            return $job;
        });

        return redirect()->route('manage-jobs')
            ->with('success', 'Job created successfully.');
    }

    public function edit(Request $request, int $jobId)
    {
        $job = Job::with(['skills', 'category'])->findOrFail($jobId);
        $employer = $request->user()->account->employer;

        if ($job->employer_id !== $employer->id) {
            abort(403);
        }

        $skills = Skill::orderBy('label')->get();
        $categories = JobCategory::orderBy('label')->get();

        return Inertia::render('Jobs/EditJob', [
            'job' => $job,
            'allSkills' => $skills,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, int $jobId)
    {
        $job = Job::findOrFail($jobId);
        $employer = $request->user()->account->employer;

        if ($job->employer_id !== $employer->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'job_category_id' => 'nullable|integer|exists:job_categories,id',
            'working_hours_per_week' => 'nullable|integer|min:1|max:168',
            'location_preference' => 'nullable|string',
            'project_type' => 'nullable|string',
            'budget' => 'nullable|integer|min:0',
            'expected_hourly_rate' => 'nullable|integer|min:0',
            'experience_level' => 'nullable|string',
            'status' => 'nullable|string',
            'skills' => 'nullable|array',
            'skills.*.skill_id' => 'required|integer|exists:skills,id',
            'skills.*.is_starred' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($job, $validated) {
            $job->update(collect($validated)->except('skills')->toArray());

            JobSkill::where('job_id', $job->id)->delete();
            if (!empty($validated['skills'])) {
                foreach ($validated['skills'] as $skill) {
                    JobSkill::create([
                        'job_id' => $job->id,
                        'skill_id' => $skill['skill_id'],
                        'is_starred' => $skill['is_starred'] ?? false,
                    ]);
                }
            }
        });

        return redirect()->route('manage-jobs')
            ->with('success', 'Job updated successfully.');
    }

    public function manageJobs(Request $request)
    {
        $employer = $request->user()->account->employer;
        if (!$employer) {
            abort(403);
        }

        $jobs = Job::with(['skills', 'applications', 'category'])
            ->where('employer_id', $employer->id)
            ->latest('created_at')
            ->paginate(10);

        return Inertia::render('Jobs/ManageJobs', [
            'jobs' => $jobs,
        ]);
    }

    public function apply(Request $request, int $jobId)
    {
        $freelancer = $request->user()->account->freelancer;
        if (!$freelancer) {
            return back()->with('error', 'Only freelancers can apply to jobs.');
        }

        $existing = JobApplication::where('job_id', $jobId)
            ->where('freelancer_id', $freelancer->id)
            ->first();

        if ($existing) {
            return back()->with('error', 'You have already applied to this job.');
        }

        JobApplication::create([
            'job_id' => $jobId,
            'freelancer_id' => $freelancer->id,
            'status' => JobApplicationStatus::Pending->value,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Application submitted successfully.');
    }

    public function updateApplicationStatus(Request $request, int $applicationId)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,shortlisted,approved,rejected',
        ]);

        $application = JobApplication::with('job')->findOrFail($applicationId);
        $employer = $request->user()->account->employer;

        if ($application->job->employer_id !== $employer->id) {
            abort(403);
        }

        $application->update(['status' => $validated['status']]);

        return back()->with('success', 'Application status updated.');
    }

    public function applicants(Request $request, int $jobId)
    {
        $job = Job::with(['skills'])->findOrFail($jobId);
        $employer = $request->user()->account->employer;

        if ($job->employer_id !== $employer->id) {
            abort(403);
        }

        $applications = JobApplication::with([
            'freelancer.account.user',
            'freelancer.skills',
            'freelancer.languages',
        ])
            ->where('job_id', $jobId)
            ->latest('created_at')
            ->get();

        return Inertia::render('Jobs/JobApplicants', [
            'job' => $job,
            'applications' => $applications,
        ]);
    }
}
