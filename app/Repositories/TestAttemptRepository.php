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
            ->withQueryString()
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
            ->withQueryString()
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
            ->withQueryString()
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
    public function getCompletedTest(int $testId, int $userId): ?array
    {
        $attempt = TestAttempt::with('test:id,title,description')
            ->where('test_id', $testId)
            ->where('user_id', $userId)
            ->latest()
            ->first();

        if (!$attempt) {
            return null;
        }

        // Strip correct_answer entirely — never sent to the frontend,
        // regardless of whether the question was answered correctly.
        $content = collect($attempt->content)->map(function ($question) {
            unset($question['correct_answer']);
            return $question;
        })->all();

        return [
            'id' => $attempt->id,
            'test_id' => $attempt->test_id,
            'user_id' => $attempt->user_id,
            'attempt' => $attempt->attempt,
            'has_passed' => $attempt->has_passed,
            'user_points' => $attempt->user_points,
            'percent' => $attempt->percent,
            'grade' => $attempt->grade,
            'content' => $content,
            'created_at' => $this->formatTimestamp($attempt->created_at),
            'updated_at' => $this->formatTimestamp($attempt->updated_at),
            'test' => [
                'id' => $attempt->test->id,
                'title' => $attempt->test->title,
                'description' => $attempt->test->description,
            ],
        ];
    }

    public function getAvailableTest(int $testId, int $userId): array
    {
        $test = Test::select(['id', 'title', 'description', 'content', 'minPoints', 'created_at'])
            ->where('user_id', '!=', $userId)
            ->findOrFail($testId);

        // Whitelist: only what Show.tsx renders. A new field added to a question
        // later (e.g. the correct answer) stays server-side by default.
        $questions = collect($test->content ?? [])->map(fn($q) => [
            'id' => $q['id'],
            'text' => $q['text'],
            'value' => $q['value'] ?? 0,
            'options' => collect($q['options'] ?? [])->map(fn($o) => [
                'id' => $o['id'],
                'text' => $o['text'],
            ])->values()->all(),
        ])->values()->all();

        return [
            'id' => $test->id,
            'title' => $test->title,
            'description' => $test->description,
            'minPoints' => $test->minPoints,
            'questions' => $questions,
            'created_at' => $this->formatTimestamp($test->created_at),
        ];
    }
}
