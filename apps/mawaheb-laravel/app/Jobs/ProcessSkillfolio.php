<?php

namespace App\Jobs;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Services\SkillfolioService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessSkillfolio implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private readonly int $userId,
    ) {}

    public function handle(SkillfolioService $skillfolioService): void
    {
        Notification::create([
            'user_id' => $this->userId,
            'type' => NotificationType::StatusUpdate->value,
            'title' => 'Skillfolio Generation Started',
            'message' => 'Your skillfolio is being generated. This may take a moment.',
            'payload' => ['status' => 'started'],
        ]);

        try {
            $skillfolio = $skillfolioService->extractSkillfolio($this->userId);

            if ($skillfolio) {
                Notification::create([
                    'user_id' => $this->userId,
                    'type' => NotificationType::StatusUpdate->value,
                    'title' => 'Skillfolio Ready',
                    'message' => "Your skillfolio has been generated with a readiness score of {$skillfolio->readiness_score}%.",
                    'payload' => [
                        'status' => 'completed',
                        'readinessScore' => $skillfolio->readiness_score,
                    ],
                ]);
            }
        } catch (\Exception $e) {
            Notification::create([
                'user_id' => $this->userId,
                'type' => NotificationType::Alert->value,
                'title' => 'Skillfolio Generation Failed',
                'message' => 'There was an error generating your skillfolio. Please try again later.',
                'payload' => ['status' => 'failed', 'error' => $e->getMessage()],
            ]);

            throw $e;
        }
    }

    public function uniqueId(): string
    {
        return "skillfolio-{$this->userId}";
    }
}
