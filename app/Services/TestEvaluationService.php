<?php

namespace App\Services;

use App\Models\Test;
use App\Models\TestAttempt;
use App\Http\Requests\Test\TestAttemptRequest;
use App\Models\Setting;

class TestEvaluationService
{
    public function evaluate(TestAttemptRequest $r, Test $test): array
    {
        $questions = is_string($test->content)
            ? json_decode($test->content, true)
            : $test->content;

        $submittedAnswers = $r->input('answers', []);
        $content = [];

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

            $content[$question['text']] = [
                'id' => $qId,
                'value' => $value,
                'user_answer' => $userSelectedOption['text'] ?? null,
                'correct_answer' => $correctOption['text'] ?? null,
                'is_correct' => $isCorrect,
            ];
        }

        $percent = (int) ceil($userPoints / $maxPoints * 100);

        $gradingScale = $this->getGradingScale();

        arsort($gradingScale);

        $grade = 1;

        foreach ($gradingScale as $gradeValue => $minimumPercent) {
            if ($percent >= $minimumPercent) {
                $grade = (int) $gradeValue;
                break;
            }
        }

        return [
            'user_id' => $r->user()->id,
            'test_id' => $test->id,
            'attempt' => $this->getNextAttemptNumber(
                $r->user()->id,
                $test->id
            ),

            'has_passed' => $userPoints >= $test->minPoints,
            'content' => $content,

            'user_points' => $userPoints,
            'percent' => $percent,
            'grade' => $grade,
        ];
    }

    private function getGradingScale(): array
    {
        return json_decode(
            Setting::where('key', 'grading_scale')->value('value'),
            true
        );
    }

    private function getNextAttemptNumber(int $userId, int $testId): int
    {
        return (TestAttempt::where('user_id', $userId)
            ->where('test_id', $testId)
            ->max('attempt') ?? 0) + 1;
    }
}
