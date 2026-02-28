<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployerController;
use App\Http\Controllers\FreelancerController;
use App\Http\Controllers\IdentificationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SkillfolioController;
use App\Http\Controllers\TimesheetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/for-employers', [PublicController::class, 'forEmployers'])->name('for-employers');
Route::get('/for-freelancers', [PublicController::class, 'forFreelancers'])->name('for-freelancers');
Route::get('/about-us', [PublicController::class, 'aboutUs'])->name('about-us');
Route::get('/contact-us', [PublicController::class, 'contactUs'])->name('contact-us');
Route::post('/contact-us', [PublicController::class, 'submitContactForm'])->name('contact-us.submit');
Route::get('/health', [PublicController::class, 'health'])->name('health');

/*
|--------------------------------------------------------------------------
| Auth Routes (Guest)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/signup-freelancer', [RegisterController::class, 'showFreelancerForm'])->name('signup.freelancer');
    Route::post('/signup-freelancer', [RegisterController::class, 'registerFreelancer'])->name('signup.freelancer.submit');

    Route::get('/signup-employer', [RegisterController::class, 'showEmployerForm'])->name('signup.employer');
    Route::post('/signup-employer', [RegisterController::class, 'registerEmployer'])->name('signup.employer.submit');

    Route::get('/login-freelancer', [LoginController::class, 'showFreelancerForm'])->name('login.freelancer');
    Route::get('/login-employer', [LoginController::class, 'showEmployerForm'])->name('login.employer');
    Route::get('/login-admin', [LoginController::class, 'showAdminForm'])->name('login.admin');
    Route::post('/login', [LoginController::class, 'login'])->name('login');

    // Google OAuth
    Route::get('/auth/google/freelancer', [GoogleController::class, 'redirectFreelancer'])->name('auth.google.freelancer');
    Route::get('/auth/google/employer', [GoogleController::class, 'redirectEmployer'])->name('auth.google.employer');
    Route::get('/auth/google/freelancer/callback', [GoogleController::class, 'callbackFreelancer'])->name('auth.google.freelancer.callback');
    Route::get('/auth/google/employer/callback', [GoogleController::class, 'callbackEmployer'])->name('auth.google.employer.callback');
});

Route::post('/auth/logout', [LoginController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    // Verify Account
    Route::get('/verify-account', fn () => \Inertia\Inertia::render('Auth/VerifyAccount'))->name('verify-account');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Onboarding
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');

    // Freelancer routes
    Route::prefix('freelancer')->name('freelancer.')->group(function () {
        Route::post('/bio', [FreelancerController::class, 'updateBio'])->name('bio');
        Route::post('/about', [FreelancerController::class, 'updateAbout'])->name('about');
        Route::post('/skills', [FreelancerController::class, 'updateSkills'])->name('skills');
        Route::post('/languages', [FreelancerController::class, 'updateLanguages'])->name('languages');
        Route::post('/portfolio', [FreelancerController::class, 'updatePortfolio'])->name('portfolio');
        Route::post('/work-history', [FreelancerController::class, 'updateWorkHistory'])->name('work-history');
        Route::post('/certificates', [FreelancerController::class, 'updateCertificates'])->name('certificates');
        Route::post('/education', [FreelancerController::class, 'updateEducation'])->name('education');
        Route::post('/hourly-rate', [FreelancerController::class, 'updateHourlyRate'])->name('hourly-rate');
        Route::post('/years-of-experience', [FreelancerController::class, 'updateYearsOfExperience'])->name('years-of-experience');
        Route::post('/availability', [FreelancerController::class, 'updateAvailability'])->name('availability');
        Route::post('/video', [FreelancerController::class, 'updateVideo'])->name('video');
        Route::post('/parse-cv', [FreelancerController::class, 'parseCV'])->name('parse-cv');
        Route::post('/complete-onboarding', [FreelancerController::class, 'completeOnboarding'])->name('complete-onboarding');
    });

    // Employer routes
    Route::prefix('employer')->name('employer.')->group(function () {
        Route::post('/bio', [EmployerController::class, 'updateBio'])->name('bio');
        Route::post('/about', [EmployerController::class, 'updateAbout'])->name('about');
        Route::post('/industries', [EmployerController::class, 'updateIndustries'])->name('industries');
        Route::post('/budget', [EmployerController::class, 'updateBudget'])->name('budget');
        Route::post('/identification', [EmployerController::class, 'updateIdentification'])->name('identification');
        Route::post('/complete-onboarding', [EmployerController::class, 'completeOnboarding'])->name('complete-onboarding');
    });

    // Identification
    Route::get('/identification', [IdentificationController::class, 'index'])->name('identification');
    Route::post('/identification', [IdentificationController::class, 'store'])->name('identification.store');
    Route::get('/identifying', [IdentificationController::class, 'index'])->name('identifying');

    // Jobs
    Route::get('/browse-jobs', [JobController::class, 'index'])->name('browse-jobs');
    Route::get('/jobs/{jobId}', [JobController::class, 'show'])->name('jobs.show');
    Route::get('/new-job', [JobController::class, 'create'])->name('new-job');
    Route::post('/new-job', [JobController::class, 'store'])->name('jobs.store');
    Route::get('/edit-job/{jobId}', [JobController::class, 'edit'])->name('jobs.edit');
    Route::put('/edit-job/{jobId}', [JobController::class, 'update'])->name('jobs.update');
    Route::get('/manage-jobs', [JobController::class, 'manageJobs'])->name('manage-jobs');
    Route::post('/jobs/{jobId}/apply', [JobController::class, 'apply'])->name('jobs.apply');
    Route::put('/applications/{applicationId}/status', [JobController::class, 'updateApplicationStatus'])->name('applications.status');
    Route::get('/jobs/{jobId}/applicants', [JobController::class, 'applicants'])->name('jobs.applicants');

    // Timesheets
    Route::get('/timesheets', [TimesheetController::class, 'index'])->name('timesheets');
    Route::post('/timesheets/entries', [TimesheetController::class, 'storeEntry'])->name('timesheets.entries.store');
    Route::put('/timesheets/entries/{entryId}', [TimesheetController::class, 'updateEntry'])->name('timesheets.entries.update');
    Route::delete('/timesheets/entries/{entryId}', [TimesheetController::class, 'deleteEntry'])->name('timesheets.entries.delete');
    Route::post('/timesheets/submit-week', [TimesheetController::class, 'submitWeek'])->name('timesheets.submit-week');
    Route::post('/timesheets/{weekId}/approve', [TimesheetController::class, 'approveWeek'])->name('timesheets.approve');
    Route::post('/timesheets/{weekId}/review', [TimesheetController::class, 'reviewWeek'])->name('timesheets.review');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    Route::get('/notification/{notificationId}', [NotificationController::class, 'show'])->name('notifications.show');
    Route::post('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/events/notifications', [NotificationController::class, 'stream'])->name('notifications.stream');

    // Skillfolio
    Route::get('/skillfolio', [SkillfolioController::class, 'show'])->name('skillfolio');
    Route::post('/skillfolio/trigger', [SkillfolioController::class, 'trigger'])->name('skillfolio.trigger');
    Route::post('/skillfolio/extract', [SkillfolioController::class, 'extract'])->name('skillfolio.extract');

    // Profile
    Route::get('/account/{slug}', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/reviews', [ProfileController::class, 'storeReview'])->name('reviews.store');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
    Route::post('/settings/deactivate', [SettingsController::class, 'deactivateAccount'])->name('settings.deactivate');
    Route::post('/settings/delete', [SettingsController::class, 'requestDeletion'])->name('settings.delete');
    Route::get('/settings/export', [SettingsController::class, 'exportData'])->name('settings.export');

    // Reports
    Route::get('/reports', fn () => \Inertia\Inertia::render('Reports/Index'))->name('reports');

    // Attachments
    Route::get('/view/attachment/{attachmentId}', [AttachmentController::class, 'show'])->name('attachment.show');
    Route::delete('/attachment/{attachmentId}', [AttachmentController::class, 'destroy'])->name('attachment.destroy');

    // Admin routes
    Route::middleware('can:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/pending-accounts', [AdminController::class, 'pendingAccounts'])->name('pending-accounts');
        Route::post('/accounts/{accountId}/approve', [AdminController::class, 'approveAccount'])->name('accounts.approve');
        Route::post('/accounts/{accountId}/reject', [AdminController::class, 'rejectAccount'])->name('accounts.reject');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
    });
});
