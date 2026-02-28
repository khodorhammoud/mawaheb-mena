<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CloudStorageService
{
    public function uploadFile(string $folder, UploadedFile $file): array
    {
        $key = $folder . '/' . Str::uuid() . '-' . $file->getClientOriginalName();

        $disk = $this->getDisk();
        $disk->put($key, file_get_contents($file->getRealPath()));

        return [
            'key' => $key,
            'url' => $disk->url($key),
        ];
    }

    public function deleteFile(string $key): bool
    {
        return $this->getDisk()->delete($key);
    }

    public function getUrl(string $key): string
    {
        return $this->getDisk()->url($key);
    }

    public function getTemporaryUrl(string $key, int $minutes = 60): string
    {
        return $this->getDisk()->temporaryUrl($key, now()->addMinutes($minutes));
    }

    private function getDisk(): \Illuminate\Contracts\Filesystem\Filesystem
    {
        $provider = config('filesystems.default', 'local');

        if (config('services.google.project_id') && config('services.google.storage_bucket')) {
            return Storage::disk('gcs');
        }

        if (config('aws.access_key_id')) {
            return Storage::disk('s3');
        }

        return Storage::disk('local');
    }
}
