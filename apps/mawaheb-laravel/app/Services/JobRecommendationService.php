<?php

namespace App\Services;

use App\Models\Freelancer;
use App\Models\Job;
use Illuminate\Support\Collection;

class JobRecommendationService
{
    public function getRecommendations(Freelancer $freelancer, int $limit = 10): Collection
    {
        $freelancer->load(['skills', 'languages', 'account']);

        $freelancerSkillIds = $freelancer->skills->pluck('id')->toArray();
        $freelancerLanguageIds = $freelancer->languages->pluck('id')->toArray();

        $jobs = Job::with(['employer.account', 'skills', 'category'])
            ->where('status', 'active')
            ->whereDoesntHave('applications', function ($q) use ($freelancer) {
                $q->where('freelancer_id', $freelancer->id);
            })
            ->get();

        $scored = $jobs->map(function ($job) use ($freelancer, $freelancerSkillIds) {
            $score = $this->calculateMatchScore($job, $freelancer, $freelancerSkillIds);
            $job->match_score = $score;
            return $job;
        });

        return $scored->sortByDesc('match_score')->take($limit)->values();
    }

    private function calculateMatchScore(Job $job, Freelancer $freelancer, array $freelancerSkillIds): float
    {
        $score = 0;
        $maxScore = 0;

        // Skill match (40% weight)
        $jobSkillIds = $job->skills->pluck('id')->toArray();
        if (count($jobSkillIds) > 0) {
            $matchingSkills = count(array_intersect($freelancerSkillIds, $jobSkillIds));
            $skillScore = ($matchingSkills / count($jobSkillIds)) * 40;
            $score += $skillScore;
        }
        $maxScore += 40;

        // Experience level match (20% weight)
        if ($job->experience_level && $freelancer->years_of_experience !== null) {
            $levelMap = [
                'entry_level' => [0, 2],
                'mid_level' => [3, 6],
                'senior_level' => [7, 100],
            ];

            if (isset($levelMap[$job->experience_level])) {
                [$min, $max] = $levelMap[$job->experience_level];
                if ($freelancer->years_of_experience >= $min && $freelancer->years_of_experience <= $max) {
                    $score += 20;
                } elseif ($freelancer->years_of_experience > $max) {
                    $score += 10; // overqualified still gets partial credit
                }
            }
        }
        $maxScore += 20;

        // Project type match (15% weight)
        if ($job->project_type && is_array($freelancer->preferred_project_types)) {
            if (in_array($job->project_type, $freelancer->preferred_project_types)) {
                $score += 15;
            }
        }
        $maxScore += 15;

        // Location match (10% weight)
        if ($job->location_preference === 'remote') {
            $score += 10; // remote is always a match
        } elseif ($job->location_preference && $freelancer->account?->country) {
            $score += 5; // partial match for onsite/mixed
        }
        $maxScore += 10;

        // Budget/rate match (15% weight)
        if ($freelancer->hourly_rate && $job->expected_hourly_rate) {
            $diff = abs($freelancer->hourly_rate - $job->expected_hourly_rate);
            $tolerance = max($freelancer->hourly_rate, $job->expected_hourly_rate) * 0.3;
            if ($diff <= $tolerance) {
                $score += 15;
            } elseif ($diff <= $tolerance * 2) {
                $score += 7;
            }
        }
        $maxScore += 15;

        return $maxScore > 0 ? round(($score / $maxScore) * 100) : 0;
    }
}
