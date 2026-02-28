<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Models\Attachment;
use App\Models\UserIdentification;
use App\Services\CloudStorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IdentificationController extends Controller
{
    public function __construct(
        private readonly CloudStorageService $storageService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $identification = UserIdentification::where('user_id', $user->id)->first();

        $attachmentDetails = [];
        if ($identification && is_array($identification->attachments)) {
            $allIds = array_merge(
                $identification->attachments['identification'] ?? [],
                $identification->attachments['trade_license'] ?? []
            );

            if (!empty($allIds)) {
                $attachmentDetails = Attachment::whereIn('id', $allIds)->get()->keyBy('id');
            }
        }

        return Inertia::render('Identification/Index', [
            'identification' => $identification,
            'attachmentDetails' => $attachmentDetails,
            'accountType' => $user->account?->account_type,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $identificationFiles = $request->file('identification') ?? [];
        $tradeLicenseFiles = $request->file('trade_license') ?? [];
        $filesToDelete = $request->input('files_to_delete', []);

        // Delete specified files
        foreach (array_filter($filesToDelete) as $fileId) {
            $attachment = Attachment::find($fileId);
            if ($attachment) {
                $this->storageService->deleteFile($attachment->key);
                $attachment->delete();
            }
        }

        $identificationIds = [];
        foreach ($identificationFiles as $file) {
            if ($file->isValid() && $file->getSize() > 0) {
                $result = $this->storageService->uploadFile('identification', $file);
                $attachment = Attachment::create([
                    'key' => $result['key'],
                    'metadata' => ['fileSize' => $file->getSize(), 'contentType' => $file->getMimeType()],
                ]);
                $identificationIds[] = $attachment->id;
            }
        }

        $tradeLicenseIds = [];
        foreach ($tradeLicenseFiles as $file) {
            if ($file->isValid() && $file->getSize() > 0) {
                $result = $this->storageService->uploadFile('trade_license', $file);
                $attachment = Attachment::create([
                    'key' => $result['key'],
                    'metadata' => ['fileSize' => $file->getSize(), 'contentType' => $file->getMimeType()],
                ]);
                $tradeLicenseIds[] = $attachment->id;
            }
        }

        $existing = UserIdentification::where('user_id', $user->id)->first();
        $existingAttachments = $existing ? ($existing->attachments ?? []) : [];

        $mergedIdentification = array_values(array_unique(array_merge(
            array_diff($existingAttachments['identification'] ?? [], $filesToDelete),
            $identificationIds
        )));

        $mergedTradeLicense = array_values(array_unique(array_merge(
            array_diff($existingAttachments['trade_license'] ?? [], $filesToDelete),
            $tradeLicenseIds
        )));

        UserIdentification::updateOrCreate(
            ['user_id' => $user->id],
            [
                'attachments' => [
                    'identification' => $mergedIdentification,
                    'trade_license' => $mergedTradeLicense,
                ],
            ]
        );

        // Update account status to pending after identification submission
        if ($user->account) {
            $user->account->update(['account_status' => 'pending']);
        }

        return back()->with('success', 'Identification documents uploaded.');
    }
}
