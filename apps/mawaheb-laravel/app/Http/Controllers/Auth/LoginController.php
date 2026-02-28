<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function showFreelancerForm()
    {
        return Inertia::render('Auth/LoginFreelancer');
    }

    public function showEmployerForm()
    {
        return Inertia::render('Auth/LoginEmployer');
    }

    public function showAdminForm()
    {
        return Inertia::render('Auth/LoginAdmin');
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower(trim($validated['email'])))->first();

        if (!$user || !$user->password_hash || !Hash::check($validated['password'], $user->password_hash)) {
            return back()->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        if (!$user->is_verified) {
            return redirect()->route('verify-account');
        }

        if (!$user->is_onboarded) {
            return redirect()->route('onboarding');
        }

        return redirect()->route('dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
