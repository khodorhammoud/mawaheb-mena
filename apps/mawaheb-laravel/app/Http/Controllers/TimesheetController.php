<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Enums\TimesheetStatus;
use App\Enums\NotificationType;
use App\Models\TimesheetDayEntry;
use App\Models\TimesheetWeekEntry;
use App\Models\JobApplication;
use App\Models\Job;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TimesheetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account;

        if ($account->account_type === AccountType::Freelancer->value) {
            return $this->freelancerTimesheets($request);
        }

        return $this->employerTimesheets($request);
    }

    private function freelancerTimesheets(Request $request)
    {
        $freelancer = $request->user()->account->freelancer;
        $jobApplicationId = $request->input('job_application_id');

        $approvedApplications = JobApplication::with(['job.employer.account'])
            ->where('freelancer_id', $freelancer->id)
            ->where('status', 'approved')
            ->get();

        $entries = [];
        $weekSubmissions = [];

        if ($jobApplicationId) {
            $weekStart = $request->input('week_start', Carbon::now()->startOfWeek(Carbon::MONDAY)->format('Y-m-d'));
            $weekEnd = Carbon::parse($weekStart)->addDays(6)->format('Y-m-d');

            $entries = TimesheetDayEntry::where('freelancer_id', $freelancer->id)
                ->where('job_application_id', $jobApplicationId)
                ->whereBetween('work_date', [$weekStart, $weekEnd])
                ->orderBy('work_date')
                ->get()
                ->map(fn ($entry) => $this->formatDayEntry($entry));

            $weekSubmissions = TimesheetWeekEntry::where('freelancer_id', $freelancer->id)
                ->where('job_application_id', $jobApplicationId)
                ->whereIn('status', [
                    TimesheetStatus::Submitted->value,
                    TimesheetStatus::Approved->value,
                    TimesheetStatus::Rejected->value,
                ])
                ->get();
        }

        return Inertia::render('Timesheets/Index', [
            'approvedApplications' => $approvedApplications,
            'entries' => $entries,
            'weekSubmissions' => $weekSubmissions,
            'selectedJobApplicationId' => $jobApplicationId,
            'accountType' => 'freelancer',
        ]);
    }

    private function employerTimesheets(Request $request)
    {
        $employer = $request->user()->account->employer;

        $submissions = TimesheetWeekEntry::with([
            'freelancer.account.user',
            'jobApplication.job',
        ])
            ->whereHas('jobApplication.job', function ($q) use ($employer) {
                $q->where('employer_id', $employer->id);
            })
            ->whereIn('status', [
                TimesheetStatus::Submitted->value,
                TimesheetStatus::Approved->value,
                TimesheetStatus::Rejected->value,
            ])
            ->latest('submission_date')
            ->paginate(20);

        return Inertia::render('Timesheets/Index', [
            'submissions' => $submissions,
            'accountType' => 'employer',
        ]);
    }

    public function storeEntry(Request $request)
    {
        $validated = $request->validate([
            'job_application_id' => 'required|integer|exists:job_applications,id',
            'date' => 'required|date|before_or_equal:today',
            'start_hour' => 'required|integer|min:1|max:12',
            'start_meridiem' => 'required|in:AM,PM',
            'end_hour' => 'required|integer|min:1|max:12',
            'end_meridiem' => 'required|in:AM,PM',
            'description' => 'nullable|string',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $startAt = $this->buildDateTime($validated['date'], $validated['start_hour'], $validated['start_meridiem']);
        $endAt = $this->buildDateTime($validated['date'], $validated['end_hour'], $validated['end_meridiem']);

        if ($endAt <= $startAt) {
            return back()->with('error', 'End time must be after start time.');
        }

        $hours = ($endAt->getTimestamp() - $startAt->getTimestamp()) / 3600;
        if ($hours > 8) {
            return back()->with('error', 'An entry cannot exceed 8 hours.');
        }

        $entry = TimesheetDayEntry::create([
            'freelancer_id' => $freelancer->id,
            'job_application_id' => $validated['job_application_id'],
            'work_date' => $validated['date'],
            'start_at' => $startAt,
            'end_at' => $endAt,
            'description' => $validated['description'] ?? '',
            'entry_status' => TimesheetStatus::Draft->value,
        ]);

        return back()->with('success', 'Entry added.');
    }

    public function updateEntry(Request $request, int $entryId)
    {
        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'start_hour' => 'required|integer|min:1|max:12',
            'start_meridiem' => 'required|in:AM,PM',
            'end_hour' => 'required|integer|min:1|max:12',
            'end_meridiem' => 'required|in:AM,PM',
            'description' => 'nullable|string',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $entry = TimesheetDayEntry::where('freelancer_id', $freelancer->id)
            ->findOrFail($entryId);

        $startAt = $this->buildDateTime($validated['date'], $validated['start_hour'], $validated['start_meridiem']);
        $endAt = $this->buildDateTime($validated['date'], $validated['end_hour'], $validated['end_meridiem']);

        if ($endAt <= $startAt) {
            return back()->with('error', 'End time must be after start time.');
        }

        $entry->update([
            'work_date' => $validated['date'],
            'start_at' => $startAt,
            'end_at' => $endAt,
            'description' => $validated['description'] ?? '',
        ]);

        return back()->with('success', 'Entry updated.');
    }

    public function deleteEntry(Request $request, int $entryId)
    {
        $freelancer = $request->user()->account->freelancer;
        TimesheetDayEntry::where('freelancer_id', $freelancer->id)
            ->where('id', $entryId)
            ->delete();

        return back()->with('success', 'Entry deleted.');
    }

    public function submitWeek(Request $request)
    {
        $validated = $request->validate([
            'job_application_id' => 'required|integer',
            'week_start' => 'required|date',
        ]);

        $freelancer = $request->user()->account->freelancer;
        $weekStart = $validated['week_start'];
        $weekEnd = Carbon::parse($weekStart)->addDays(6)->format('Y-m-d');

        $entries = TimesheetDayEntry::where('freelancer_id', $freelancer->id)
            ->where('job_application_id', $validated['job_application_id'])
            ->whereBetween('work_date', [$weekStart, $weekEnd])
            ->get();

        if ($entries->isEmpty()) {
            return back()->with('error', 'Cannot submit an empty week.');
        }

        $totalHours = $entries->sum(function ($e) {
            return ($e->end_at->getTimestamp() - $e->start_at->getTimestamp()) / 3600;
        });

        DB::transaction(function () use ($freelancer, $validated, $weekStart, $weekEnd, $entries, $totalHours, $request) {
            $week = TimesheetWeekEntry::create([
                'freelancer_id' => $freelancer->id,
                'job_application_id' => $validated['job_application_id'],
                'week_start' => $weekStart,
                'week_end' => $weekEnd,
                'submission_date' => now(),
                'total_hours' => $totalHours,
                'status' => TimesheetStatus::Submitted->value,
            ]);

            $week->dayEntries()->attach($entries->pluck('id'));

            TimesheetDayEntry::where('freelancer_id', $freelancer->id)
                ->where('job_application_id', $validated['job_application_id'])
                ->whereBetween('work_date', [$weekStart, $weekEnd])
                ->update(['entry_status' => TimesheetStatus::Submitted->value]);

            $this->sendTimesheetNotifications($week, $freelancer, $request->user()->id, 'submitted');
        });

        return back()->with('success', 'Week submitted successfully.');
    }

    public function approveWeek(Request $request, int $weekId)
    {
        $employer = $request->user()->account->employer;
        $week = TimesheetWeekEntry::findOrFail($weekId);

        $jobOwnership = Job::whereHas('applications', fn ($q) => $q->where('id', $week->job_application_id))
            ->where('employer_id', $employer->id)
            ->exists();

        if (!$jobOwnership) {
            abort(403, 'Unauthorized');
        }

        DB::transaction(function () use ($week, $request) {
            $week->update(['status' => TimesheetStatus::Approved->value]);

            TimesheetDayEntry::where('freelancer_id', $week->freelancer_id)
                ->where('job_application_id', $week->job_application_id)
                ->whereBetween('work_date', [$week->week_start, $week->week_end])
                ->update(['entry_status' => TimesheetStatus::Approved->value]);

            $this->sendTimesheetNotifications($week, $week->freelancer, $request->user()->id, 'approved');
        });

        return back()->with('success', 'Week approved.');
    }

    public function reviewWeek(Request $request, int $weekId)
    {
        $validated = $request->validate([
            'decisions' => 'required|array',
            'decisions.*.entry_id' => 'required|integer',
            'decisions.*.status' => 'required|in:accepted,rejected',
            'decisions.*.note' => 'nullable|string',
        ]);

        $employer = $request->user()->account->employer;
        $week = TimesheetWeekEntry::findOrFail($weekId);

        DB::transaction(function () use ($week, $validated, $request) {
            $week->update(['status' => TimesheetStatus::Rejected->value]);

            foreach ($validated['decisions'] as $decision) {
                $status = $decision['status'] === 'accepted'
                    ? TimesheetStatus::Approved->value
                    : TimesheetStatus::Rejected->value;

                $update = ['entry_status' => $status];
                if (isset($decision['note'])) {
                    $update['note'] = $decision['note'];
                }

                TimesheetDayEntry::where('id', $decision['entry_id'])->update($update);
            }

            $this->sendTimesheetNotifications($week, $week->freelancer, $request->user()->id, 'reviewed');
        });

        return back()->with('success', 'Review submitted.');
    }

    private function buildDateTime(string $date, int $hour12, string $meridiem): Carbon
    {
        $hour24 = ($hour12 % 12) + ($meridiem === 'PM' ? 12 : 0);
        return Carbon::parse($date)->setHour($hour24)->setMinute(0)->setSecond(0);
    }

    private function formatDayEntry($entry): array
    {
        $startAt = Carbon::parse($entry->start_at);
        $endAt = Carbon::parse($entry->end_at);

        return [
            'id' => $entry->id,
            'date' => $entry->work_date,
            'description' => $entry->description ?? '',
            'note' => $entry->note ?? '',
            'startAt' => $startAt->toISOString(),
            'endAt' => $endAt->toISOString(),
            'startHour' => (($startAt->hour + 11) % 12) + 1,
            'startMeridiem' => $startAt->hour >= 12 ? 'PM' : 'AM',
            'endHour' => (($endAt->hour + 11) % 12) + 1,
            'endMeridiem' => $endAt->hour >= 12 ? 'PM' : 'AM',
            'hours' => max(0, ($endAt->getTimestamp() - $startAt->getTimestamp()) / 3600),
            'entryStatus' => $entry->entry_status,
        ];
    }

    private function sendTimesheetNotifications(TimesheetWeekEntry $week, $freelancer, int $currentUserId, string $action): void
    {
        try {
            $jobApp = JobApplication::with(['job.employer.account.user'])->find($week->job_application_id);
            if (!$jobApp) return;

            $employerUser = $jobApp->job->employer->account->user;
            $freelancerUser = $freelancer->account->user ?? null;

            $weekRange = "{$week->week_start} to {$week->week_end}";

            match ($action) {
                'submitted' => $this->createNotificationPair(
                    $employerUser->id,
                    $currentUserId,
                    'Timesheet Submitted',
                    ($freelancerUser?->first_name ?? 'Freelancer') . " submitted timesheet for {$weekRange}.",
                    "Your timesheet for {$weekRange} has been submitted.",
                    ['timesheetId' => $week->id, 'weekStart' => $week->week_start, 'weekEnd' => $week->week_end]
                ),
                'approved' => $this->createNotificationPair(
                    $freelancerUser?->id ?? $freelancer->id,
                    $currentUserId,
                    'Timesheet Approved',
                    "Your timesheet for {$weekRange} has been approved.",
                    "You approved the timesheet for {$weekRange}.",
                    ['timesheetId' => $week->id]
                ),
                'reviewed' => $this->createNotificationPair(
                    $freelancerUser?->id ?? $freelancer->id,
                    $currentUserId,
                    'Timesheet Returned for Revision',
                    "Your timesheet for {$weekRange} needs revision.",
                    "You reviewed the timesheet for {$weekRange}.",
                    ['timesheetId' => $week->id]
                ),
                default => null,
            };
        } catch (\Exception $e) {
            report($e);
        }
    }

    private function createNotificationPair(int $recipientId, int $senderId, string $title, string $recipientMsg, string $senderMsg, array $payload): void
    {
        Notification::create([
            'user_id' => $recipientId,
            'type' => NotificationType::StatusUpdate->value,
            'title' => $title,
            'message' => $recipientMsg,
            'payload' => $payload,
        ]);

        Notification::create([
            'user_id' => $senderId,
            'type' => NotificationType::StatusUpdate->value,
            'title' => $title,
            'message' => $senderMsg,
            'payload' => $payload,
        ]);
    }
}
