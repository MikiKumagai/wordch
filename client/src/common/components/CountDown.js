import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Countdown = (role) => {
  const [seconds, setSeconds] = useState(120);
  const navigate = useNavigate();

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timerId);
    }
    if(seconds === 0){
      navigate(`/${role.role}/final`)
    }
  }, [seconds]);
  
  return <div>残り時間：{seconds} 秒</div>;
};

export default Countdown;