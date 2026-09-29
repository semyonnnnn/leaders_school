import { router } from '@inertiajs/react';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    total: number;
    // Optional Inertia prop key (e.g., 'users' or 'my_tests')
    // Partial reload only triggers when explicitly passed
    only?: string;
}

export const Pagination = ({
    links,
    current_page,
    last_page,
    total,
    only,
}: PaginationProps) => {
    // Hide component entirely if there are no pages to navigate
    if (!links || links.length <= 3) return null;

    const handlePageClick = (url: string) => {
        router.get(
            url,
            {},
            {
                ...(only ? { only: [only] } : {}),
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="clip-corner relative z-10 mt-8 flex items-center justify-between border border-zinc-300/80 bg-zinc-100 p-3 font-mono text-xs shadow-xs">
            <div className="text-[9px] font-bold text-zinc-500 uppercase">
                // Сектор: {current_page} из {last_page} [Всего: {total}]
            </div>
            <div className="flex gap-1">
                {links.map((link, idx) => {
                    const cleanLabel = link.label
                        .replace('&laquo; Previous', '[ ПРЕД ]')
                        .replace('Next &raquo;', '[ СЛЕД ]');

                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className="clip-corner cursor-not-allowed border border-zinc-200 bg-zinc-200/30 px-2 py-1 text-[10px] text-zinc-400"
                            >
                                {cleanLabel}
                            </span>
                        );
                    }

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handlePageClick(link.url!)}
                            className={`cursor-pointer border px-3 py-1.5 font-mono text-[10px] font-black tracking-widest uppercase transition-all duration-75 select-none active:scale-98 ${
                                link.active
                                    ? 'translate-y-0.5 border-orange-950 bg-orange-700 text-orange-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                                    : 'border-zinc-950 bg-zinc-800 text-zinc-400 shadow-[0_2px_0_#09090b] hover:translate-y-0.5 hover:border-orange-900 hover:text-orange-500 hover:shadow-none'
                            }`}
                        >
                            <span className="ac-text block">{cleanLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
