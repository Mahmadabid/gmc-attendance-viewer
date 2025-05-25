"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cog6ToothIcon, PowerIcon } from "@heroicons/react/24/outline";
import { useIsOnline } from "./lib/context/IsOnlineContext";
import { useState } from "react";
import Spinner from "./Spinner";
import { PhoneIcon } from "@heroicons/react/16/solid";

const navItems = [
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
    { name: "Contact Us", href: "/contact", icon: PhoneIcon }, // Use PowerIcon as placeholder, replace with a mail icon if desired
];

export default function Header() {
    const pathname = usePathname();
    const isOnline = useIsOnline();
    const [showLogoutSpinner, setShowLogoutSpinner] = useState(false);

    return (
        <>
            {showLogoutSpinner && (
                <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[99]">
                    <Spinner />
                </div>
            )}
            <header className="w-full bg-background shadow-lg sticky top-0 z-[100] border-b border-secondary/40">
                <nav className="max-w-4xl mx-auto flex items-center justify-between max-[500px]:px-2 max-[460px]:px-1 px-4 py-3 sm:py-4 min-h-[56px]">
                    <div className="flex items-center gap-2 min-h-[32px]">
                        <Link href='/'>
                            <span className="text-xl font-extrabold tracking-tight flex flex-row items-center text-accent hover:text-blue-200/90 drop-shadow-sm">
                                Attendance <span className="hidden min-[360px]:flex">&nbsp;Viewer</span>
                            </span>
                        </Link>
                    </div>
                    <ul className="flex gap-2 sm:gap-4 items-center min-h-[32px]">
                        {navItems.map(({ name, href, icon: Icon }) => (
                            <li key={name} className="flex items-center">
                                <Link
                                    href={href}
                                    className={`flex items-center gap-1 px-2 py-2 rounded transition-all text-sm font-semibold text-accent hover:bg-secondary/60 hover:text-blue-200 ${pathname === href ? "bg-accent text-primary shadow" : ""}`}
                                    aria-current={pathname === href ? "page" : undefined}
                                >
                                    <Icon className="w-5 h-5" aria-hidden="true" />
                                    <span className={`${name !== 'Settings' ? 'max-[500px]:hidden': 'max-[400px]:hidden'}`}>{name}</span>
                                </Link>
                            </li>
                        ))}
                        <button
                            className={`relative overflow-visible p-2 rounded-full flex items-center justify-center transition-colors ${isOnline ? 'text-accent hover:text-blue-200 hover:bg-secondary/60' : 'text-red-400 bg-red-200 cursor-not-allowed'}`}
                            title={isOnline ? 'Logout' : 'Offline: Logout disabled'}
                            onClick={async () => {
                                setShowLogoutSpinner(true);
                                try {
                                    // Only clear data caches on logout (keep static assets cached)
                                    if ('caches' in window) {
                                        const cacheNames = await caches.keys();
                                        await Promise.all(
                                            cacheNames
                                                .filter(name => name.startsWith('api-data'))
                                                .map(name => caches.delete(name))
                                        );
                                    }
                                    await fetch('/api/logout');
                                } finally {
                                    sessionStorage.clear();
                                    window.location.reload();
                                }
                            }}
                            disabled={!isOnline}
                        >
                            <span className="relative flex items-center justify-center w-5 h-5">
                                <PowerIcon className="w-5 h-5 stroke-3 z-10" />
                                {!isOnline && (
                                    <svg className="absolute left-0 top-0 w-5 h-5 pointer-events-none z-20" viewBox="0 0 20 20">
                                        <line x1="2" y1="18" x2="18" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                )}
                            </span>
                        </button>
                    </ul>
                </nav>
            </header >
        </>
    );
}
