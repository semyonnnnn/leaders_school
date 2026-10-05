<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
///////////////////////////////
use App\Models\TestAttempt;
use App\Models\Setting;
use App\Models\Test;
use Illuminate\Database\Eloquent\Collection;


class TestService
{
    public function store(array $data): Test
    {
        return DB::transaction(function () use ($data) {
            $questions = $data['questions'] ?? [];
            $scores = $this->calculateScores($questions);

            // 1. Create the Test record
            $test = Test::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'content' => $questions,
                'minPoints' => $scores['minPoints'],
                'maxPoints' => $scores['maxPoints'],
                'user_id' => Auth::id(),
            ]);

            // 2. Sync associated materials via Eloquent pivot relationship
            if (!empty($data['material_ids'])) {
                $test->materials()->sync($data['material_ids']);
            }

            return $test;
        });
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

    public function maxAttemptsReached(int $testId, int $userId): bool
    {
        $maxAttempts = Setting::where('key', 'max_attempts')->value('value');

        return TestAttempt::where('test_id', $testId)
            ->where('user_id', $userId)
            ->where('attempt', '>=', $maxAttempts)
            ->exists();
    }
    public static function getMaterialsWithLink(Collection $materials): array
    {
        $baseUrl = rtrim(config('app.url'), '/');

        return $materials->map(fn($material) => [
            'id' => $material->id,
            'title' => $material->title,
            'link' => "{$baseUrl}/materials/{$material->id}",
        ])->all();
    }
}
