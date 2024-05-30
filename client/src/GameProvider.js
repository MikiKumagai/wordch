import { createContext, useEffect } from "react";
import { useGameValues } from "./useGameValues";
import { useStomp } from "./StompClientContext";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { connected, stompClient } = useStomp();
  const { answer, setAnswer, 
          looser, setLooser, 
          winner, setWinner, 
          challenger, setChallenger, 
          user, setUser, 
          prepared, setPrepared, 
          theme, setTheme, 
          showTheme, setShowTheme,
          finalAnswerWithUser, setFinalAnswerWithUser, 
          finalWinnerWithUser, setFinalWinnerWithUser } = useGameValues();

  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/prepared', (prepared) => {
        setPrepared(prepared);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }
  , [stompClient, connected, prepared]);

  useEffect(() => {
    if (connected) {
      // 新しい回答を受信し、回答をストックする
      const subscription = stompClient.subscribe('/topic/answer', (newAnswer) => {
        const data = JSON.parse(newAnswer.body);
        if(challenger === '' || challenger === undefined){
          setChallenger(data.answer)
        }else{
          setAnswer((prevAnswer) => [...prevAnswer, data.answer]);
        }
      });
      // 新しい勝者を受信し、敗者と新しい勝者と挑戦者をセットする
      const subscription2 = stompClient.subscribe('/topic/winner', (newWinner) => {
        const data = JSON.parse(newWinner.body);
        if(data.winner === winner){
          setLooser((prevLooser) => [...prevLooser, challenger]);
        }else{
          setWinner(data.winner)
          setLooser((prevLooser) => [...prevLooser, winner]);
        }
        setChallenger(answer[0])
        answer.shift()
      });
      return () => {
        if (subscription) subscription.unsubscribe();
        if (subscription2) subscription2.unsubscribe();
      };
    }
  }, [stompClient, connected, answer, winner, challenger]);

  /**
   * 最終回答を受信し、最終回答とユーザーをセットする
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/final', (finalAnswer) => {
        const data = JSON.parse(finalAnswer.body);
        console.log(data);
        const setData = data.finalAnswer + ' - ' + data.user;
        setFinalAnswerWithUser((prevFinalAnswerWithUser) => [...prevFinalAnswerWithUser, setData]);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }, [stompClient, connected, finalAnswerWithUser]);

  /**
   * 最終勝者を受信し、最終勝者とユーザーをセットする
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/final/select', (finalWinner) => {
        const data = JSON.parse(finalWinner.body);
        console.log(data);
        setFinalWinnerWithUser(data.finalWinner);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }
  , [stompClient, connected, finalWinnerWithUser]);

  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/final/theme', (theme) => {
        const data = JSON.parse(theme.body);
        setShowTheme(data);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }
  , [stompClient, connected, showTheme]);

  const value = {
    answer,
    setAnswer,
    looser,
    setLooser,
    winner,
    setWinner,
    challenger,
    setChallenger,
    user,
    setUser,
    prepared,
    setPrepared,
    theme,
    setTheme,
    showTheme,
    setShowTheme,
    finalAnswerWithUser, 
    setFinalAnswerWithUser, 
    finalWinnerWithUser, 
    setFinalWinnerWithUser
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};