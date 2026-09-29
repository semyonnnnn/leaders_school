<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Auth;

class TestService
{
    public function getData(array $data): array
    {
        $questions = $data['questions'] ?? [];
        $minPoints = $this->calculateScores($questions)['minPoints'];
        $maxPoints = $this->calculateScores($questions)['maxPoints'];

        return [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'content' => $questions,
            'minPoints' => $minPoints,
            'maxPoints' => $maxPoints,
            'user_id' => Auth::id(),
        ];
    }

    public function calculateScores(?array $questions): array
    {
        $questions = $questions ?? [];

        $totalPoints = collect($questions)->sum('value');

        // Fetch the threshold value dynamically from the database, falling back to 0.8 if missing
        $thresholdValue = Setting::where('key', 'passing_threshold_percentage')->value('value');
        $thresholdPercentage = $thresholdValue !== null ? (float) $thresholdValue : 0.8;

        $targetThreshold = $totalPoints * $thresholdPercentage;

        $possibleScores = [0];

        foreach ($questions as $q) {
            $questionValue = (int) ($q['value'] ?? 0);
            $nextSums = [];

            foreach ($possibleScores as $s) {
                $nextSums[] = $s;
                $nextSums[] = $s + $questionValue;
            }

            $possibleScores = array_unique($nextSums);
        }

        sort($possibleScores);

        $passingScore = $totalPoints;
        foreach ($possibleScores as $score) {
            if ($score >= $targetThreshold) {
                $passingScore = $score;
                break;
            }
        }

        return ['minPoints' => $passingScore, 'maxPoints' => $totalPoints];
    }
}
