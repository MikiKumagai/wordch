import { createContext, useEffect } from "react";
import { useGameValues } from "./useGameValues";
import { useStomp } from "./StompClientContext";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { connected, stompClient } = useStomp();
  const { answer, setAnswer, looser, setLooser, winner, setWinner, challenger, setChallenger, user, setUser } = useGameValues();
  useEffect(() => {
    if (connected) {
      // 新しい回答を受信し、回答をストックする
      const subscription = stompClient.subscribe('/topic/answer', (newAnswer) => {
        const data = JSON.parse(newAnswer.body);
        setAnswer((prevAnswer) => [...prevAnswer, data.answer]);
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
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};