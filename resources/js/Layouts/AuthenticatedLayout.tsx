import ApplicationLogo from '@/components/custom/ApplicationLogo';
import { PopUp } from '@/components/custom/PopUp';
import ResponsiveNavLink from '@/components/custom/ResponsiveNavLink';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlashProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth, flash } = usePage().props as {
        auth: any;
        flash?: FlashProps;
    };
    const user = auth.user;
    console.log('RENDER - flash:', flash);
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Centralized handle for ubiquitous success notifications —
    // the ONLY place flash.message is read and shown app-wide.
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        console.log('EFFECT FIRED - flash.message:', flash?.success);
        if (flash?.message) {
            console.log('SETTING successMessage to:', flash.message);
            const lastShown = sessionStorage.getItem('lastFlashNotice');
            console.log('lastShown was:', lastShown);
            if (lastShown === flash.message) {
                console.log('SKIPPED — matched lastShown');
                return;
            }
            sessionStorage.setItem('lastFlashNotice', flash.message);

            setSuccessMessage(flash.message);
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 7000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-[#121110]/70 font-mono text-zinc-900 selection:bg-zinc-900 selection:text-zinc-100">
            {/* Success Flash Popup */}
            {successMessage && (
                <PopUp
                    message={successMessage}
                    handleClick={() => setSuccessMessage(null)}
                />
            )}

            {/* TopAppBar - Core Tactical Header Chassis */}
            <header className="fixed top-0 z-40 flex h-20 w-full items-center justify-between border-b border-zinc-300 bg-zinc-50 px-4 select-none sm:px-8">
                <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[14px_14px] opacity-[0.02]"></div>

                <div className="relative z-10 flex items-center gap-6">
                    <Link
                        href="/"
                        className="group clip-corner flex items-center gap-2 border border-transparent p-1 transition-all hover:border-zinc-400"
                    >
                        <ApplicationLogo />
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        <MenuItem href_route="dashboard" name="главная" />
                        <MenuItem href_route="tests.index" name="тесты" />
                        <MenuItem
                            href_route="materials.index"
                            name="материалы"
                        />
                        <MenuItem href_route="users.index" name="группа" />
                    </nav>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none">
                            <div className="group clip-corner flex cursor-pointer items-center gap-3 border border-zinc-300 bg-zinc-100 p-2 text-left transition-all duration-150 hover:border-zinc-400 hover:bg-zinc-200/80">
                                <div className="clip-corner h-9 w-9 shrink-0 overflow-hidden border border-zinc-400 bg-zinc-300">
                                    <img
                                        src={
                                            'https://lh3.googleusercontent.com/aida-public/AB6AXuCjMtRq3WvjElWL0jcAkICvSx71wBX_Yakrq_-bjnTqpa6M6b0U5WM7Hs4d6F9vdeahqHDkByDO5nEEOeo60Azh_EoYbNTRAyzglFQ9u1pApuQq6Dy9AStG7KzDEzb4TTig15nUmKTv5-esspX2ywN5jlyb1qIkmrf7WDyiumoGIli27aBioLPS5jUy-wCrj9N-nlNbuCqEdDDk-EV54n7OLitel_FQ9reMD-vVnMFpw7ZmhBh72NMJeCzPQmawJTqMiKK1d59Kk1pP'
                                        }
                                        alt={user.name}
                                        className="h-full w-full object-cover contrast-125 grayscale filter select-none"
                                    />
                                </div>
                                <div className="hidden border-l-2 border-l-zinc-400 pr-2 pl-2 md:block">
                                    <p className="mb-1 text-xs leading-none font-bold tracking-wide text-zinc-900 uppercase">
                                        {user.name}
                                    </p>
                                    <p className="text-[10px] leading-none font-bold tracking-widest text-zinc-500 uppercase">
                                        [{user.roles?.[0] || 'OPERATOR'}]
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="clip-corner mt-2 w-56 rounded-none border border-zinc-400 bg-zinc-50 p-1 font-mono shadow-none"
                        >
                            <DropdownMenuItem
                                // @ts-ignore
                                onClick={() => router.post(route('logout'))}
                                className="w-full cursor-pointer rounded-none border border-transparent p-2.5 text-left text-xs font-bold tracking-widest text-red-700 uppercase transition-colors hover:bg-red-50 focus:border-red-300 focus:bg-red-50 focus:text-red-800"
                            >
                                // СБРОС_СЕССИИ (ВЫЙТИ)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        onClick={() =>
                            setShowingNavigationDropdown(
                                !showingNavigationDropdown,
                            )
                        }
                        className="clip-corner flex h-9 w-9 cursor-pointer items-center justify-center border border-zinc-300 bg-zinc-100 font-bold text-zinc-800 transition-colors hover:bg-zinc-950 hover:text-zinc-100 lg:hidden"
                    >
                        <span className="text-sm font-black">
                            {showingNavigationDropdown ? '[X]' : '[=]'}
                        </span>
                    </button>
                </div>
            </header>

            <div
                className={`fixed top-20 z-30 w-full border-b border-zinc-300 bg-zinc-50 font-mono transition-all duration-200 lg:hidden ${showingNavigationDropdown ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
            >
                <div className="space-y-2 bg-zinc-100/80 p-4">
                    <ResponsiveNavLink href="#" active={false}>
                        // ПРОЕКТ
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href="#" active={false}>
                        // ОБУЧЕНИЕ
                    </ResponsiveNavLink>
                    <ResponsiveNavLink href="#" active={true}>
                        // ГРУППА
                    </ResponsiveNavLink>
                </div>
            </div>

            <main className="relative z-10 pt-28 pb-12">
                {header && (
                    <div className="mx-auto mb-6 px-4 sm:px-8">
                        <div className="clip-corner relative overflow-hidden border border-zinc-300 bg-zinc-300 p-4">
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[10px_10px] opacity-[0.01]"></div>
                            <div className="relative z-10 text-sm font-bold tracking-wider text-zinc-900 uppercase">
                                {header}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mx-auto px-4 sm:px-8">{children}</div>
            </main>
        </div>
    );
}

const MenuItem = ({
    href_route,
    name,
}: {
    href_route: string;
    name: string;
}) => {
    const routePattern = href_route.includes('.')
        ? `${href_route.split('.')[0]}.*`
        : href_route;

    const isCurrent = route().current(routePattern);

    return (
        <Link
            href={route(href_route)}
            className={`clip-corner px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-colors ${isCurrent
                ? 'border-x border-t border-b-2 border-zinc-300 border-b-amber-600 bg-amber-500/10 text-black'
                : 'text-zinc-600 hover:bg-zinc-300/70 hover:text-zinc-950'
                }`}
        >
            <span className={isCurrent ? 'font-black text-amber-600' : ''}>
                [{' '}
            </span>
            {name}
            <span className={isCurrent ? 'font-black text-amber-600' : ''}>
                {' '}
                ]
            </span>
        </Link>
    );
};