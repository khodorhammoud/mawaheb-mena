<?php

namespace App\Http\Controllers;

use App\Models\Freelancer;
use App\Models\FreelancerSkill;
use App\Models\Skill;
use App\Models\Language;
use App\Models\Attachment;
use App\Services\CloudStorageService;
use App\Services\CvParserService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FreelancerController extends Controller
{
    public function __construct(
        private readonly CloudStorageService $storageService,
        private readonly CvParserService $cvParser,
        private readonly UserService $userService,
    ) {}

    public function onboarding(Request $request)
    {
        $user = $request->user();
        $account = $user->account;
        $freelancer = $account?->freelancer;

        if (!$freelancer) {
            return redirect()->route('dashboard');
        }

        $freelancer->load(['skills', 'languages']);
        $allSkills = Skill::orderBy('label')->get();
        $allLanguages = Language::all();

        return Inertia::render('Onboarding/FreelancerOnboarding', [
            'freelancer' => $freelancer,
            'account' => $account,
            'allSkills' => $allSkills,
            'allLanguages' => $allLanguages,
        ]);
    }

    public function updateBio(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:80',
            'last_name' => 'required|string|max:80',
            'address' => 'nullable|string|max:150',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'social_media_links' => 'nullable|array',
        ]);

        $user = $request->user();
        $user->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
        ]);

        $user->account->update([
            'address' => $validated['address'] ?? null,
            'country' => $validated['country'] ?? null,
            'website_url' => $validated['website'] ?? null,
            'social_media_links' => $validated['social_media_links'] ?? [],
        ]);

        return back()->with('success', 'Bio updated successfully.');
    }

    public function updateAbout(Request $request)
    {
        $validated = $request->validate([
            'about' => 'required|string|max:5000',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $freelancer->update(['about' => strip_tags($validated['about'], '<p><br><strong><em><ul><ol><li><a>')]);

        return back()->with('success', 'About section updated.');
    }

    public function updateSkills(Request $request)
    {
        $validated = $request->validate([
            'skills' => 'required|array',
            'skills.*.skill_id' => 'required|integer|exists:skills,id',
            'skills.*.years_of_experience' => 'required|integer|min:1',
            'skills.*.is_starred' => 'nullable|boolean',
            'skills.*.label' => 'nullable|string',
        ]);

        $freelancer = $request->user()->account->freelancer;

        DB::transaction(function () use ($freelancer, $validated) {
            FreelancerSkill::where('freelancer_id', $freelancer->id)->delete();

            foreach ($validated['skills'] as $skill) {
                FreelancerSkill::create([
                    'freelancer_id' => $freelancer->id,
                    'skill_id' => $skill['skill_id'],
                    'years_of_experience' => max(1, $skill['years_of_experience']),
                    'is_starred' => $skill['is_starred'] ?? false,
                ]);
            }

            $labels = collect($validated['skills'])
                ->pluck('label')
                ->filter()
                ->values()
                ->toArray();

            $freelancer->update(['fields_of_expertise' => $labels]);
        });

        return back()->with('success', 'Skills updated.');
    }

    public function updateLanguages(Request $request)
    {
        $validated = $request->validate([
            'languages' => 'required|array',
            'languages.*' => 'integer|exists:languages,id',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $freelancer->languages()->sync(array_unique($validated['languages']));

        return back()->with('success', 'Languages updated.');
    }

    public function updatePortfolio(Request $request)
    {
        $validated = $request->validate([
            'portfolio' => 'required|string',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $portfolio = json_decode($validated['portfolio'], true);

        if (!is_array($portfolio)) {
            return back()->with('error', 'Invalid portfolio data.');
        }

        // Handle file uploads for each portfolio item
        foreach ($portfolio as $index => &$item) {
            $file = $request->file("portfolio-attachment.{$index}");
            if ($file) {
                $result = $this->storageService->uploadFile('portfolio', $file);
                if ($file->getMimeType() && str_starts_with($file->getMimeType(), 'image/')) {
                    $item['projectImageUrl'] = $result['url'];
                    $item['projectImageName'] = $file->getClientOriginalName();
                } else {
                    $item['attachmentUrl'] = $result['url'];
                    $item['attachmentName'] = $file->getClientOriginalName();
                }
            }
            $item['projectDescription'] = strip_tags($item['projectDescription'] ?? '', '<p><br><strong><em>');
        }

        $freelancer->update(['portfolio' => $portfolio]);

        return back()->with('success', 'Portfolio updated.');
    }

    public function updateWorkHistory(Request $request)
    {
        $validated = $request->validate([
            'work_history' => 'required|string',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $workHistory = json_decode($validated['work_history'], true);

        if (!is_array($workHistory)) {
            return back()->with('error', 'Invalid work history data.');
        }

        foreach ($workHistory as &$item) {
            $item['jobDescription'] = strip_tags($item['jobDescription'] ?? '', '<p><br><strong><em>');
        }

        $freelancer->update(['work_history' => $workHistory]);

        return back()->with('success', 'Work history updated.');
    }

    public function updateCertificates(Request $request)
    {
        $validated = $request->validate([
            'certificates' => 'required|string',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $certificates = json_decode($validated['certificates'], true);

        if (!is_array($certificates)) {
            return back()->with('error', 'Invalid certificates data.');
        }

        foreach ($certificates as $index => &$cert) {
            $file = $request->file("certificates-attachment.{$index}");
            if ($file) {
                $result = $this->storageService->uploadFile('certificates', $file);
                $attachment = Attachment::create([
                    'key' => $result['key'],
                    'metadata' => [
                        'fileSize' => $file->getSize(),
                        'contentType' => $file->getMimeType(),
                    ],
                ]);
                $cert['attachmentId'] = $attachment->id;
                $cert['attachmentName'] = $result['key'];
            }
            $cert['certificateName'] = strip_tags($cert['certificateName'] ?? '');
            $cert['issuedBy'] = strip_tags($cert['issuedBy'] ?? '');
        }

        $freelancer->update(['certificates' => $certificates]);

        return back()->with('success', 'Certificates updated.');
    }

    public function updateEducation(Request $request)
    {
        $validated = $request->validate([
            'educations' => 'required|string',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $educations = json_decode($validated['educations'], true);

        if (!is_array($educations)) {
            return back()->with('error', 'Invalid education data.');
        }

        $freelancer->update(['educations' => $educations]);

        return back()->with('success', 'Education updated.');
    }

    public function updateHourlyRate(Request $request)
    {
        $validated = $request->validate([
            'hourly_rate' => 'required|integer|min:1',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $freelancer->update(['hourly_rate' => $validated['hourly_rate']]);

        return back()->with('success', 'Hourly rate updated.');
    }

    public function updateYearsOfExperience(Request $request)
    {
        $validated = $request->validate([
            'years_of_experience' => 'required|integer|min:0|max:30',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $freelancer->update(['years_of_experience' => $validated['years_of_experience']]);

        return back()->with('success', 'Experience updated.');
    }

    public function updateAvailability(Request $request)
    {
        $validated = $request->validate([
            'available_for_work' => 'required|boolean',
            'available_from' => 'nullable|date',
            'hours_available_from' => 'nullable|string',
            'hours_available_to' => 'nullable|string',
            'jobs_open_to' => 'nullable|array',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $freelancer->update($validated);

        return back()->with('success', 'Availability updated.');
    }

    public function updateVideo(Request $request)
    {
        $freelancer = $request->user()->account->freelancer;

        if ($request->hasFile('video_file')) {
            $file = $request->file('video_file');
            $result = $this->storageService->uploadFile('freelancer-introductory-video', $file);
            $attachment = Attachment::create([
                'key' => $result['key'],
                'metadata' => ['fileSize' => $file->getSize(), 'contentType' => $file->getMimeType()],
            ]);
            $freelancer->update([
                'video_attachment_id' => $attachment->id,
                'video_type' => 'attachment',
                'video_link' => null,
            ]);
        } elseif ($request->filled('video_link')) {
            $freelancer->update([
                'video_link' => $request->input('video_link'),
                'video_type' => 'link',
                'video_attachment_id' => null,
            ]);
        } else {
            return back()->with('error', 'No video input provided.');
        }

        return back()->with('success', 'Video updated.');
    }

    public function parseCV(Request $request)
    {
        $request->validate([
            'cv_file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $parsedData = $this->cvParser->parse($request->file('cv_file'));

        if (!$parsedData) {
            return back()->with('error', 'Failed to parse CV.');
        }

        if (!empty($parsedData['about'])) {
            $freelancer->update(['about' => $parsedData['about']]);
        }
        if (!empty($parsedData['projects'])) {
            $freelancer->update(['portfolio' => $parsedData['projects']]);
        }
        if (!empty($parsedData['workHistory'])) {
            $freelancer->update(['work_history' => $parsedData['workHistory']]);
        }
        if (!empty($parsedData['certificates'])) {
            $freelancer->update(['certificates' => $parsedData['certificates']]);
        }
        if (!empty($parsedData['education'])) {
            $freelancer->update(['educations' => $parsedData['education']]);
        }

        return back()->with('success', 'CV parsed and profile updated.');
    }

    public function completeOnboarding(Request $request)
    {
        $user = $request->user();
        $this->userService->updateOnboardingStatus($user->id);

        return redirect()->route('identification');
    }
}
