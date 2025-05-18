'use client';

import React, { useState } from 'react';
import { SimpleSpinner } from './Spinner';
import { useIsOnline } from './lib/context/IsOnlineContext';
import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';

interface LoginProps {
  setGetData: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({ setGetData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const isOnline = useIsOnline();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Login successful!');
        setMessageType('success');
        // // Clear all caches
        // if ('caches' in window) {
        //   caches.keys().then(keys => {
        //     keys.forEach(key => caches.delete(key));
        //   });
        // }
        setGetData(prev => !prev);
        // Notify SW to cache attendance data
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CACHE_ATTENDANCE' });
        }
      } else {
        setMessage('Login failed: ' + (data.error || 'Unknown error'));
        setMessageType('error');
      }
    } catch (err) {
      setMessage('An error occurred during login.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isOnline ? 'mt-16' : 'mt-6'}`}>
      {!isOnline && (
        <div className="flex justify-center items-center mx-2 text-red-700 bg-red-100 border border-red-300 rounded p-2 mb-6 font-semibold">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-700 mr-2" />
          You are Offline. Please check your internet connection.
        </div>
      )}
      <div className="max-w-md mx-auto p-6 border border-secondary/40 rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl text-secondary font-bold text-center mb-6">Login</h2>
        {message && (
          <div className={`mb-4 text-center rounded p-1 font-semibold ${messageType === 'success' ? 'text-green-600 bg-green-200' : 'text-red-700 bg-red-200'} `}>
            {message === 'Invalid Username or Password' ? (
              <div className="alert alert-danger">Invalid Username or Password</div>
            ) : (
              message
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="mb-2">
            <label htmlFor="username" className="block mb-1 font-medium text-foreground">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-secondary/40 rounded bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium text-foreground">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-secondary/40 rounded bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-primary flex justify-center items-center text-white font-semibold text-lg hover:bg-secondary transition-colors"
            disabled={loading || !isOnline}
          >
            {loading ? <SimpleSpinner /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
