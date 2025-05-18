'use client';

import Header from "../components/Header";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { IsOnlineProvider } from "../components/lib/context/IsOnlineContext";
import { FetchStatus } from "@/components/lib/utils";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

declare global {
    interface Window {
        deferredPWAInstallPrompt?: any;
    }
}

export default function RootLayoutClient({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [deferredPrompt, setDeferredPrompt] = useState<null | any>(null);
    const [showInstall, setShowInstall] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // iOS/Safari detection
        const userAgent = window.navigator.userAgent;
        const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
        setIsIOS(isIOSDevice && isSafari);

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("[PWA] Service Worker registered with scope:", registration.scope);
                })
                .catch((error) => {
                    console.error("[PWA] Service Worker registration failed:", error);
                });
        } else {
            console.warn("[PWA] Service Worker not supported in this browser.");
        }

        // Check if the event was already captured (either before or after component mounted)
        if (window.deferredPWAInstallPrompt) {
            console.log('[PWA] Found existing install prompt on mount');
            setDeferredPrompt(window.deferredPWAInstallPrompt);
            setShowInstall(true);
        }

        // Listen for the custom pwaInstallReady event that our early script fires
        const handleInstallReady = () => {
            console.log('[PWA] Install ready event received');
            setDeferredPrompt(window.deferredPWAInstallPrompt);
            setShowInstall(true);
        };

        window.addEventListener('pwaInstallReady', handleInstallReady);

        // Listen for appinstalled event
        const appInstalledHandler = () => {
            console.log("[PWA] App was installed");
            setShowInstall(false);
        };

        window.addEventListener("appinstalled", appInstalledHandler);

        return () => {
            window.removeEventListener('pwaInstallReady', handleInstallReady);
            window.removeEventListener("appinstalled", appInstalledHandler);
        };
    }, []);


    // Only set fetch=true on first ever visit, not on every reload
    useEffect(() => {
        if (sessionStorage.getItem('fetch') === null) {
            sessionStorage.setItem('fetch', FetchStatus.true);
            // Set a random integer between 0 and 100 as a string
            sessionStorage.setItem('randomNumber', Math.floor(Math.random() * 101).toString());
        }
    }, []);

    const handleInstallClick = async () => {
        const promptEvent = deferredPrompt || window.deferredPWAInstallPrompt;
        if (promptEvent) {
            promptEvent.prompt();
            const { outcome } = await promptEvent.userChoice;
            if (outcome === "accepted") {
                setShowInstall(false);
            }
            setDeferredPrompt(null);
            window.deferredPWAInstallPrompt = null;
        }
    }; return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.webmanifest" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.deferredPWAInstallPrompt = null;
                            window.addEventListener('beforeinstallprompt', function(e) {
                                console.log('[PWA] beforeinstallprompt event captured by early script');
                                e.preventDefault();
                                window.deferredPWAInstallPrompt = e;
                                window.dispatchEvent(new Event('pwaInstallReady'));
                            });
                        `
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Analytics />
                {isIOS && (
                    <>
                        <button
                            className="fixed bottom-4 right-6 z-50 p-1 rounded-full bg-accent text-white shadow-lg border border-accent/70 hover:bg-secondary transition flex items-center justify-center"
                            aria-label="Show iOS Install Instructions"
                            onClick={() => setShowIOSInstructions(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-9 6h10" /></svg>
                        </button>
                        {showIOSInstructions && (
                            <div className="fixed inset-0 z-50 flex items-end justify-end px-6 pb-3">
                                <div className="max-w-xs bg-accent text-white rounded-lg shadow-lg px-5 py-4 flex items-center justify-center gap-2 border border-accent/70 relative">
                                    {/* Provided iOS Share SVG */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 0l4 4m-4-4l-4 4M4 20h16" /></svg>
                                    <span className="text-sm font-medium">To install this app, tap <span className="font-bold">Share</span> <span className="inline-block align-middle"><svg fill='#fff' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 -mx-1' style={{ strokeWidth: 1, stroke: 'white' }}><path d='M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z'></path><path d='M24 7h2v21h-2z'></path><path d='M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z'></path></svg></span> then <span className="font-bold">Add to Home Screen</span>.</span>                                    <button
                                        className="absolute top-1 right-1 text-white hover:bg-secondary/60 rounded w-6 h-6 flex items-center justify-center"
                                        aria-label="Close"
                                        onClick={() => setShowIOSInstructions(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" style={{ strokeWidth: 1, stroke: 'white' }} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {!isIOS && showInstall && (
                    <button
                        className="fixed bottom-4 right-6 z-50 px-3 py-2 rounded-lg shadow-lg font-semibold border border-accent bg-accent text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition"
                        onClick={handleInstallClick}
                        type="button"
                    >
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-9 6h10" /></svg>
                            Install App
                        </span>
                    </button>
                )}
                <IsOnlineProvider>
                    <Header />
                    {children}
                </IsOnlineProvider>
                <div className="h-[70px]"></div>
            </body>
        </html>
    );
}
