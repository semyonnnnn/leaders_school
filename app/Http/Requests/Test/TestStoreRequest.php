<?php

namespace App\Http\Requests\Test;

use Illuminate\Foundation\Http\FormRequest;

class TestStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'min:3'],

            'material_ids' => ['nullable', 'array'],
            'material_ids.*' => ['integer', 'exists:materials,id'],

            'questions' => ['required', 'array', 'min:1'],
            'questions.*.id' => [
                'required',
                'string',
                'distinct',
                'regex:/^q_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i'
            ],
            'questions.*.text' => ['required', 'string', 'min:3', 'max:255'],
            'questions.*.value' => ['required', 'integer', 'min:1', 'max:5'],

            'questions.*.options' => [
                'required',
                'array',
                'min:2',
                function ($attribute, $value, $fail) {
                    $hasCorrect = collect($value)->contains(fn($opt) => !empty($opt['isCorrect']));
                    if (!$hasCorrect) {
                        $fail('Каждый вопрос должен содержать хотя бы один правильный вариант ответа.');
                    }
                },
            ],
            'questions.*.options.*.id' => [
                'required',
                'string',
                'distinct',
                'regex:/^opt_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i'
            ],
            'questions.*.options.*.text' => ['required', 'string', 'min:3', 'max:255'],
            'questions.*.options.*.isCorrect' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Поле названия обязательно для заполнения.',
            'title.string' => 'Название должно быть строкой.',
            'title.min' => 'Название должно содержать не менее 3 символов.',
            'title.max' => 'Название не должно превышать 255 символов.',

            'description.string' => 'Описание должно быть строкой.',
            'description.min' => 'Описание должно содержать не менее 3 символов.',

            'material_ids.array' => 'Материалы должны быть переданы в виде массива.',
            'material_ids.*.integer' => 'Идентификатор материала должен быть числом.',
            'material_ids.*.exists' => 'Выбранный материал не существует в системе.',

            'questions.required' => 'Тест должен содержать вопросы.',
            'questions.array' => 'Вопросы должны быть представлены в виде массива.',
            'questions.min' => 'Тест должен содержать минимум 1 вопрос.',

            'questions.*.id.required' => 'Каждый вопрос должен иметь идентификатор.',
            'questions.*.id.distinct' => 'Идентификаторы вопросов не должны повторяться.',
            'questions.*.id.regex' => 'Неверный формат идентификатора вопроса.',

            'questions.*.value.required' => 'Укажите цену вопроса.',
            'questions.*.value.integer' => 'Цена вопроса должна быть целым числом.',
            'questions.*.value.min' => 'Цена вопроса должна быть не менее 1.',
            'questions.*.value.max' => 'Цена вопроса должна быть не более 5.',

            'questions.*.text.required' => 'Текст вопроса обязателен.',
            'questions.*.text.string' => 'Текст вопроса должен быть строкой.',
            'questions.*.text.min' => 'Текст вопроса должен содержать не менее 3 символов.',
            'questions.*.text.max' => 'Текст вопроса не должен превышать 255 символов.',

            'questions.*.options.required' => 'У вопроса должны быть варианты ответов.',
            'questions.*.options.array' => 'Варианты ответов должны быть массивом.',
            'questions.*.options.min' => 'Должно быть минимум 2 варианта ответа.',

            'questions.*.options.*.id.required' => 'Каждый вариант ответа должен иметь идентификатор.',
            'questions.*.options.*.id.distinct' => 'Идентификаторы вариантов ответов не должны повторяться.',
            'questions.*.options.*.id.regex' => 'Неверный формат идентификатора варианта ответа.',

            'questions.*.options.*.text.required' => 'Текст варианта ответа обязателен.',
            'questions.*.options.*.text.string' => 'Текст варианта ответа должен быть строкой.',
            'questions.*.options.*.text.min' => 'Текст варианта ответа должен содержать не менее 3 символов.',
            'questions.*.options.*.text.max' => 'Текст варианта ответа не должен превышать 255 символов.',

            'questions.*.options.*.isCorrect.required' => 'Необходимо указать правильность варианта ответа.',
            'questions.*.options.*.isCorrect.boolean' => 'Поле правильности ответа должно быть логическим.',
        ];
    }
}
