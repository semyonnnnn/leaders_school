<?php

namespace App\Repositories;

use App\Models\Test;
use App\Models\TestAttempt;

class TestAttemptRepository
{
    public function store(
        array $attempt
    ): TestAttempt {
        dd($attempt);
        $attempt = (TestAttempt::where('user_id', $userId)
            ->where('test_id', $testId)
            ->max('attempt') ?? 0) + 1;

        return TestAttempt::create([
            'user_id' => $userId,
            'test_id' => $testId,
            'attempt' => $attempt,
            'test_title' => $testTitle,
            'results' => $results,
        ]);
    }

    public function getPassedTests(int $userId)
    {
        return TestAttempt::where('user_id', $userId)
            ->select([
                'id',
                'test_id',
                'attempt',
                'has_passed',
                'user_points',
                'percent',
                'grade',
                'created_at',
            ])
            ->orderByDesc('id')
            ->paginate(6, ['*'], 'passed_page');
    }

    public function getAvailableTests(int $userId)
    {
        return Test::select(['id', 'title', 'description', 'user_id', 'questions_count', 'created_at'])
            ->where('user_id', '!=', $userId)
            ->whereDoesntHave('passedUsers', fn($q) => $q->where('user_id', $userId))
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
