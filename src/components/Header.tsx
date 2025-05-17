"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cog6ToothIcon, PowerIcon } from "@heroicons/react/24/outline";

const navItems = [
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Header() {
    const pathname = usePathname();
    return (
        <header className="w-full bg-background shadow-lg sticky top-0 z-50 border-b border-secondary/40">
            <nav className="max-w-4xl mx-auto flex items-center justify-between max-[500px]:px-2 max-[460px]:px-1 px-4 py-3 sm:py-4 min-h-[56px]">
                <div className="flex items-center gap-2 min-h-[32px]">
                    <Link href='/'>
                        <span className="text-xl font-extrabold tracking-tight flex flex-row items-center text-accent hover:text-white drop-shadow-sm">
                            Attendance <span className="hidden min-[360px]:flex">&nbsp;Viewer</span>
                        </span>
                    </Link>
                </div>
                <ul className="flex gap-2 sm:gap-4 items-center min-h-[32px]">
                    {navItems.map(({ name, href, icon: Icon }) => (
                        <li key={name} className="flex items-center">
                            <Link
                                href={href}
                                className={`flex items-center gap-1 px-2 py-2 rounded transition-all text-sm font-semibold text-accent hover:bg-secondary/60 hover:text-white ${pathname === href ? "bg-accent text-primary shadow" : ""}`}
                                aria-current={pathname === href ? "page" : undefined}
                            >
                                <Icon className="w-5 h-5" aria-hidden="true" />
                                <span>{name}</span>
                            </Link>
                        </li>
                    ))}
                    <button
                        className="!p-2 rounded-full text-accent hover:text-white hover:bg-secondary/60 transition-colors flex items-center justify-center"
                        title="Logout"
                        onClick={async () => {
                            // Notify SW to clear all caches
                            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                                navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_ALL_CACHES' });
                            }
                            await fetch('/api/logout');
                            window.location.reload();
                        }}
                    >
                        <PowerIcon className="w-5 h-5 stroke-3" />
                    </button>
                </ul>
            </nav>
        </header >
    );
}
