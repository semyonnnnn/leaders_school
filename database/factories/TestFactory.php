<?php

namespace Database\Factories;

use App\Models\Test;
use App\Services\TestService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Test>
 */
class TestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $russianFaker = \Faker\Factory::create('ru_RU');

        $content = [];

        for ($i = 0; $i < rand(3, 8); $i++) {
            $options = [];
            $correctIndex = $russianFaker->numberBetween(0, 3);

            for ($j = 0; $j < 4; $j++) {
                $optText = ucfirst($russianFaker->words(2, true));

                if (mb_strlen($optText) < 3) {
                    $optText = 'Вариант ' . $optText;
                }

                $options[] = [
                    'id' => 'opt_' . $russianFaker->uuid(),
                    'text' => mb_substr($optText, 0, 255),
                    'isCorrect' => ($j === $correctIndex),
                ];
            }

            $qText = ucfirst($russianFaker->sentence(4));

            if (mb_strlen($qText) < 3) {
                $qText = 'Вопрос по теме?';
            }

            $content[] = [
                'id' => 'q_' . $russianFaker->uuid(),
                'text' => mb_substr($qText, 0, 255),
                'options' => $options,
                'value' => rand(1, 5),
            ];
        }

        $title = ucfirst($russianFaker->sentence(3));

        if (mb_strlen($title) < 3) {
            $title = 'Тест знаний';
        }

        $description = $russianFaker->paragraph();

        if (mb_strlen($description) < 3) {
            $description = 'Описание теста.';
        }

        $testService = app(TestService::class);

        $testData = $testService->getData([
            'title' => mb_substr($title, 0, 255),
            'description' => mb_substr($description, 0, 255),
            'questions' => $content,
        ]);

        return [
            'title' => $testData['title'],
            'description' => $testData['description'],
            'content' => $testData['content'],
            'questions_count' => $testData['questions_count'],
            'minPoints' => $testData['minPoints'],
            'maxPoints' => $testData['maxPoints'],
            'user_id' => 1,
        ];
    }
}
