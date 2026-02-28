<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class CvParserService
{
    public function parse(UploadedFile $file): ?array
    {
        $apiKey = config('services.openai.api_key');
        if (!$apiKey) {
            return null;
        }

        $content = $this->extractText($file);
        if (!$content) {
            return null;
        }

        $prompt = <<<PROMPT
Parse the following CV/resume text and extract structured data. Return a JSON object with these fields:
- about: A brief professional summary (string)
- projects: Array of objects with {projectName, projectDescription, projectLink}
- workHistory: Array of objects with {companyName, jobTitle, startDate, endDate, jobDescription}
- certificates: Array of objects with {name, issuer, issueDate}
- education: Array of objects with {institution, degree, fieldOfStudy, startDate, endDate}
- skills: Array of skill name strings

CV Text:
{$content}
PROMPT;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a CV parser. Return only valid JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.1,
                'response_format' => ['type' => 'json_object'],
            ]);

            if ($response->successful()) {
                $result = $response->json('choices.0.message.content');
                return json_decode($result, true);
            }
        } catch (\Exception $e) {
            report($e);
        }

        return null;
    }

    private function extractText(UploadedFile $file): ?string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'pdf') {
            return $this->extractFromPdf($file);
        }

        // For doc/docx, read raw text (basic extraction)
        return file_get_contents($file->getRealPath());
    }

    private function extractFromPdf(UploadedFile $file): ?string
    {
        // Basic PDF text extraction using shell command if available
        $path = $file->getRealPath();
        $output = shell_exec("pdftotext '{$path}' - 2>/dev/null");

        if ($output) {
            return $output;
        }

        // Fallback: read raw content
        return file_get_contents($path);
    }
}
