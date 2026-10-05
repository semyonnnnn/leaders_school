import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface Question {
    id: string;
    value: number;
    user_answer: string;
    is_correct: boolean;
}

interface TestAttemptResult {
    id: number;
    test_id: number;
    attempt: number;
    has_passed: boolean;
    user_points: number;
    percent: number;
    grade: string | number | null;
    created_at: string | null;
    updated_at: string | null;
    content: Record<string, Question>;
    test: {
        id: number;
        title: string;
        description: string | null;
    };
}

export default function Result({
    testAttempt,
}: {
    testAttempt: TestAttemptResult;
}) {
    const { test, has_passed, content } = testAttempt;

    const gridBackground = {
        backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, #d4d4d8 0%, #d4d4d8 90%, #a1a1aa 100%)
        `,
        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
    };

    const cardGridPattern = {
        backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.07) 1px, transparent 1px)
        `,
        backgroundSize: '12px 12px',
    };

    const stats: { label: string; value: string | number }[] = [
        { label: 'Попытка', value: testAttempt.attempt },
        { label: 'Баллы', value: testAttempt.user_points },
        { label: 'Процент', value: `${testAttempt.percent}%` },
        { label: 'Оценка', value: testAttempt.grade ?? '—' },
    ];

    const questions = Object.entries(content);

    return (
        <AuthenticatedLayout
            header={
                <div
                    className="flex w-full items-center justify-between border-b-2 border-white/20 p-4 font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, #52525b 0%, #3f3f46 80%, #27272a 100%)
                        `,
                        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
                    }}
                >
                    <div className="relative z-10 flex items-center gap-2 text-xs font-mono tracking-widest uppercase md:text-sm">
                        <Link
                            href={route('tests.index', { tab: 'completed' })}
                            className="font-semibold text-zinc-300 transition hover:text-amber-400"
                        >
                            тесты
                        </Link>
                        <span className="font-bold text-amber-500">&gt;&gt;</span>
                        <span className="truncate font-bold text-amber-400 select-none drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                            результат теста #{test.id}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
                        <span className="h-2 w-2 rounded-xs bg-zinc-400 animate-pulse" />
                        <span>режим_просмотра</span>
                    </div>
                </div>
            }
        >
            <Head title={`Результат: ${test.title}`} />

            <div className="flex w-full flex-col items-start justify-start gap-6 bg-zinc-400 p-4 font-mono sm:p-6">

                {/* PRIMARY TELEMETRY PANEL WITH AMBER BORDER */}
                <div
                    className="clip-corner h-auto w-full border-[3px] border-amber-600 p-6 shadow-[4px_4px_0px_rgba(217,119,6,0.3)]"
                    style={gridBackground}
                >
                    <div className="mb-5 flex items-center justify-between border-b-2 border-zinc-400 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600 animate-pulse">//</span>
                            <h3 className="text-base font-black tracking-widest text-zinc-900 uppercase">
                                {test.title}
                            </h3>
                        </div>

                        {/* MUTED STATUS BADGE */}
                        <span
                            className={`clip-corner px-4 py-1 text-xs tracking-widest font-black uppercase border-2 shadow-sm ${has_passed
                                ? 'bg-emerald-800 text-emerald-100 border-emerald-600'
                                : 'bg-red-800 text-red-100 border-red-600'
                                }`}
                        >
                            {has_passed ? '✓ ТЕСТ ПРОЙДЕН' : '✗ ТЕСТ НЕ ПРОЙДЕН'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row items-stretch">
                        {/* CONDENSED STATS BLOCK */}
                        <div className="clip-corner grid w-full max-w-xs shrink-0 grid-cols-2 gap-[2px] border-2 border-zinc-600 bg-zinc-600 lg:w-64">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col justify-center bg-zinc-100 p-3"
                                >
                                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                        {stat.label}
                                    </span>
                                    <span className="mt-1 text-2xl font-black text-zinc-900">
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* BRIEFING PANEL */}
                        {(test.description || !has_passed) && (
                            <div className="clip-corner flex flex-1 flex-col gap-4 border-2 border-amber-600/60 border-l-4 border-l-amber-600 bg-amber-100/40 p-4">
                                {test.description && (
                                    <div className="flex flex-col">
                                        <span className="mb-1 block text-[10px] font-black tracking-widest text-amber-700 uppercase">
                                            // ИНСТРУКЦИЯ К ТЕСТУ
                                        </span>
                                        <p className="text-xs font-bold tracking-wider text-zinc-800 uppercase leading-relaxed">
                                            {test.description}
                                        </p>
                                    </div>
                                )}

                                {test.description && !has_passed && (
                                    <div className="h-[2px] w-full bg-amber-600/30" />
                                )}

                                {!has_passed && (
                                    <div className="flex flex-col gap-3 mt-auto">
                                        <p className="text-xs font-bold tracking-wider text-zinc-800 uppercase">
                                            <span className="mr-1 text-red-700 font-black">[!]</span>
                                            Для подготовки к следующей попытке изучите материалы по теме — правильные ответы не показываются.
                                        </p>
                                        <Link
                                            href={route('materials.index')}
                                            className="clip-corner w-fit border-2 border-zinc-800 bg-zinc-800 px-4 py-2 text-[10px] font-black tracking-widest text-amber-400 uppercase transition-all hover:bg-amber-500 hover:text-zinc-950 hover:shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                        >
                                            // перейти_к_материалам →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="mt-5 text-[10px] font-bold tracking-wider text-zinc-600 uppercase border-t border-zinc-300/50 pt-2">
                        Завершён: {testAttempt.created_at ?? '—'}
                    </p>
                </div>

                {/* QUESTIONS BREAKDOWN WITH GRID TEXTURE */}
                <div className="clip-corner w-full border-2 border-zinc-500 bg-zinc-300 p-5 shadow-[4px_4px_0px_rgba(113,113,122,0.3)]">
                    <div className="mb-4 flex items-center justify-between border-b-2 border-zinc-400 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600">//</span>
                            <h3 className="text-sm font-black tracking-widest text-zinc-900 uppercase">
                                Разбор вопросов
                            </h3>
                        </div>
                        <span className="text-sm font-black tracking-wider text-zinc-700 uppercase bg-zinc-200 px-2 py-0.5 clip-corner border border-zinc-400">
                            {questions.filter(([, q]) => q.is_correct).length} / {questions.length} верно
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {questions.map(([questionText, question], idx) => {
                            const ok = question.is_correct;

                            return (
                                <div
                                    key={question.id}
                                    style={cardGridPattern}
                                    className="clip-corner flex border-2 border-zinc-500 bg-zinc-200 transition-colors hover:bg-zinc-100"
                                >
                                    {/* MUTED STATUS STRIP */}
                                    <div
                                        className={`w-2 shrink-0 ${ok ? 'bg-emerald-800' : 'bg-red-800'
                                            }`}
                                    />

                                    <div className="flex-1 p-4">
                                        <div className="mb-2 flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2">
                                                <span className="shrink-0 font-mono text-xs font-black text-amber-600 mt-1">
                                                    [{String(idx + 1).padStart(2, '0')}]
                                                </span>
                                                <p className="text-lg font-bold text-zinc-900 leading-tight">
                                                    {questionText}
                                                </p>
                                            </div>

                                            {/* MUTED CARD STATUS */}
                                            <span
                                                className={`shrink-0 text-xs md:text-sm font-black tracking-widest uppercase px-2 py-0.5 clip-corner border ${ok
                                                    ? 'bg-emerald-900/20 text-emerald-900 border-emerald-700/60'
                                                    : 'bg-red-900/20 text-red-900 border-red-700/60'
                                                    }`}
                                            >
                                                [ {ok ? '✓ ВЕРНО' : '✗ ОШИБКА'} ]
                                            </span>
                                        </div>

                                        <p className="text-xs font-bold tracking-wider text-zinc-700 uppercase bg-zinc-300/80 p-2 border border-zinc-400 inline-block clip-corner mt-2">
                                            Ваш ответ:{' '}
                                            <span
                                                className={`normal-case text-base md:text-lg ml-2 ${ok
                                                    ? 'text-zinc-900 font-black'
                                                    : 'text-zinc-600 font-medium line-through decoration-red-800/80 decoration-2'
                                                    }`}
                                            >
                                                {question.user_answer}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}