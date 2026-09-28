import { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FlashProps } from "@/types";
import { PopUp } from "@/components/custom/PopUp";
import { PaginatedTest } from "@/types";
import { TestCard } from "./Partials/TestCard";
import { Pagination } from "@/components/custom/Pagination"; // Make sure path matches your structure
import DeleteTestConfirmationModal from "@/Pages/Test/Partials/DeleteTestConfirmationModal";

type TabType = 'available' | 'completed' | 'my';

export default function Index(
    {
        available_tests,
        completed_tests,
        my_tests,
        current_user_id,
        active_tab
    }: {
        available_tests?: PaginatedTest;
        completed_tests?: PaginatedTest;
        my_tests?: PaginatedTest;
        current_user_id: number;
        active_tab: TabType;
    }
) {
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
        }
    });

    const flash = (usePage().props as any).flash as FlashProps;

    useEffect(() => {
        const isSuccessEmpty = flash.success === null;
        const isErrorEmpty = !flash?.error?.summary && !flash?.error?.details;

        if (isSuccessEmpty && isErrorEmpty) return;

        setMessage(prev => ({
            success: flash.success,
            error: isErrorEmpty
                ? prev.error
                : {
                    summary: flash.error.summary,
                    details: flash.error.details
                }
        }));

        if (flash.success) {
            const timer = setTimeout(() => {
                setMessage(prev => ({
                    ...prev,
                    success: null,
                }));
            }, 7000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    const REPLICATED_WATERMARK_TEXT = "ТЕСТИРОВАНИЕ";
    const WATERMARK_LAYOUT_MAP = ["left-[2%]", "left-[55%]"];

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);

        router.get(route('tests.index'), { tab }, {
            only: [
                tab === 'available'
                    ? 'available_tests'
                    : tab === 'completed'
                        ? 'completed_tests'
                        : 'my_tests'
            ],
            preserveState: true,
            preserveScroll: true,
        });
    };

    // TRIGGER MODAL FOR AVAILABLE / MY TESTS
    const openDeleteAvailableModal = (id: number, title: string) => {
        setDeleteModal({
            isOpen: true,
            id,
            title,
            type: 'available'
        });
    };

    // TRIGGER MODAL FOR Completed TESTS
    const openDeleteCompletedModal = (id: string | number, title: string) => {
        setDeleteModal({
            isOpen: true,
            id,
            title,
            type: 'completed'
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
            type: null
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
            ? "Вы еще не создали ни одного теста"
            : "Записи не найдены по заданным критериям";

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
                            }
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
                        type: null
                    })
                }
                onConfirm={handleConfirmDelete}
                itemName={deleteModal.title}
            />

            <main className="min-h-screen bg-linear-to-r from-zinc-200/70 via-zinc-200/40 to-zinc-300/30 p-4 md:p-8 flex flex-col gap-8 relative select-none font-mono">

                {/* ГЛОБАЛЬНАЯ ПАНЕЛЬ ПОИСКА И НАВИГАЦИЯ */}
                <div className="bg-transparent border-b-2 border-white pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-20">

                    <div className="flex flex-wrap items-center gap-4 bg-white px-3 py-2 border-2 border-zinc-300">
                        <span className="text-amber-500 font-black">//</span>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900">
                            ТЕРМИНАЛ УПРАВЛЕНИЯ ПРОТОКОЛАМИ
                        </span>
                    </div>

                    <div className="relative w-full md:w-2/3 lg:w-1/2 flex gap-4 flex-1">
                        <div className="flex items-center gap-3 bg-white px-3 py-2 border-2 border-zinc-300">
                            <span className="text-amber-500 font-black text-lg">//</span>
                            <h2 className="text-zinc-900 font-black uppercase text-sm md:text-base tracking-widest whitespace-nowrap">
                                ПОИСК ПО БАЗЕ
                            </h2>
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Введите наименование протокола для фильтрации..."
                            className="w-full bg-zinc-200/90 text-zinc-950 placeholder-zinc-600 text-xs md:text-sm px-4 py-3 font-bold border-none outline-hidden focus:ring-0 uppercase tracking-wider clip-corner"
                        />

                        {searchQuery && (
                            <button
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-amber-600 font-black text-xs cursor-pointer px-2 py-1"
                            >
                                [ СБРОС ]
                            </button>
                        )}
                    </div>
                </div>

                {/* PERSISTENT WRAPPER FOR TABS & CONTROLS */}
                <div className="relative p-6 md:p-8 bg-zinc-50 border-2 border-zinc-400/90 overflow-hidden rounded-xs z-10 clip-corner shadow-md flex flex-col gap-8">

                    <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0"></div>

                    {WATERMARK_LAYOUT_MAP.map((position, idx) => (
                        <div
                            key={idx}
                            className={`absolute top-36 ${position} text-9xl font-black text-zinc-950/2 pointer-events-none transform -rotate-3 z-0 uppercase tracking-widest`}
                        >
                            {REPLICATED_WATERMARK_TEXT}
                        </div>
                    ))}

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-5 bg-zinc-100 border-2 border-zinc-300 relative z-10 clip-corner shadow-xs">

                        {/* CONDITIONAL HEADERS & PERMANENT CREATE BUTTON */}
                        <div className="flex flex-wrap items-center gap-6">

                            {activeTab === 'available' && (
                                <div className="relative pl-5 border-l-8 border-zinc-950 py-1">
                                    <div className="absolute top-0 left-0 w-3 h-2 bg-amber-500 -ml-2"></div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-wide">
                                            Доступные Тесты
                                        </h1>
                                        <span className="text-lg text-zinc-700 font-black tracking-wider bg-zinc-200 border-2 border-zinc-400 px-2 py-1 clip-corner text-nowrap">
                                            [{available_tests?.total ?? 0} доступно]
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 text-xs md:text-sm font-bold uppercase tracking-wider">
                                        // Активные назначенные протоколы для прохождения и проверки
                                    </p>
                                </div>
                            )}

                            {activeTab === 'completed' && (
                                <div className="relative pl-5 border-l-8 border-zinc-950 py-1">
                                    <div className="absolute top-0 left-0 w-3 h-2 bg-emerald-500 -ml-2"></div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-wide">
                                            Завершенные Тесты
                                        </h2>
                                        <span className="text-xs text-zinc-700 font-black tracking-wider bg-zinc-300 border-2 border-zinc-400 px-2 py-1 clip-corner">
                                            [{completed_tests?.total ?? 0} В АРХИВЕ]
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 text-xs md:text-sm font-bold uppercase tracking-wider">
                                        // История завершенных попыток и зафиксированные оценки
                                    </p>
                                </div>
                            )}

                            {activeTab === 'my' && (
                                <div className="relative pl-5 border-l-8 border-zinc-950 py-1">
                                    <div className="absolute top-0 left-0 w-3 h-2 bg-blue-500 -ml-2"></div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-wide">
                                            Мои Тесты
                                        </h2>
                                        <span className="text-lg text-zinc-700 font-black tracking-wider bg-zinc-200 border-2 border-zinc-400 px-2 py-1 clip-corner">
                                            [{my_tests?.total ?? 0} создано]
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 text-xs md:text-sm font-bold uppercase tracking-wider">
                                        // Управление собственными созданными протоколами
                                    </p>
                                </div>
                            )}

                            {/* PERMANENT CREATE BUTTON CONTAINER */}
                            <div className="hidden lg:flex items-center">
                                <div className="border-r-2 border-gray-400 block h-10 mx-6"></div>

                                <Link
                                    href={route('tests.create')}
                                    className="group relative px-6 py-3 bg-amber-500/10 border-2 border-amber-500 text-black hover:bg-amber-500 hover:text-zinc-950 text-sm font-black uppercase tracking-[0.15em] transition-all duration-200 clip-corner cursor-pointer shadow-xs text-nowrap h-fit"
                                >
                                    [ 00_СОЗДАТЬ_ТЕСТ ]
                                </Link>
                            </div>
                        </div>

                        {/* TAB SWITCHER BUTTONS */}
                        <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0 w-full lg:w-auto">
                            <button
                                onClick={() => handleTabChange('available')}
                                className={`px-6 py-3 border-2 text-sm font-black uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer clip-corner shadow-xs ${activeTab === 'available'
                                    ? 'bg-amber-500 border-zinc-950 text-zinc-950'
                                    : 'bg-zinc-950 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-950'
                                    }`}
                            >
                                [ 01_ДОСТУПНЫЕ ]
                            </button>

                            <button
                                onClick={() => handleTabChange('completed')}
                                className={`px-6 py-3 border-2 text-sm font-black uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer clip-corner shadow-xs ${activeTab === 'completed'
                                    ? 'bg-amber-500 border-zinc-950 text-zinc-950'
                                    : 'bg-zinc-950 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-950'
                                    }`}
                            >
                                [ 02_ЗАВЕРШЕННЫЕ ]
                            </button>

                            <button
                                onClick={() => handleTabChange('my')}
                                className={`px-6 py-3 border-2 text-sm font-black uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer clip-corner shadow-xs ${activeTab === 'my'
                                    ? 'bg-amber-500 border-zinc-950 text-zinc-950'
                                    : 'bg-zinc-950 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-950'
                                    }`}
                            >
                                [ 03_МОИ ]
                            </button>
                        </div>
                    </div>

                    {/* ACTIVE TAB CONTENT GRID */}
                    {currentTests?.data && currentTests.data.length > 0 ? (
                        <div className="flex flex-col gap-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentTests.data.map((test) => (
                                    <TestCard
                                        key={test.id}
                                        test={test}
                                        current_user_id={current_user_id}
                                        onDelete={currentDeleteHandler}
                                    />
                                ))}
                            </div>

                            {/* RESTORED PAGINATION COMPONENT */}
                            <Pagination
                                links={currentTests.links}
                                current_page={currentTests.current_page}
                                last_page={currentTests.last_page}
                                total={currentTests.total}
                                only={currentPaginationOnlyProp}
                            />
                        </div>
                    ) : (
                        <div className="p-12 text-center bg-zinc-100/50 border-2 border-dashed border-zinc-300 relative z-10">
                            <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm">
                                // {currentEmptyMessage}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </AuthenticatedLayout>
    );
}