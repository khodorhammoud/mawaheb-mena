<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Enums\Provider;
use App\Enums\EmployerAccountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    public function redirectFreelancer()
    {
        return Socialite::driver('google')
            ->redirectUrl(config('services.google.freelancer_redirect'))
            ->redirect();
    }

    public function redirectEmployer()
    {
        return Socialite::driver('google')
            ->redirectUrl(config('services.google.employer_redirect'))
            ->redirect();
    }

    public function callbackFreelancer(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl(config('services.google.freelancer_redirect'))
                ->user();
        } catch (\Exception $e) {
            return redirect()->route('login.freelancer')
                ->with('error', 'Google authentication failed.');
        }

        return $this->handleGoogleCallback($googleUser, 'freelancer');
    }

    public function callbackEmployer(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl(config('services.google.employer_redirect'))
                ->user();
        } catch (\Exception $e) {
            return redirect()->route('login.employer')
                ->with('error', 'Google authentication failed.');
        }

        return $this->handleGoogleCallback($googleUser, 'employer');
    }

    private function handleGoogleCallback($googleUser, string $accountType)
    {
        $email = $googleUser->getEmail();
        if (!$email) {
            return redirect()->route("login.{$accountType}")
                ->with('error', 'No email found in Google profile.');
        }

        $profileInfo = $this->userService->getProfileInfo($email);

        if ($profileInfo) {
            $user = $profileInfo['user'];
            $socialAccount = $this->userService->getSocialAccount($user->id, 'google');

            if (!$socialAccount) {
                $this->userService->createSocialAccount([
                    'user_id' => $user->id,
                    'provider' => 'google',
                    'provider_account_id' => $googleUser->getId(),
                    'profile_url' => $googleUser->getAvatar(),
                    'access_token' => $googleUser->token,
                    'refresh_token' => $googleUser->refreshToken,
                    'expires_at' => $googleUser->expiresIn ? now()->addSeconds($googleUser->expiresIn) : null,
                ]);
            }

            Auth::login($user);
            return redirect()->route('dashboard');
        }

        if ($accountType === 'freelancer') {
            $result = $this->userService->registerFreelancer([
                'first_name' => $googleUser->user['given_name'] ?? '',
                'last_name' => $googleUser->user['family_name'] ?? '',
                'email' => $email,
            ], Provider::SocialAccount);
        } else {
            $result = $this->userService->registerEmployer([
                'first_name' => $googleUser->user['given_name'] ?? '',
                'last_name' => $googleUser->user['family_name'] ?? '',
                'email' => $email,
            ], Provider::SocialAccount, EmployerAccountType::Personal);
        }

        $this->userService->verifyUserAccount($result['user']->id);
        $this->userService->createSocialAccount([
            'user_id' => $result['user']->id,
            'provider' => 'google',
            'provider_account_id' => $googleUser->getId(),
            'profile_url' => $googleUser->getAvatar(),
            'access_token' => $googleUser->token,
            'refresh_token' => $googleUser->refreshToken,
            'expires_at' => $googleUser->expiresIn ? now()->addSeconds($googleUser->expiresIn) : null,
        ]);

        Auth::login($result['user']);
        return redirect()->route('onboarding');
    }
}
