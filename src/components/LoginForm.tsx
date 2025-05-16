'use client';

import Login from './Login';

interface LoginProps {
  setGetData: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm = ({ setGetData }: LoginProps) => {

  return (
    <div>
      <Login setGetData={setGetData} />
    </div>
  );
};

export default LoginForm;
