<?php

namespace Database\Factories;

use App\Models\Test;
use App\Models\User;
use App\Models\TestAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TestAttempt>
 */
class TestAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $test = Test::factory()->create();

        $maxPoints = $test->maxPoints;
        $userPoints = fake()->numberBetween(0, $maxPoints);
        $percent = (int) ceil($userPoints / $maxPoints * 100);

        $grade = match (true) {
            $percent >= 85 => 5,
            $percent >= 70 => 4,
            $percent >= 50 => 3,
            $percent >= 30 => 2,
            default => 1,
        };

        return [
            'user_id' => 1,
            'test_id' => $test->id,
            'attempt' => 1,
            'has_passed' => $userPoints >= $test->minPoints,
            'content' => $test->content,
            'user_points' => $userPoints,
            'percent' => $percent,
            'grade' => $grade,
        ];
    }

    /**
     * Automatically assign a random existing test
     * and compute the next valid attempt number.
     */
    public function forRandomExistingTest(User|int $user): static
    {
        $userId = $user instanceof User ? $user->id : $user;

        $test = Test::inRandomOrder()->first();

        if (!$test) {
            throw new \Exception(
                'Cannot create test attempt: No tests found in the database.'
            );
        }

        $latestAttempt = TestAttempt::where('user_id', $userId)
            ->where('test_id', $test->id)
            ->max('attempt') ?? 0;

        $nextAttempt = $latestAttempt + 1;

        if ($nextAttempt > 3) {
            return $this->forRandomExistingTest($userId);
        }

        $maxPoints = $test->maxPoints;
        $userPoints = fake()->numberBetween(0, $maxPoints);
        $percent = (int) ceil($userPoints / $maxPoints * 100);

        $grade = match (true) {
            $percent >= 85 => 5,
            $percent >= 70 => 4,
            $percent >= 50 => 3,
            $percent >= 30 => 2,
            default => 1,
        };

        return $this->state([
            'user_id' => $userId,
            'test_id' => $test->id,
            'attempt' => $nextAttempt,
            'has_passed' => $userPoints >= $test->minPoints,
            'content' => $test->content,
            'user_points' => $userPoints,
            'percent' => $percent,
            'grade' => $grade,
        ]);
    }
}
