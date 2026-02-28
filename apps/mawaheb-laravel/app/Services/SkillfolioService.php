<?php

namespace App\Services;

use App\Models\User;
use App\Models\Account;
use App\Models\Freelancer;
use App\Models\FreelancerSkill;
use App\Models\Skillfolio;
use Illuminate\Support\Facades\DB;

class SkillfolioService
{
    public function __construct(
        private readonly Neo4jService $neo4jService,
    ) {}

    public function extractSkillfolio(int $userId): ?Skillfolio
    {
        $userData = $this->getUserData($userId);
        if (!$userData) {
            return null;
        }

        $profileData = $this->extractProfileData($userData);
        $knowledgeMap = $this->neo4jService->mapProfileToKnowledge($profileData['skills']);
        $readinessScore = $this->calculateReadinessScore($profileData, $knowledgeMap);

        return $this->saveSkillfolio($userId, $knowledgeMap, $readinessScore, $profileData);
    }

    private function getUserData(int $userId): ?array
    {
        $user = User::with([
            'account.freelancer.skills',
            'account.freelancer.languages',
        ])->find($userId);

        if (!$user || !$user->account || !$user->account->freelancer) {
            return null;
        }

        return [
            'user' => $user,
            'account' => $user->account,
            'freelancer' => $user->account->freelancer,
        ];
    }

    private function extractProfileData(array $userData): array
    {
        $freelancer = $userData['freelancer'];

        $skills = $freelancer->skills->pluck('label')->filter()->values()->toArray();

        $tools = $this->extractToolsFromPortfolioAndWork(
            is_array($freelancer->portfolio) ? $freelancer->portfolio : [],
            is_array($freelancer->work_history) ? $freelancer->work_history : []
        );

        $certifications = [];
        if (is_array($freelancer->certificates)) {
            $certifications = array_map(fn ($c) => $c['certificateName'] ?? $c['name'] ?? '', $freelancer->certificates);
        }

        return [
            'skills' => $skills,
            'tools' => $tools,
            'certifications' => array_filter($certifications),
            'yearsOfExperience' => $freelancer->years_of_experience ?? 0,
            'about' => $freelancer->about ?? '',
            'portfolio' => $freelancer->portfolio ?? [],
            'workHistory' => $freelancer->work_history ?? [],
            'educations' => $freelancer->educations ?? [],
        ];
    }

    private function extractToolsFromPortfolioAndWork(array $portfolio, array $workHistory): array
    {
        $tools = [];
        $commonTools = [
            'git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'jenkins',
            'jira', 'figma', 'sketch', 'photoshop', 'illustrator', 'postman',
            'vscode', 'intellij', 'xcode', 'android studio', 'terraform',
            'ansible', 'nginx', 'apache', 'redis', 'mongodb', 'postgresql',
            'mysql', 'elasticsearch', 'grafana', 'prometheus', 'slack',
        ];

        $allText = '';
        foreach ($portfolio as $item) {
            $allText .= ' ' . ($item['projectDescription'] ?? '');
        }
        foreach ($workHistory as $item) {
            $allText .= ' ' . ($item['jobDescription'] ?? '');
        }

        $allTextLower = strtolower($allText);
        foreach ($commonTools as $tool) {
            if (str_contains($allTextLower, $tool)) {
                $tools[] = $tool;
            }
        }

        return array_unique($tools);
    }

    private function calculateReadinessScore(array $profileData, array $knowledgeMap): int
    {
        $score = 0;
        $maxScore = 100;

        // Skills coverage (40 points)
        $totalRequired = count($knowledgeMap['strengths']) + count($knowledgeMap['gaps']);
        if ($totalRequired > 0) {
            $score += (int) ((count($knowledgeMap['strengths']) / $totalRequired) * 40);
        }

        // Experience (20 points)
        $years = $profileData['yearsOfExperience'];
        $score += min(20, $years * 3);

        // Portfolio (15 points)
        $portfolioCount = count($profileData['portfolio']);
        $score += min(15, $portfolioCount * 5);

        // Work history (15 points)
        $workCount = count($profileData['workHistory']);
        $score += min(15, $workCount * 5);

        // Certifications (10 points)
        $certCount = count($profileData['certifications']);
        $score += min(10, $certCount * 5);

        return min($maxScore, $score);
    }

    private function saveSkillfolio(int $userId, array $knowledgeMap, int $readinessScore, array $profileData): Skillfolio
    {
        return Skillfolio::updateOrCreate(
            ['user_id' => $userId],
            [
                'domain' => $knowledgeMap['domain'],
                'field' => $knowledgeMap['field'],
                'category' => $knowledgeMap['category'],
                'subfield' => $knowledgeMap['subfield'],
                'readiness_score' => $readinessScore,
                'strengths' => $knowledgeMap['strengths'],
                'weaknesses' => $knowledgeMap['weaknesses'],
                'gaps' => $knowledgeMap['gaps'],
                'profile' => $profileData,
                'updated_at' => now(),
            ]
        );
    }

    public function getStoredSkillfolio(int $userId): ?Skillfolio
    {
        return Skillfolio::where('user_id', $userId)->first();
    }
}
