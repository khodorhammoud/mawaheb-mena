<?php

namespace App\Http\Controllers;

use App\Models\Industry;
use App\Models\Language;
use App\Models\UserIdentification;
use App\Services\CloudStorageService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EmployerController extends Controller
{
    public function __construct(
        private readonly CloudStorageService $storageService,
        private readonly UserService $userService,
    ) {}

    public function onboarding(Request $request)
    {
        $user = $request->user();
        $account = $user->account;
        $employer = $account?->employer;

        if (!$employer) {
            return redirect()->route('dashboard');
        }

        $employer->load('industries');
        $allIndustries = Industry::orderBy('label')->get();
        $allLanguages = Language::all();

        return Inertia::render('Onboarding/EmployerOnboarding', [
            'employer' => $employer,
            'account' => $account,
            'allIndustries' => $allIndustries,
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
            'company_name' => 'nullable|string|max:100',
            'company_email' => 'nullable|email|max:150',
            'employer_account_type' => 'nullable|string',
        ]);

        $employer = $request->user()->account->employer;
        $employer->update([
            'about' => strip_tags($validated['about'], '<p><br><strong><em>'),
            'company_name' => $validated['company_name'] ?? $employer->company_name,
            'company_email' => $validated['company_email'] ?? $employer->company_email,
            'employerAccountType' => $validated['employer_account_type'] ?? $employer->employerAccountType,
        ]);

        return back()->with('success', 'About section updated.');
    }

    public function updateIndustries(Request $request)
    {
        $validated = $request->validate([
            'industries' => 'required|array',
            'industries.*' => 'integer|exists:industries,id',
        ]);

        $employer = $request->user()->account->employer;
        $employer->industries()->sync($validated['industries']);

        return back()->with('success', 'Industries updated.');
    }

    public function updateBudget(Request $request)
    {
        $validated = $request->validate([
            'budget' => 'required|integer|min:0',
            'years_in_business' => 'nullable|integer|min:0',
        ]);

        $employer = $request->user()->account->employer;
        $employer->update($validated);

        return back()->with('success', 'Budget updated.');
    }

    public function updateIdentification(Request $request)
    {
        $user = $request->user();

        $identificationFiles = $request->file('identification') ?? [];
        $tradeLicenseFiles = $request->file('trade_license') ?? [];
        $filesToDelete = $request->input('files_to_delete', []);

        // Delete specified files
        if (!empty($filesToDelete)) {
            foreach ($filesToDelete as $fileId) {
                $attachment = \App\Models\Attachment::find($fileId);
                if ($attachment) {
                    $this->storageService->deleteFile($attachment->key);
                    $attachment->delete();
                }
            }
        }

        $identificationIds = [];
        foreach ($identificationFiles as $file) {
            if ($file->isValid()) {
                $result = $this->storageService->uploadFile('identification', $file);
                $attachment = \App\Models\Attachment::create([
                    'key' => $result['key'],
                    'metadata' => ['fileSize' => $file->getSize(), 'contentType' => $file->getMimeType()],
                ]);
                $identificationIds[] = $attachment->id;
            }
        }

        $tradeLicenseIds = [];
        foreach ($tradeLicenseFiles as $file) {
            if ($file->isValid()) {
                $result = $this->storageService->uploadFile('trade_license', $file);
                $attachment = \App\Models\Attachment::create([
                    'key' => $result['key'],
                    'metadata' => ['fileSize' => $file->getSize(), 'contentType' => $file->getMimeType()],
                ]);
                $tradeLicenseIds[] = $attachment->id;
            }
        }

        $existing = UserIdentification::where('user_id', $user->id)->first();
        $existingAttachments = $existing ? ($existing->attachments ?? []) : [];

        $mergedIdentification = array_merge(
            array_diff($existingAttachments['identification'] ?? [], $filesToDelete),
            $identificationIds
        );
        $mergedTradeLicense = array_merge(
            array_diff($existingAttachments['trade_license'] ?? [], $filesToDelete),
            $tradeLicenseIds
        );

        UserIdentification::updateOrCreate(
            ['user_id' => $user->id],
            [
                'attachments' => [
                    'identification' => array_values($mergedIdentification),
                    'trade_license' => array_values($mergedTradeLicense),
                ],
            ]
        );

        return back()->with('success', 'Identification updated.');
    }

    public function completeOnboarding(Request $request)
    {
        $user = $request->user();
        $this->userService->updateOnboardingStatus($user->id);

        return redirect()->route('identification');
    }
}
