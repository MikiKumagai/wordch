import { useState } from "react";

export const useGameValues = () => {
  const [answer, setAnswer] = useState([]);
  const [looser, setLooser] = useState([]);
  const [winner, setWinner] = useState('defaultValue1');
  const [challenger, setChallenger] = useState('defaultValue2');
  const [user, setUser] = useState('');
  const [prepared, setPrepared] = useState(false);
  const [theme, setTheme] = useState('defaultValue3');
  const [showTheme, setShowTheme] = useState(false);
  const [finalAnswerWithUser, setFinalAnswerWithUser] = useState([]);
  const [finalWinnerWithUser, setFinalWinnerWithUser] = useState('');

  return { answer, setAnswer, 
           looser, setLooser, 
           winner, setWinner, 
           challenger, setChallenger, 
           user, setUser, 
           prepared, setPrepared, 
           theme, setTheme, 
           showTheme, setShowTheme,
           finalAnswerWithUser, setFinalAnswerWithUser, 
           finalWinnerWithUser, setFinalWinnerWithUser};
};