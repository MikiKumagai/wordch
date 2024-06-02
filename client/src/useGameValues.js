import { useState } from "react";

export const useGameValues = () => {
  const [answer, setAnswer] = useState([]);
  const [loser, setLoser] = useState([]);
  const [themeOptions, setThemeOptions] = useState([]);
  const [theme, setTheme] = useState('');
  const [winner, setWinner] = useState('');
  const [challenger, setChallenger] = useState('');
  const [user, setUser] = useState('');
  const [roomId, setRoomId] = useState('');
  const [prepared, setPrepared] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [finalAnswerWithUser, setFinalAnswerWithUser] = useState([]);
  const [finalWinnerWithUser, setFinalWinnerWithUser] = useState('');

  return { answer, setAnswer, 
           loser, setLoser, 
           winner, setWinner, 
           challenger, setChallenger, 
           user, setUser, 
           roomId, setRoomId,
           prepared, setPrepared, 
           themeOptions, setThemeOptions,
           theme, setTheme, 
           showTheme, setShowTheme,
           finalAnswerWithUser, setFinalAnswerWithUser, 
           finalWinnerWithUser, setFinalWinnerWithUser};
};