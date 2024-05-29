import React, { useState, useEffect } from 'react';

const Countdown = () => {
  const [seconds, setSeconds] = useState(120);

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [seconds]);
  
  return <div>残り時間：{seconds} 秒</div>;
};

export default Countdown;