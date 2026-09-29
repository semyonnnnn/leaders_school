import { Pagination } from '@/components/custom/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ErrorTelemetry } from '@/Pages/User/ErrorTelemetry';
import { FlashProps, PaginatedDataProps, User, UserIndexProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { PasswordGenerator } from '../Material/Partials/PasswordGenerator';
import { EditUserModal } from './EditUserModal';
import { UploadUsersPanel } from './UploadUsersPanel';

export default function Index({ auth, users, roleLabels }: UserIndexProps) {
    const isPaginated = !Array.isArray(users);
    const userList = isPaginated
        ? (users as PaginatedDataProps<User>).data
        : (users as User[]);
    const totalCount = isPaginated
        ? (users as PaginatedDataProps<User>).total
        : (users as User[]).length;

    const [errorState, setErrorState] = useState<{
        summary: string | null;
        details: string[] | null;
    }>({
        summary: null,
        details: null,
    });

    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [backendDataLocal, setBackendDataLocal] = useState<any | null>(null);
    const [loadingUserId, setLoadingUserId] = useState<number | null>(null);

    const userRole = auth.user?.roles?.[0]?.toLowerCase();
    const canEdit = userRole === 'root' || userRole === 'admin';

    const flash = (usePage().props as any).flash as FlashProps;

    useEffect(() => {
        // Intercept incoming flash notifications
        if (flash?.message) {
            setInfoMessage(flash.message);
        } else if (flash?.success) {
            setInfoMessage(flash.success);
        }

        if (flash?.error?.summary || flash?.error?.details) {
            setErrorState({
                summary: flash.error.summary ?? null,
                details: flash.error.details ?? null,
            });
        }
    }, [flash]);

    const handleFetchAndOpenModal = (userId: number) => {
        setLoadingUserId(userId);

        axios
            .get(route('users.edit', userId))
            .then((response) => {
                setBackendDataLocal(response.data);
                setLoadingUserId(null);
            })
            .catch(() => {
                setLoadingUserId(null);
            });
    };

    const handleCloseModal = () => {
        setBackendDataLocal(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Пользователи" />

            <div
                style={{
                    backgroundImage: `
            linear-gradient(90deg, rgba(24,24,27,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24,24,27,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(24,24,27,0.08) 1px, transparent 1px),
            linear-gradient(0deg, rgba(24,24,27,0.12) 1px, transparent 1px),
            linear-gradient(0deg, rgba(24,24,27,0.05) 1px, transparent 1px),
            linear-gradient(90deg, transparent 45%, #d4d4d8 45%, #d4d4d8 46%, transparent 46%),
            linear-gradient(0deg, transparent 72%, #d4d4d8 72%, #d4d4d8 73%, transparent 73%)
          `,
                    backgroundSize:
                        '137px 100%, 43px 100%, 100% 97px, 100% 53px, 100% 19px, 100% 100%, 100% 100%',
                    backgroundPosition: '0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0',
                }}
                className="relative flex min-h-screen flex-col gap-8 bg-zinc-300 p-4 font-mono select-none md:p-8"
            >
                {/* System notification banner for ephemeral flash messages */}
                {infoMessage && (
                    <div className="relative z-10 flex items-center justify-between border border-emerald-500/80 bg-emerald-950/90 p-3 text-xs text-emerald-400 shadow-lg">
                        <div>[ SYS_NOTIF // {infoMessage} ]</div>
                        <button
                            type="button"
                            onClick={() => setInfoMessage(null)}
                            className="cursor-pointer border border-emerald-500/50 px-2 py-0.5 text-[10px] uppercase transition-colors hover:bg-emerald-500 hover:text-emerald-950"
                        >
                            [ ЗАКРЫТЬ ]
                        </button>
                    </div>
                )}

                <div className="relative z-10 overflow-hidden rounded-xs border border-zinc-300/90 bg-zinc-50 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[12px_12px] opacity-[0.03]"></div>

                    <div className="relative z-10 mb-6 flex items-center justify-between border-b border-zinc-950 pb-3">
                        <h1 className="text-xl font-black tracking-widest text-zinc-900 uppercase">
                            [ РЕЕСТР_СИСТЕМНЫХ_СУБЪЕКТОВ ]
                        </h1>
                        <div className="border border-zinc-300/70 bg-zinc-200 px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500">
                            [ {totalCount}_СУБЪЕКТОВ_В_СИСТЕМЕ ]
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {userList?.map((user) => {
                            const isThisUserLoading = loadingUserId === user.id;

                            return (
                                <div
                                    key={user.id}
                                    className="group relative flex flex-col overflow-hidden border border-zinc-200 bg-white/80 p-2 backdrop-blur-md transition-all duration-300 hover:border-amber-300 hover:bg-white hover:shadow-[0_4px_15px_rgba(245,158,11,0.1)]"
                                >
                                    <div className="absolute top-0 bottom-0 left-0 w-0.75 bg-zinc-200 transition-colors duration-300 group-hover:bg-amber-500"></div>
                                    <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[8px_8px] opacity-[0.02]"></div>
                                    <div className="absolute top-1 right-1 z-10 h-2 w-2 border-t-2 border-r-2 border-zinc-200 transition-colors group-hover:border-amber-400"></div>
                                    <div className="absolute right-1 bottom-1 z-10 h-2 w-2 border-r-2 border-b-2 border-zinc-200 transition-colors group-hover:border-amber-400"></div>

                                    <div className="relative z-10 mb-1.5 flex items-start justify-between pl-2">
                                        <div>
                                            <h3 className="text-sm leading-none font-black tracking-widest text-zinc-800 uppercase transition-colors group-hover:text-amber-900">
                                                {user.name}
                                            </h3>
                                            <p className="mt-0.5 text-[10px] leading-tight font-medium tracking-widest text-zinc-400 uppercase">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 border border-amber-100/50 bg-amber-50/50 px-1.5 py-px text-[9px] font-bold text-amber-700 shadow-sm">
                                            <div className="h-1 w-1 animate-pulse rounded-full bg-amber-500"></div>
                                            SYS_ID.
                                            {String(user.id).padStart(
                                                totalCount.toString().length,
                                                '0',
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative z-10 mt-auto flex items-center justify-between border-t border-zinc-100 pt-1.5 pl-2">
                                        <span className="text-[9px] leading-none font-bold tracking-widest text-zinc-400 uppercase">
                                            LVL //{' '}
                                            <span className="ml-1 font-black text-zinc-800">
                                                {roleLabels[
                                                    user?.roles?.[0]
                                                ]?.toUpperCase() || 'N/A'}
                                            </span>
                                        </span>

                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleFetchAndOpenModal(
                                                        user.id,
                                                    )
                                                }
                                                disabled={
                                                    loadingUserId !== null
                                                }
                                                className="group/btn relative flex cursor-pointer items-center overflow-hidden border border-zinc-300 bg-zinc-100 px-6 py-1.5 text-[9px] leading-none font-bold tracking-[0.2em] text-zinc-600 uppercase transition-colors duration-300 hover:border-amber-500 hover:bg-white hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span className="relative z-10 block">
                                                    {isThisUserLoading
                                                        ? '[ СИНХРОНИЗАЦИЯ... ]'
                                                        : '[ РЕДАКТИРОВАТЬ ]'}
                                                </span>
                                                <div className="absolute inset-0 z-0 -translate-x-full bg-amber-50 transition-transform duration-300 ease-out group-hover/btn:translate-x-0"></div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {isPaginated && (
                        <Pagination
                            links={(users as PaginatedDataProps<User>).links}
                            current_page={
                                (users as PaginatedDataProps<User>).current_page
                            }
                            last_page={
                                (users as PaginatedDataProps<User>).last_page
                            }
                            total={(users as PaginatedDataProps<User>).total}
                            only="users"
                        />
                    )}
                </div>

                <div className="flex gap-4">
                    <UploadUsersPanel />
                    <PasswordGenerator />
                </div>

                {errorState.summary && (
                    <ErrorTelemetry
                        summary={errorState.summary}
                        details={errorState.details}
                        onClear={() => {
                            setErrorState({
                                summary: null,
                                details: null,
                            });
                        }}
                    />
                )}
            </div>

            {backendDataLocal && (
                <EditUserModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    backendData={backendDataLocal}
                />
            )}
        </AuthenticatedLayout>
    );
}
