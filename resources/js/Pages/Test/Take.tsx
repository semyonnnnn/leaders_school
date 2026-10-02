import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Test, QuestionItem } from '@/types';

interface TakeProps extends PageProps {
    test: Test;
}

export default function Take({ auth, test }: TakeProps) {
    const resolveQuestions = (): QuestionItem[] => {
        if (test.questions && Array.isArray(test.questions)) {
            return test.questions;
        }
        if (Array.isArray(test.content)) {
            return test.content;
        }
        if (test.content && typeof test.content === 'object' && 'questions' in test.content && Array.isArray(test.content.questions)) {
            return test.content.questions;
        }
        return [];
    };

    const questions = resolveQuestions();

    // Calculate maximum possible points on the frontend
    const maxPoints = questions.reduce((sum, q) => sum + (q.value || 0), 0);

    const { data, setData, post, processing, errors } = useForm<{
        id: number,
        answers: Record<string, string>;
    }>({
        id: test.id,
        answers: questions.reduce((acc, q) => {
            acc[q.id] = '';
            return acc;
        }, {} as Record<string, string>),
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSelectOption = (questionId: string, optionId: string) => {
        setData('answers', {
            ...data.answers,
            [questionId]: optionId,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('attempts.store', test.id), {
            onSuccess: () => setSubmitted(true),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div
                    className="w-full border-b-2 border-white/20 p-4 font-mono flex items-center justify-between"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, #52525b 0%, #3f3f46 80%, #27272a 100%)
                        `,
                        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
                    }}
                >
                    <div className="flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-widest relative z-10">
                        <span className="text-zinc-300 font-semibold hover:text-amber-400 transition cursor-pointer">
                            <Link href={route('tests.index')}>тесты</Link>
                        </span>
                        <span className="text-amber-500 font-bold">&gt;&gt;</span>
                        <span className="text-amber-400 font-bold truncate select-none">
                            прохождение теста #{test.id}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                        <span className="h-2 w-2 rounded-xs bg-emerald-400 animate-pulse duration-3000" />
                        <span>режим_тестирования</span>
                    </div>
                </div>
            }
        >
            <Head title={`Прохождение теста: ${test.title}`} />

            <form onSubmit={handleSubmit} className="w-full p-4 sm:p-6 font-mono flex flex-col justify-start items-start bg-zinc-400 gap-6">
                {/* Test Meta Information */}
                <div
                    className="w-full h-auto p-6 clip-corner border-[3px] border-amber-600 shadow-md"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, #d4d4d8 0%, #d4d4d8 90%, #a1a1aa 100%)
                        `,
                        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
                    }}
                >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-zinc-400">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-600 font-black">//</span>
                            <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">
                                {test.title}
                            </h3>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-600 text-zinc-100 px-2 py-0.5 clip-corner">
                            АКТИВНЫЙ ТЕРМИНАЛ
                        </span>
                    </div>

                    {test.description && (
                        <div className="mb-2 text-xs font-bold text-zinc-700 uppercase tracking-wider bg-zinc-200/80 p-3 border-2 border-zinc-400 clip-corner">
                            <span className="text-amber-700 block mb-1">// ИНСТРУКЦИЯ К ТЕСТУ:</span>
                            {test.description}
                        </div>
                    )}
                </div>

                {/* Global Error Banner for Answers Container */}
                {errors.answers && (
                    <div className="w-full bg-zinc-950 p-4 border-2 border-red-600 clip-corner flex items-center gap-3">
                        <span className="text-red-500 font-black text-sm">[!</span>
                        <p className="text-red-400 text-xs font-bold uppercase tracking-wider">
                            {errors.answers}
                        </p>
                    </div>
                )}

                {/* Questions List */}
                {questions.length > 0 ? (
                    <div
                        className="w-full flex flex-col gap-4 h-auto p-6 clip-corner border-[3px] border-amber-600 shadow-md bg-zinc-300"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
                            `,
                            backgroundSize: '16px 16px',
                        }}
                    >
                        <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-zinc-400">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-600 font-black">//</span>
                                    <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">
                                        ВОПРОСЫ ({questions.length})
                                    </h3>
                                </div>

                                {/* Badges container for Min and Max points */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black tracking-wider bg-amber-600/20 border border-amber-600 text-zinc-900 px-2 py-0.5 clip-corner">
                                        МИН. БАЛЛОВ: {test.minPoints}
                                    </span>
                                    <span className="text-[10px] font-black tracking-wider bg-zinc-900/10 border border-zinc-700 text-zinc-800 px-2 py-0.5 clip-corner">
                                        МАКС. БАЛЛОВ: {maxPoints}
                                    </span>
                                </div>
                            </div>

                            <span className="text-[10px] font-mono text-zinc-600 font-black uppercase">
                                ВЫБЕРИТЕ ВАРИАНТЫ ОТВЕТА
                            </span>
                        </div>

                        <ul className="space-y-4">
                            {questions.map((q, idx) => {
                                const selectedOptId = data.answers[q.id];
                                const questionError = errors[`answers.${q.id}`];

                                return (
                                    <li
                                        key={q.id}
                                        className={`bg-zinc-100 p-4 border-2 transition-colors clip-corner ${questionError ? 'border-red-600 bg-red-950/5' : 'border-zinc-400 hover:border-amber-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-zinc-300">
                                            <div className="flex items-center gap-2">
                                                <span className="text-amber-600 font-black text-xs font-mono shrink-0">
                                                    [{idx + 1}]
                                                </span>
                                                <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                                                    {q.text}
                                                </h4>
                                            </div>
                                            <span className="text-sm font-black uppercase px-1.5 py-0.5 clip-corner bg-zinc-300 text-zinc-700 shrink-0">
                                                Цена: {q.value}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {q.options.map((opt, oIdx) => {
                                                const isSelected = selectedOptId === opt.id;

                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => handleSelectOption(q.id, opt.id)}
                                                        className={`flex items-center gap-2 p-2.5 border-2 clip-corner transition-all cursor-pointer ${isSelected
                                                                ? 'bg-emerald-950/10 border-emerald-600 text-zinc-950 font-bold'
                                                                : 'bg-zinc-200/60 border-zinc-400 text-zinc-800 hover:border-zinc-600'
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-5 h-5 flex items-center justify-center border-2 clip-corner transition-all shrink-0 ${isSelected
                                                                    ? 'bg-emerald-500 border-emerald-600 text-zinc-950'
                                                                    : 'bg-zinc-300 border-zinc-500 text-transparent'
                                                                }`}
                                                        >
                                                            <span className="text-[10px] font-black font-mono">✓</span>
                                                        </div>

                                                        <span className="text-xs text-zinc-500 font-mono shrink-0">
                                                            {oIdx + 1}.
                                                        </span>

                                                        <span className="flex-1 text-xs uppercase tracking-wider select-none">
                                                            {opt.text}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {questionError && (
                                            <p className="mt-3 text-[11px] font-bold text-red-600 uppercase tracking-wider">
                                                // {questionError}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="flex gap-4 justify-end pt-4 mt-2 border-t-2 border-zinc-400">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-zinc-950 border-2 border-amber-500 text-amber-500 text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-zinc-950 disabled:opacity-50 transition-colors cursor-pointer clip-corner shadow-lg"
                            >
                                {processing ? 'ПЕРЕДАЧА ДАННЫХ...' : '// ОТПРАВИТЬ_РЕШЕНИЕ'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full bg-zinc-300 p-6 border-2 border-zinc-400 clip-corner text-center">
                        <p className="text-xs font-bold text-zinc-600 uppercase">
                            [ СИСТЕМНОЕ СООБЩЕНИЕ ]: В ДАННОМ ТЕСТЕ ОТСУТСТВУЮТ ВОПРОСЫ.
                        </p>
                    </div>
                )}
            </form>
        </AuthenticatedLayout>
    );
}