<?php

namespace App\Services;

use App\Models\User;
use App\Models\Account;
use App\Models\Freelancer;
use App\Models\Employer;
use App\Models\SocialAccount;
use App\Models\UserVerification;
use App\Enums\AccountStatus;
use App\Enums\AccountType;
use App\Enums\Provider;
use App\Enums\EmployerAccountType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    public function registerFreelancer(array $data, Provider $provider = Provider::Credentials): array
    {
        return DB::transaction(function () use ($data, $provider) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => strtolower(trim($data['email'])),
                'password_hash' => isset($data['password']) ? Hash::make($data['password']) : null,
                'is_verified' => false,
                'is_onboarded' => false,
                'provider' => $provider->value,
                'role' => 'user',
            ]);

            $slug = Str::slug($data['first_name'] . '-' . $data['last_name'] . '-' . $user->id);

            $account = Account::create([
                'user_id' => $user->id,
                'slug' => $slug,
                'account_type' => AccountType::Freelancer->value,
                'account_status' => AccountStatus::Draft->value,
                'is_creation_complete' => false,
            ]);

            $freelancer = Freelancer::create([
                'account_id' => $account->id,
            ]);

            return [
                'user' => $user,
                'account' => $account,
                'freelancer' => $freelancer,
            ];
        });
    }

    public function registerEmployer(array $data, Provider $provider = Provider::Credentials, ?EmployerAccountType $employerType = null): array
    {
        return DB::transaction(function () use ($data, $provider, $employerType) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => strtolower(trim($data['email'])),
                'password_hash' => isset($data['password']) ? Hash::make($data['password']) : null,
                'is_verified' => false,
                'is_onboarded' => false,
                'provider' => $provider->value,
                'role' => 'user',
            ]);

            $slug = Str::slug($data['first_name'] . '-' . $data['last_name'] . '-' . $user->id);

            $account = Account::create([
                'user_id' => $user->id,
                'slug' => $slug,
                'account_type' => AccountType::Employer->value,
                'account_status' => AccountStatus::Draft->value,
                'is_creation_complete' => false,
            ]);

            $employer = Employer::create([
                'account_id' => $account->id,
                'employerAccountType' => $employerType?->value ?? EmployerAccountType::Personal->value,
            ]);

            return [
                'user' => $user,
                'account' => $account,
                'employer' => $employer,
            ];
        });
    }

    public function getProfileInfo(string $email): ?array
    {
        $user = User::where('email', strtolower(trim($email)))->first();
        if (!$user) {
            return null;
        }

        $account = $user->account;
        if (!$account) {
            return null;
        }

        $profile = null;
        if ($account->account_type === AccountType::Freelancer->value) {
            $profile = $account->freelancer;
        } elseif ($account->account_type === AccountType::Employer->value) {
            $profile = $account->employer;
        }

        return [
            'user' => $user,
            'account' => $account,
            'profile' => $profile,
        ];
    }

    public function verifyUserAccount(int $userId): bool
    {
        return User::where('id', $userId)->update(['is_verified' => true]) > 0;
    }

    public function updateOnboardingStatus(int $userId): bool
    {
        return User::where('id', $userId)->update(['is_onboarded' => true]) > 0;
    }

    public function createVerificationToken(int $userId): string
    {
        $token = Str::random(64);

        UserVerification::create([
            'user_id' => $userId,
            'token' => $token,
            'expiry' => now()->addHours(24),
            'is_used' => false,
            'created_at' => now(),
        ]);

        return $token;
    }

    public function verifyToken(string $token): ?User
    {
        $verification = UserVerification::where('token', $token)
            ->where('is_used', false)
            ->where('expiry', '>', now())
            ->first();

        if (!$verification) {
            return null;
        }

        $verification->update(['is_used' => true]);
        $user = User::find($verification->user_id);

        if ($user) {
            $user->update(['is_verified' => true]);
        }

        return $user;
    }

    public function createSocialAccount(array $data): SocialAccount
    {
        return SocialAccount::create($data);
    }

    public function getSocialAccount(int $userId, string $provider): ?SocialAccount
    {
        return SocialAccount::where('user_id', $userId)
            ->where('provider', $provider)
            ->first();
    }

    public function updatePassword(int $userId, string $newPassword): bool
    {
        return User::where('id', $userId)->update([
            'password_hash' => Hash::make($newPassword),
        ]) > 0;
    }

    public function deactivateAccount(int $userId): bool
    {
        $account = Account::where('user_id', $userId)->first();
        if (!$account) {
            return false;
        }

        return $account->update([
            'account_status' => AccountStatus::Deactivated->value,
        ]);
    }

    public function reactivateAccount(int $userId): bool
    {
        $account = Account::where('user_id', $userId)->first();
        if (!$account) {
            return false;
        }

        return $account->update([
            'account_status' => AccountStatus::Draft->value,
        ]);
    }

    public function requestDeletion(int $userId, ?string $feedback = null): bool
    {
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        $user->update([
            'deletion_requested_at' => now(),
            'final_deletion_at' => now()->addDays(30),
        ]);

        if ($feedback) {
            \App\Models\ExitFeedback::create([
                'user_id' => $userId,
                'feedback' => $feedback,
                'created_at' => now(),
            ]);
        }

        return true;
    }

    public function getUserSettings(int $userId): array
    {
        $user = User::with(['account'])->find($userId);
        if (!$user) {
            return [];
        }

        return [
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'account_status' => $user->account?->account_status,
            'deletion_requested_at' => $user->deletion_requested_at,
        ];
    }
}
