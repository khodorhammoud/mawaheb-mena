<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Enums\Provider;
use App\Enums\EmployerAccountType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    public function showFreelancerForm()
    {
        return Inertia::render('Auth/SignupFreelancer');
    }

    public function showEmployerForm()
    {
        return Inertia::render('Auth/SignupEmployer');
    }

    public function registerFreelancer(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:80',
            'last_name' => 'required|string|max:80',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $result = $this->userService->registerFreelancer($validated, Provider::Credentials);
        $token = $this->userService->createVerificationToken($result['user']->id);

        // TODO: Send verification email with $token

        Auth::login($result['user']);

        return redirect()->route('verify-account');
    }

    public function registerEmployer(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:80',
            'last_name' => 'required|string|max:80',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'employer_account_type' => 'nullable|string',
        ]);

        $employerType = isset($validated['employer_account_type'])
            ? EmployerAccountType::tryFrom($validated['employer_account_type'])
            : EmployerAccountType::Personal;

        $result = $this->userService->registerEmployer($validated, Provider::Credentials, $employerType);
        $token = $this->userService->createVerificationToken($result['user']->id);

        // TODO: Send verification email with $token

        Auth::login($result['user']);

        return redirect()->route('verify-account');
    }
}
