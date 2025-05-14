'use client';

import React, { useState, useEffect } from 'react';
import Login from './Login';
import Attendance from './Attendance';

const LoginForm = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // On page load, send GET request to /api/get-cookie
    fetch('/api/get-cookie', {
      method: 'GET',
      credentials: 'include', // allow cookies to be set
    })
      .then(async (res) => {
        if (res.ok) setLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {!loggedIn ? (
        <Login onLoginSuccess={() => setLoggedIn(true)} />
      ) : (
        <Attendance />
      )}
    </div>
  );
};

export default LoginForm;
