<?php

namespace App\Repositories;

use App\Models\Test;
use App\Models\TestAttempt;
use Carbon\Carbon;

class TestAttemptRepository
{
    public function store(
        array $data
    ): TestAttempt {
        return TestAttempt::create([
            'user_id' => $data['user_id'],
            'test_id' => $data['test_id'],
            'attempt' => $data['attempt'],

            'has_passed' => $data['has_passed'],
            'content' => $data['content'],

            'user_points' => $data['user_points'],
            'percent' => $data['percent'],
            'grade' => $data['grade'],
        ]);
    }

    public function getCompletedTests(int $userId)
    {
        return Test::select(['id', 'title', 'description', 'content', 'user_id', 'created_at', 'updated_at'])
            ->whereHas('testAttempts', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->withCount(['testAttempts' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->withMax(['testAttempts as latest_attempt' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }], 'created_at')
            ->orderByDesc('latest_attempt')
            ->paginate(6, ['*'], 'passed_page')
            ->through(function ($test) {
                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'user_id' => $test->user_id,
                    'created_at' => $this->formatTimestamp($test->created_at),
                    'updated_at' => $this->formatTimestamp($test->updated_at),

                    // Completed test dynamic payloads:
                    'attempts_count' => $test->test_attempts_count,
                    'latest_attempt_at' => $this->formatTimestamp($test->latest_attempt),
                    'questions_count' => count($test->content ?? []),
                    'is_new' => $test->created_at?->gt(now()->subDays(3)) ?? false,
                    'badge_color' => 'green',
                ];
            });
    }

    public function getAvailableTests(int $userId)
    {
        return Test::select(['id', 'title', 'description', 'content', 'user_id', 'created_at', 'updated_at'])
            ->where('user_id', '!=', $userId)
            ->whereDoesntHave('testAttempts', fn($q) => $q->where('user_id', $userId))
            ->latest()
            ->paginate(6, ['*'], 'available_page')
            ->through(function ($test) {
                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'user_id' => $test->user_id,
                    'created_at' => $this->formatTimestamp($test->created_at),
                    'updated_at' => $this->formatTimestamp($test->updated_at),

                    // Independent dynamic payloads:
                    'questions_count' => count($test->content ?? []),
                    'is_new' => $test->created_at?->gt(now()->subDays(3)) ?? false,
                    'badge_color' => 'amber',
                ];
            });
    }

    public function getMyTests(int $userId)
    {
        return Test::select(['id', 'title', 'description', 'content', 'user_id', 'created_at', 'updated_at'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate(6, ['*'], 'my_page')
            ->through(function ($test) {
                return [
                    'id' => $test->id,
                    'title' => $test->title,
                    'description' => $test->description,
                    'user_id' => $test->user_id,
                    'created_at' => $this->formatTimestamp($test->created_at),
                    'updated_at' => $this->formatTimestamp($test->updated_at),

                    // Author/Owner dynamic payloads:
                    'questions_count' => count($test->content ?? []),
                    'is_new' => $test->created_at?->gt(now()->subDays(3)) ?? false,
                    'badge_color' => 'blue',
                ];
            });
    }

    /**
     * Format a given date timestamp safely to ISO 8601 string format.
     */
    private function formatTimestamp(mixed $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        return Carbon::parse($date)
            ->setTimezone('Europe/Moscow')
            ->locale('ru')
            ->isoFormat('D MMMM YYYY HH:mm') . ' МСК';
    }
}
