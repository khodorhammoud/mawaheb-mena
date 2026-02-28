<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function home()
    {
        return Inertia::render('Public/Home');
    }

    public function forEmployers()
    {
        $cmsData = $this->fetchCmsContent('for-employers');

        return Inertia::render('Public/ForEmployers', [
            'cmsContent' => $cmsData,
        ]);
    }

    public function forFreelancers()
    {
        $cmsData = $this->fetchCmsContent('for-freelancers');

        return Inertia::render('Public/ForFreelancers', [
            'cmsContent' => $cmsData,
        ]);
    }

    public function aboutUs()
    {
        $cmsData = $this->fetchCmsContent('about-us');

        return Inertia::render('Public/AboutUs', [
            'cmsContent' => $cmsData,
        ]);
    }

    public function contactUs()
    {
        return Inertia::render('Public/ContactUs');
    }

    public function submitContactForm(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email',
            'message' => 'required|string|max:5000',
        ]);

        // TODO: Send email or store contact form submission

        return back()->with('success', 'Message sent successfully.');
    }

    public function health()
    {
        return response()->json(['status' => 'ok', 'timestamp' => now()->toISOString()]);
    }

    private function fetchCmsContent(string $slug): ?array
    {
        $cmsUrl = config('services.cms.api_url');
        if (!$cmsUrl) {
            return null;
        }

        try {
            $response = Http::timeout(5)->get("{$cmsUrl}/api/{$slug}");
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            report($e);
        }

        return null;
    }
}
