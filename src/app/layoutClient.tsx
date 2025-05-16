'use client';

import Header from "../components/Header";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";

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
                <Header />
                {isIOS && (
                    <div className="fixed bottom-4 right-6 z-50 max-w-xs bg-accent text-white rounded-lg shadow-lg px-5 py-4 flex items-center gap-2 border border-accent/70">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-9 6h10" /></svg>
                        <span className="text-sm font-medium">To install this app, tap <span className="font-bold">Share</span> <span className="inline-block align-middle">&#x2191;</span> then <span className="font-bold">Add to Home Screen</span>.</span>
                    </div>
                )}
                {!isIOS && showInstall && (
                    <button
                        className="fixed bottom-4 right-6 z-50 px-3 py-2 rounded-lg shadow-lg font-semibold border border-accent bg-accent text-white hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition"
                        onClick={handleInstallClick}
                        type="button"
                    >
                        <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-9 6h10" /></svg>
                            Install App
                        </span>
                    </button>
                )}
                {children}
                <div className="h-[70px]"></div>
            </body>
        </html>
    );
}
