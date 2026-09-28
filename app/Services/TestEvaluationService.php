<?php

namespace App\Services;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Http\Requests\Test\TestAttemptRequest;

class TestEvaluationService
{
    public function evaluate(TestAttemptRequest $r, Test $test): array
    {
        $questions = is_string($test->content)
            ? json_decode($test->content, true)
            : $test->content;

        $submittedAnswers = $r->input('answers', []);
        $results = [];

        $maxPoints = 0;
        $userPoints = 0;

        foreach ($questions as $question) {
            $qId = $question['id'];
            $userSelectedOptId = $submittedAnswers[$qId] ?? null;

            $correctOption = collect($question['options'])
                ->firstWhere('isCorrect', true);

            $userSelectedOption = collect($question['options'])
                ->firstWhere('id', $userSelectedOptId);

            $isCorrect = $userSelectedOptId
                && $correctOption
                && $userSelectedOptId === $correctOption['id'];

            $value = $question['value'] ?? 1;

            $maxPoints += $value;
            $userPoints += $isCorrect ? $value : 0;

            $results[$question['text']] = [
                'id' => $qId,
                'value' => $value,
                'user_answer' => $userSelectedOption['text'] ?? null,
                'correct_answer' => $correctOption['text'] ?? null,
                'is_correct' => $isCorrect,
            ];
        }

        $percent = (int) ceil($userPoints / $maxPoints * 100);

        return [
            'user_id' => $r->user()->id,
            'test_id' => $test->id,
            'attempt' => $this->getNextAttemptNumber(
                $r->user()->id,
                $test->id
            ),
            'hasPassed' => $userPoints >= $test->minPoints,
            'percent' => $percent,
            'results' => array_merge($results, [
                'maxPoints' => $maxPoints,
                'userPoints' => $userPoints,
                'percent' => $percent,
            ]),
        ];
    }

    private function getNextAttemptNumber(int $userId, int $testId): int
    {
        return (TestAttempt::where('user_id', $userId)
            ->where('test_id', $testId)
            ->max('attempt') ?? 0) + 1;
    }
}
