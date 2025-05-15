'use client';

import Login from './Login';

interface LoginProps {
  setLoggedIn: (loggedIn: boolean) => void;
}

const LoginForm = ({ setLoggedIn }: LoginProps) => {
  // onLoginSuccess just sets loggedIn to true
  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  return (
    <div>
      <Login onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginForm;
