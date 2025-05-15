'use client';

import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import LoginForm from "@/components/LoginForm";
import { useState, useEffect } from "react";
import Spinner from "@/components/Spinner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function LayoutClient({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check login status on mount
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await res.json();
                setLoggedIn(data.loggedIn);
                console.log(data); // Now shows { loggedIn, html }
            } catch (error) {
                setLoggedIn(false);
                console.error('Auth check failed:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Header />
                {loading ? <div className='flex justify-center items-center min-h-[50vh]'><Spinner /></div> : (loggedIn ? children : <LoginForm setLoggedIn={setLoggedIn} />)}
            </body>
        </html>
    );
}
