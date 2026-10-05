import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
////////////////////////////////////////////////
import { MaterialCover } from "./Partials/MaterialCover";
import { PageProps, UploadType } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DeploymentModal } from "./Partials/DeploymentModal";
import { DeleteConfirmationModal } from "./Partials/DeleteConfirmationModal";
import { PopUp } from "@/components/custom/PopUp";
import { Pagination } from "@/components/custom/Pagination";

export default function Index({ materials }: PageProps<UploadType>) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [delModConf, setDelModConf] = useState<{
        isOpen: boolean,
        title: string,
        id: string,
    }>({ isOpen: false, title: "", id: '' });
    const [item, setItem] = useState<string>('');

    useEffect(() => {
        console.log(item)
    }, [item]);


    const flash = (usePage().props as any).flash.success as string;
    const REPLICATED_WATERMARK_TEXT = "материалы";
    const WATERMARK_LAYOUT_MAP = ["left-[3%]", "left-[62%]"];
    const mdata = materials.data;

    useEffect(() => {
        if (!flash) return;

        setMessage(flash)
        setTimeout(() => {
            setMessage(null)
        }, 7000);
    }, [flash]);

    // Total count must read from the metadata layer, otherwise it resets to 10 on every slice
    const totalCount = materials.total;

    return (
        <AuthenticatedLayout>
            <main className="min-h-screen bg-linear-to-r from-zinc-200/70 via-zinc-200/40 to-zinc-300/30 p-4 md:p-8 flex flex-col gap-8 relative select-none">
                {message && <PopUp message={message} handleClick={() => {
                    setMessage(null);
                }} />}
                <div className="relative p-4 md:p-6 bg-zinc-50 border border-zinc-300/90 overflow-hidden rounded-xs z-10 clip-corner shadow-xs">
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[12px_12px] pointer-events-none z-0"></div>
                    {WATERMARK_LAYOUT_MAP.map((position, idx) => (
                        <div
                            key={idx}
                            className={`absolute top-36 ${position} text-9xl font-black text-zinc-950/1.5 font-mono pointer-events-none transform -rotate-3 z-0 uppercase tracking-widest`}
                        >
                            {REPLICATED_WATERMARK_TEXT}
                        </div>
                    ))}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-zinc-100/80 border border-zinc-300/80 relative z-10 font-mono clip-corner shadow-xs">
                        <div className="relative pl-4 border-l-4 border-zinc-950 py-0.5">
                            <div className="absolute top-0 left-0 w-2 h-1 bg-amber-500 -ml-1"></div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-black text-zinc-900 uppercase tracking-wide">
                                    Материалы
                                </h1>
                                <span className="text-[9px] text-zinc-500 font-bold tracking-wider ml-1 bg-zinc-200 border border-zinc-300/70 px-1.5 py-0.5 clip-corner">
                                    [{totalCount} UNITS_INDEXED]
                                </span>
                            </div>
                            <p className="text-zinc-500 text-[10px] uppercase tracking-wider">
                                // Архивы спецификаций системных узлов и ресурсов
                            </p>
                        </div>
                        <div className="flex gap-5">
                            {/* Edit Mode Button */}
                            <button
                                onClick={() => {
                                    setEditMode(!editMode);
                                }}
                                className="group relative px-6 py-2 bg-zinc-700 border border-amber-500/50 text-amber-500 text-xs font-mono font-bold uppercase tracking-[0.2em] 
    hover:bg-amber-500 hover:text-zinc-950 transition-all duration-200 
    before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-amber-500 
    hover:before:bg-zinc-950 cursor-pointer"
                            >
                                [ 01_РЕЖИМ_РЕДАКТИРОВАНИЯ ]
                            </button>

                            {/* Upload Button */}
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="group relative px-6 py-2 bg-amber-500/10 border border-amber-500 text-amber-500 text-xs font-mono font-bold uppercase tracking-[0.2em] 
    hover:bg-amber-500 hover:text-zinc-950 transition-all duration-200 
    clip-path-hazard cursor-pointer"
                            >
                                [ 02_ЗАГРУЗИТЬ_ПАКЕТ ]
                            </button>
                        </div>
                    </div>

                    {/* Data Matrix Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10 items-start">
                        {mdata.map((item) => (
                            <div
                                key={item.id}
                                className="group cursor-pointer flex flex-col bg-zinc-100/30 border border-zinc-300/60 p-2 clip-corner hover:border-zinc-400 hover:bg-zinc-100/70 transition-all duration-150 shadow-xs relative"
                            >
                                <div className="absolute top-0 right-0 w-1 h-1 bg-zinc-400/30 group-hover:bg-amber-500 m-1 transition-colors"></div>
                                <div className="w-full mb-3" onClick={() => {
                                    router.get(route('materials.show', { id: item.id }));
                                }}>
                                    <MaterialCover item={item} />
                                </div>
                                <div className="px-1">
                                    <h5 className="text-xs font-bold font-mono truncate text-zinc-900 transition-all duration-150 border-b border-transparent group-hover:text-amber-600 group-hover:border-amber-500/40 pb-0.5">
                                        {item.title}
                                    </h5>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-300/50 font-mono text-[9px]">
                                        <p className="text-zinc-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                            <i className={`fa-solid || 'text-zinc-400'} text-[9px]`}></i>
                                            {item.type}
                                        </p>
                                        <span className="text-zinc-400 font-mono text-[8px] font-bold tracking-tighter">{item.id}</span>
                                    </div>
                                </div>
                                {editMode && (
                                    <div className="flex bottom-6 right-6 z-50 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        {/* CANCEL BUTTON */}
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="flex-1 py-3 bg-zinc-200 border border-zinc-400 text-zinc-600 text-[10px] font-mono font-bold uppercase tracking-[0.2em] 
      hover:bg-zinc-300 hover:text-zinc-900 transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.1)] text-nowrap"
                                        >
                                            [ ОТМЕНА ]
                                        </button>

                                        {/* COMMIT BUTTON */}
                                        <button
                                            onClick={() => {
                                                setDelModConf({
                                                    isOpen: true,
                                                    title: item.title + " [" + item.type + "]",
                                                    id: item.id
                                                });
                                            }}
                                            className="flex-1 py-3 bg-zinc-950 border border-amber-600 text-amber-500 text-[10px] font-mono font-bold uppercase tracking-[0.2em] 
      hover:bg-amber-600 hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_rgba(217,119,6,0.3)] text-nowrap"
                                        >
                                            [ УСТРАНИТЬ ]
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <Pagination
                        links={materials.links}
                        current_page={materials.current_page}
                        last_page={materials.last_page}
                        total={materials.total}
                    />

                </div>
                <DeploymentModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                />
                <DeleteConfirmationModal
                    isOpen={delModConf.isOpen}
                    onClose={() => setDelModConf({
                        isOpen: false,
                        title: '',
                        id: ''
                    })}
                    itemName={delModConf.title}
                    onConfirm={() => {
                        router.delete(route('materials.destroy', { id: delModConf.id }));
                    }}
                />
            </main>
        </AuthenticatedLayout>
    );
}