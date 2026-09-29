<?php

namespace App\Repositories;

use App\Models\Test;
use App\Models\TestAttempt;

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

    public function getPassedTests(int $userId)
    {
        return Test::whereHas('testAttempts', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->withCount('testAttempts')
            // Find the latest updated_at or created_at timestamp from the user's attempts on each test
            ->withMax(['testAttempts as latest_attempt' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }], 'created_at') // or 'updated_at' depending on your tracking
            // Order the tests table by that computed maximum timestamp from test_attempts
            ->orderByDesc('latest_attempt')
            ->paginate(6, ['*'], 'passed_page');
    }

    public function getAvailableTests(int $userId)
    {
        return Test::select(['id', 'title', 'description', 'user_id', 'questions_count', 'created_at'])
            ->where('user_id', '!=', $userId)
            ->whereDoesntHave('testAttempts', fn($q) => $q->where('user_id', $userId))
            ->latest()
            ->orderBy('id', 'desc')
            ->paginate(6, ['*'], 'available_page');
    }

    public function getMyTests(int $userId)
    {
        return Test::select(['id', 'title', 'description', 'user_id', 'questions_count', 'created_at'])
            ->where('user_id', $userId)
            ->latest()
            ->orderBy('id', 'desc')
            ->paginate(6, ['*'], 'my_page');
    }
}
