import { Test } from '@/types';
import { router } from '@inertiajs/react';
import React from 'react';

interface TestCardProps {
    test: Test;
    onDelete: (id: number, title: string) => void;
    current_user_id: number;
    activeTab: 'available' | 'completed' | 'my';
}

const TestCard: React.FC<TestCardProps> = ({
    test,
    onDelete,
    current_user_id,
    activeTab,
}) => {
    const isMyTest = activeTab === 'my';
    const isCompletedTest = activeTab === 'completed';
    const isAvailableTest = activeTab === 'available';

    return (
        <div className="group clip-corner relative flex flex-col justify-between border-2 border-zinc-300 bg-zinc-100/80 p-5 shadow-xs transition-all duration-150 hover:border-zinc-500 hover:bg-zinc-100">
            <div className="mb-4 flex items-center justify-between border-b-2 border-zinc-300 pb-[0.1rem]">
                <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                    #ТЕСТ-{test.id.toString().padStart(4, '0')}
                </span>
            </div>

            <div className="mb-6 flex flex-1 flex-col justify-between">
                <h3 className="mb-3 line-clamp-2 text-lg font-black tracking-wide text-zinc-950 uppercase transition-colors group-hover:text-amber-600">
                    {test.title}
                </h3>
                <p className="mb-6 line-clamp-3 text-sm leading-relaxed font-bold text-zinc-700">
                    {test.description}
                </p>

                <div className="grid grid-cols-2 gap-3 border-2 border-zinc-300 bg-zinc-200/70 p-3 text-xs font-bold">
                    <div>
                        <span className="block text-[10px] font-black text-zinc-500 uppercase">
                            Вопросов:
                        </span>
                        <span className="text-sm text-zinc-900">
                            {test.questions_count} ЕД.
                        </span>
                    </div>
                    <div>
                        <span className="block text-[10px] font-black text-zinc-500 uppercase">
                            Создан:
                        </span>
                        <span className="text-sm text-zinc-900">
                            {test.created_at}
                        </span>
                    </div>
                </div>
            </div>

            {/* ACTION FOOTER BASED ON ACTIVE TAB */}
            {isMyTest && (
                <div className="flex gap-3 border-t-2 border-zinc-300 pt-4">
                    <button
                        onClick={() => {
                            router.get(route('tests.edit', test.id));
                        }}
                        className="flex-1 cursor-pointer border-2 border-zinc-500 bg-zinc-200 py-3 text-center text-xs font-black tracking-wider text-zinc-900 uppercase hover:bg-zinc-300"
                    >
                        [ ПРАВКА ]
                    </button>
                    <button
                        onClick={() => onDelete(test.id, test.title)}
                        className="flex-1 cursor-pointer border-2 border-amber-600 bg-zinc-950 py-3 text-center text-xs font-black tracking-wider text-amber-500 uppercase hover:bg-amber-600 hover:text-white"
                    >
                        [ УСТРАНИТЬ ]
                    </button>
                </div>
            )}

            {isAvailableTest && (
                <div className="border-t-2 border-zinc-300 pt-4">
                    <button
                        onClick={() => {
                            router.get(route('tests.take', test.id));
                        }}
                        className="clip-corner block w-full cursor-pointer border-2 border-zinc-800 bg-zinc-950 py-3 text-center text-xs font-black tracking-widest text-amber-400 uppercase transition-all hover:border-amber-600 hover:bg-amber-500 hover:text-zinc-950"
                    >
                        // НАЧАТЬ_ТЕСТИРОВАНИЕ →
                    </button>
                </div>
            )}

            {isCompletedTest && (
                <div className="flex gap-3 border-t-2 border-zinc-300 pt-4">
                    <button
                        onClick={() => {
                            router.get(route('tests.results', test.id));
                        }}
                        className="clip-corner flex-1 cursor-pointer border-2 border-zinc-800 bg-zinc-950 py-3 text-center text-xs font-black tracking-widest text-amber-400 uppercase transition-all hover:border-amber-600 hover:bg-amber-500 hover:text-zinc-950"
                    >
                        [ ПЕРЕСМОТРЕТЬ ]
                    </button>
                       <button
                        onClick={() => {
                            router.get(route('tests.take', test.id));
                        }}
                        className="flex-1 cursor-pointer border-2 border-zinc-500 bg-zinc-200 py-3 text-center text-xs font-black tracking-wider text-zinc-900 uppercase hover:bg-zinc-300"
                    >
                        [ пройти заново ]
                    </button>
                </div>
            )}
        </div>
    );
};

export { TestCard };
