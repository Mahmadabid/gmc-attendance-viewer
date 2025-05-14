import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert('Login successful!');
        onLoginSuccess();
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('An error occurred during login.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border border-secondary/40 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl text-secondary font-bold text-center mb-6">Login</h2>
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
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 rounded bg-primary text-white font-semibold text-lg hover:bg-secondary transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
