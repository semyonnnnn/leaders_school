import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Shape matches TestAttemptRepository::getCompletedTest().
// Declared inline so this page works without touching '@/types'.
// `content` is sent by the server but not rendered yet: I haven't seen its structure.
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
    const { test, has_passed } = testAttempt;

    console.log('testAttempt:', testAttempt);

    // Same grid-paper background as Show.tsx so both pages feel like one system
    const gridBackground = {
        backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, #d4d4d8 0%, #d4d4d8 90%, #a1a1aa 100%)
        `,
        backgroundSize: '16px 16px, 16px 16px, 100% 100%',
    };

    // One list so the four stats can't drift out of sync in the markup
    const stats: { label: string; value: string | number }[] = [
        { label: 'Попытка', value: testAttempt.attempt },
        { label: 'Баллы', value: testAttempt.user_points },
        { label: 'Процент', value: `${testAttempt.percent}%` },
        { label: 'Оценка', value: testAttempt.grade ?? '—' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div
                    className="flex w-full items-center justify-between border-b-2 border-white/20 p-4 font-mono"
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
                        {/* Back to the completed tab, not the default "available" one */}
                        <Link
                            href={route('tests.index', { tab: 'completed' })}
                            className="font-semibold text-zinc-300 transition hover:text-amber-400"
                        >
                            тесты
                        </Link>
                        <span className="font-bold text-amber-500">&gt;&gt;</span>
                        <span className="truncate font-bold text-amber-400 select-none">
                            результат теста #{test.id}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
                        <span className="h-2 w-2 rounded-xs bg-zinc-400" />
                        <span>режим_просмотра</span>
                    </div>
                </div>
            }
        >
            <Head title={`Результат: ${test.title}`} />

            <div className="flex w-full flex-col items-start justify-start gap-6 bg-zinc-400 p-4 font-mono sm:p-6">
                <div
                    className="clip-corner h-auto w-full border-[3px] border-amber-600 p-6 shadow-md"
                    style={gridBackground}
                >
                    <div className="mb-4 flex items-center justify-between border-b-2 border-zinc-400 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600">//</span>
                            <h3 className="text-base font-black tracking-widest text-zinc-900 uppercase">
                                {test.title}
                            </h3>
                        </div>

                        {/* Colour and label are driven only by has_passed */}
                        <span
                            className={`clip-corner px-2 py-0.5 text-[10px] font-black text-zinc-100 ${
                                has_passed ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                        >
                            {has_passed ? 'ТЕСТ ПРОЙДЕН' : 'ТЕСТ НЕ ПРОЙДЕН'}
                        </span>
                    </div>

                    {test.description && (
                        <div className="clip-corner mb-4 border-2 border-zinc-400 bg-zinc-200/80 p-3 text-xs font-bold tracking-wider text-zinc-700 uppercase">
                            <span className="mb-1 block text-amber-700">
                                // ИНСТРУКЦИЯ К ТЕСТУ:
                            </span>
                            {test.description}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="clip-corner border-2 border-zinc-400 bg-zinc-100 p-3"
                            >
                                <span className="block text-[10px] font-black text-zinc-500 uppercase">
                                    {stat.label}:
                                </span>
                                <span className="text-lg font-black text-zinc-900">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-[10px] font-bold tracking-wider text-zinc-600 uppercase">
                        Завершён: {testAttempt.created_at ?? '—'}
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
