<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Services\CloudStorageService;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    public function __construct(
        private readonly CloudStorageService $storageService,
    ) {}

    public function show(int $attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);

        try {
            $url = $this->storageService->getTemporaryUrl($attachment->key, 60);
            return redirect($url);
        } catch (\Exception $e) {
            $url = $this->storageService->getUrl($attachment->key);
            return redirect($url);
        }
    }

    public function destroy(Request $request, int $attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);
        $this->storageService->deleteFile($attachment->key);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
    }
}
