import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from "../../GameProvider";

const Countdown = (role) => {
  const [seconds, setSeconds] = useState(5);
  const navigate = useNavigate();
  const { setAnswer, setLooser, setWinner, setChallenger } = useContext(GameContext);

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timerId);
    }
    if(seconds === 0){
      setAnswer([])
      setLooser([])
      setWinner('defaultValue1')
      setChallenger('defaultValue2')
      navigate(`/${role.role}/final`)
    }
  }, [seconds]);
  
  return <div>残り時間：{seconds} 秒</div>;
};

export default Countdown;