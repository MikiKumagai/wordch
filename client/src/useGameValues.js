import { useState } from "react";

export const useGameValues = () => {
  const [answer, setAnswer] = useState([]);
  const [looser, setLooser] = useState([]);
  const [winner, setWinner] = useState('defaultValue1');
  const [challenger, setChallenger] = useState('defaultValue2');
  const [user, setUser] = useState('');
  const [prepared, setPrepared] = useState(false);

  return { answer, setAnswer, looser, setLooser, winner, setWinner, challenger, setChallenger, user, setUser, prepared, setPrepared};
};