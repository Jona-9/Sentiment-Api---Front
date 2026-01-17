import React from 'react';

const Auth = ({ type }) => {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      {type === 'login' ? 'Login' : 'Register'}
    </div>
  );
};

export default Auth;
