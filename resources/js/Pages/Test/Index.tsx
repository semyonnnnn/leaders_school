import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import { Pagination } from '@/components/custom/Pagination';
import { PopUp } from '@/components/custom/PopUp';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteTestConfirmationModal from '@/Pages/Test/Partials/DeleteTestConfirmationModal';
import { FlashProps, PageProps, PaginatedTest } from '@/types';
import { TestCard } from './Partials/TestCard';
import TestTabHeader from './Partials/TestTabHeader';

type TabType = 'available' | 'completed' | 'my';

type CustomFlashProps = FlashProps & {
    message?: string | null;
};

export default function Index({
    available_tests,
    completed_tests,
    my_tests,
    current_user_id,
    active_tab,
}: {
    available_tests?: PaginatedTest;
    completed_tests?: PaginatedTest;
    my_tests?: PaginatedTest;
    current_user_id: number;
    active_tab: TabType;
}) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabType>(active_tab);

    // MODAL STATE MANAGEMENT
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | string | null;
        title: string;
        type: 'available' | 'completed' | null;
    }>({
        isOpen: false,
        id: null,
        title: '',
        type: null,
    });

    const [message, setMessage] = useState<FlashProps>({
        success: null,
        error: {
            summary: null,
            details: null,
        },
    });

    // Directly extract flash from page props
    const { flash } = usePage<PageProps<{ flash: CustomFlashProps }>>().props;

    useEffect(() => {
        // Intercept either flash.success or flash.message
        const activeNotice = flash?.success || flash?.message || null;
        const isErrorEmpty = !flash?.error?.summary && !flash?.error?.details;

        if (!activeNotice && isErrorEmpty) return;

        setMessage((prev) => ({
            success: activeNotice,
            error: isErrorEmpty
                ? prev.error
                : {
                    summary: flash?.error?.summary ?? null,
                    details: flash?.error?.details ?? null,
                },
        }));

        if (activeNotice) {
            const timer = setTimeout(() => {
                setMessage((prev) => ({
                    ...prev,
                    success: null,
                }));
            }, 7000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    const REPLICATED_WATERMARK_TEXT = 'ТЕСТИРОВАНИЕ';
    const WATERMARK_LAYOUT_MAP = ['left-[2%]', 'left-[55%]'];

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);

        router.get(
            route('tests.index'),
            { tab },
            {
                only: [
                    tab === 'available'
                        ? 'available_tests'
                        : tab === 'completed'
                            ? 'completed_tests'
                            : 'my_tests',
                ],
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // TRIGGER MODAL FOR AVAILABLE / MY TESTS
    const openDeleteAvailableModal = (id: number, title: string) => {
        setDeleteModal({
            isOpen: true,
            id,
            title,
            type: 'available',
        });
    };

    // TRIGGER MODAL FOR COMPLETED TESTS
    const openDeleteCompletedModal = (id: string | number, title: string) => {
        setDeleteModal({
            isOpen: true,
            id,
            title,
            type: 'completed',
        });
    };

    // EXECUTE ACTUAL DELETION LOGIC
    const handleConfirmDelete = () => {
        if (!deleteModal.id) return;

        router.delete(route('tests.destroy', deleteModal.id));

        setDeleteModal({
            isOpen: false,
            id: null,
            title: '',
            type: null,
        });
    };

    // SELECT CURRENT LIST OF TESTS TO RENDER BASED ON ACTIVE TAB
    const currentTests =
        activeTab === 'available'
            ? available_tests
            : activeTab === 'completed'
                ? completed_tests
                : my_tests;

    // Determine the corresponding 'only' prop identifier for pagination requests
    const currentPaginationOnlyProp =
        activeTab === 'available'
            ? 'available_tests'
            : activeTab === 'completed'
                ? 'completed_tests'
                : 'my_tests';

    const currentEmptyMessage =
        activeTab === 'my'
            ? 'Вы еще не создали ни одного теста'
            : 'Записи не найдены по заданным критериям';

    const currentDeleteHandler =
        activeTab === 'completed'
            ? openDeleteCompletedModal
            : openDeleteAvailableModal;

    return (
        <AuthenticatedLayout>
            {message.success && (
                <PopUp
                    message={message.success}
                    handleClick={() => {
                        setMessage({
                            success: null,
                            error: {
                                summary: null,
                                details: null,
                            },
                        });
                    }}
                />
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <DeleteTestConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() =>
                    setDeleteModal({
                        isOpen: false,
                        id: null,
                        title: '',
                        type: null,
                    })
                }
                onConfirm={handleConfirmDelete}
                itemName={deleteModal.title}
            />

            <main className="relative flex min-h-screen flex-col gap-8 bg-linear-to-r from-zinc-200/70 via-zinc-200/40 to-zinc-300/30 p-4 font-mono select-none md:p-8">
                {/* ГЛОБАЛЬНАЯ ПАНЕЛЬ ПОИСКА И НАВИГАЦИЯ */}
                <div className="relative z-20 flex flex-col justify-between gap-6 border-b-2 border-white bg-transparent pb-6 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-4 border-2 border-zinc-300 bg-white px-3 py-2">
                        <span className="font-black text-amber-500">//</span>
                        <span className="text-xs font-black tracking-widest text-zinc-900 uppercase">
                            ТЕРМИНАЛ УПРАВЛЕНИЯ ПРОТОКОЛАМИ
                        </span>
                    </div>

                    <div className="relative flex w-full flex-1 gap-4 md:w-2/3 lg:w-1/2">
                        <div className="flex items-center gap-3 border-2 border-zinc-300 bg-white px-3 py-2">
                            <span className="text-lg font-black text-amber-500">
                                //
                            </span>
                            <h2 className="text-sm font-black tracking-widest whitespace-nowrap text-zinc-900 uppercase md:text-base">
                                ПОИСК ПО БАЗЕ
                            </h2>
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Введите наименование протокола для фильтрации..."
                            className="clip-corner w-full border-none bg-zinc-200/90 px-4 py-3 text-xs font-bold tracking-wider text-zinc-950 uppercase placeholder-zinc-600 outline-hidden focus:ring-0 md:text-sm"
                        />

                        {searchQuery && (
                            <button
                                onClick={() => handleSearchChange('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer px-2 py-1 text-xs font-black text-zinc-600 hover:text-amber-600"
                            >
                                [ СБРОС ]
                            </button>
                        )}
                    </div>
                </div>

                {/* PERSISTENT WRAPPER FOR TABS & CONTROLS */}
                <div className="clip-corner relative z-10 flex flex-col gap-8 overflow-hidden rounded-xs border-2 border-zinc-400/90 bg-zinc-50 p-6 shadow-md md:p-8">
                    <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[16px_16px] opacity-[0.04]"></div>

                    {WATERMARK_LAYOUT_MAP.map((position, idx) => (
                        <div
                            key={idx}
                            className={`absolute top-36 ${position} pointer-events-none z-0 -rotate-3 transform text-9xl font-black tracking-widest text-zinc-950/2 uppercase`}
                        >
                            {REPLICATED_WATERMARK_TEXT}
                        </div>
                    ))}

                    <div className="clip-corner relative z-10 flex flex-col items-start justify-between gap-6 border-2 border-zinc-300 bg-zinc-100 p-5 shadow-xs lg:flex-row lg:items-center">
                        {/* CONDITIONAL HEADERS & PERMANENT CREATE BUTTON */}
                        <div className="flex flex-wrap items-center gap-6">
                            {activeTab === 'available' && (
                                <TestTabHeader
                                    title="Доступные Тесты"
                                    count={available_tests?.total ?? 0}
                                    countLabel="доступно"
                                    description="Активные назначенные протоколы для прохождения и проверки"
                                    accentColor="bg-amber-500"
                                />
                            )}
                            {activeTab === 'completed' && (
                                <TestTabHeader
                                    title="Завершенные Тесты"
                                    count={completed_tests?.total ?? 0}
                                    countLabel="В АРХИВЕ"
                                    description="История завершенных попыток и зафиксированные оценки"
                                    accentColor="bg-emerald-500"
                                />
                            )}
                            {activeTab === 'my' && (
                                <TestTabHeader
                                    title="Мои Тесты"
                                    count={my_tests?.total ?? 0}
                                    countLabel="создано"
                                    description="Управление собственными созданными протоколами"
                                    accentColor="bg-blue-500"
                                />
                            )}
                            <div className="hidden items-center lg:flex">
                                <div className="mx-6 block h-10 border-r-2 border-gray-400"></div>
                                <Link
                                    href={route('tests.create')}
                                    className="group clip-corner relative h-fit cursor-pointer border-2 border-amber-500 bg-amber-500/10 px-6 py-3 text-sm font-black tracking-[0.15em] text-nowrap text-black uppercase shadow-xs transition-all duration-200 hover:bg-amber-500 hover:text-zinc-950"
                                >
                                    [ 00_СОЗДАТЬ_ТЕСТ ]
                                </Link>
                            </div>
                        </div>

                        {/* TAB SWITCHER BUTTONS */}
                        <div className="mt-4 flex w-full flex-wrap items-center gap-2 lg:mt-0 lg:w-auto">
                            <button
                                onClick={() => handleTabChange('available')}
                                className={`clip-corner cursor-pointer border-2 px-6 py-3 text-sm font-black tracking-[0.15em] uppercase shadow-xs transition-all duration-200 ${activeTab === 'available'
                                    ? 'border-zinc-950 bg-amber-500 text-zinc-950'
                                    : 'border-amber-500 bg-zinc-950 text-amber-500 hover:bg-amber-500 hover:text-zinc-950'
                                    }`}
                            >
                                [ 01_ДОСТУПНЫЕ ]
                            </button>

                            <button
                                onClick={() => handleTabChange('completed')}
                                className={`clip-corner cursor-pointer border-2 px-6 py-3 text-sm font-black tracking-[0.15em] uppercase shadow-xs transition-all duration-200 ${activeTab === 'completed'
                                    ? 'border-zinc-950 bg-amber-500 text-zinc-950'
                                    : 'border-amber-500 bg-zinc-950 text-amber-500 hover:bg-amber-500 hover:text-zinc-950'
                                    }`}
                            >
                                [ 02_ЗАВЕРШЕННЫЕ ]
                            </button>

                            <button
                                onClick={() => handleTabChange('my')}
                                className={`clip-corner cursor-pointer border-2 px-6 py-3 text-sm font-black tracking-[0.15em] uppercase shadow-xs transition-all duration-200 ${activeTab === 'my'
                                    ? 'border-zinc-950 bg-amber-500 text-zinc-950'
                                    : 'border-amber-500 bg-zinc-950 text-amber-500 hover:bg-amber-500 hover:text-zinc-950'
                                    }`}
                            >
                                [ 03_МОИ ]
                            </button>
                        </div>
                    </div>

                    {/* ACTIVE TAB CONTENT GRID */}
                    {currentTests?.data && currentTests.data.length > 0 ? (
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {currentTests.data.map((test) => (
                                    <TestCard
                                        key={test.id}
                                        test={test}
                                        current_user_id={current_user_id}
                                        activeTab={activeTab}
                                        onDelete={currentDeleteHandler}
                                    />
                                ))}
                            </div>

                            <Pagination
                                links={currentTests.links}
                                current_page={currentTests.current_page}
                                last_page={currentTests.last_page}
                                total={currentTests.total}
                                only={currentPaginationOnlyProp}
                            />
                        </div>
                    ) : (
                        <div className="relative z-10 border-2 border-dashed border-zinc-300 bg-zinc-100/50 p-12 text-center">
                            <p className="text-sm font-bold tracking-wider text-zinc-500 uppercase">
                                // {currentEmptyMessage}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}
