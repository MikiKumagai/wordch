import { useState } from "react";

export const useGameValues = () => {
  const [answer, setAnswer] = useState([]);
  const [looser, setLooser] = useState([]);
  const [winner, setWinner] = useState('初期値1');
  const [challenger, setChallenger] = useState('初期値2');

  return { answer, setAnswer, looser, setLooser, winner, setWinner, challenger, setChallenger };
};