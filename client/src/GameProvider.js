import { createContext, useEffect } from "react";
import { useGameValues } from "./useGameValues";
import { useStomp } from "./StompClientContext";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { connected, stompClient } = useStomp();
  const { answer, setAnswer, 
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
          finalWinnerWithUser, setFinalWinnerWithUser } = useGameValues();

  /**
   * 準備完了フラグをセットする
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/prepared/' + roomId, (prepared) => {
        setPrepared(prepared);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }
  , [stompClient, connected, prepared]);

  /**
   * ゲームを開始し、テーマと初期値を受信する
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/start/' + roomId, (game) => {
        const data = JSON.parse(game.body);
        setThemeOptions(data.theme);
        setWinner(data.defaultWinner);
        setChallenger(data.defaultChallenger);
      }
      );
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }
  , [stompClient, connected, theme, winner, challenger]);

  /**
   * 新しい回答を受信し、回答をストックする
   */
  useEffect(() => {
    if (connected) {
      // 新しい回答を受信し、回答をストックする
      const subscription = stompClient.subscribe('/topic/answer/' + roomId, (newAnswer) => {
        const data = JSON.parse(newAnswer.body);
        if(challenger === '' || challenger === undefined){
          setChallenger(data.answer)
        }else{
          setAnswer((prevAnswer) => [...prevAnswer, data.answer]);
        }
      });
      // 新しい勝者を受信し、敗者と新しい勝者と挑戦者をセットする
      const subscription2 = stompClient.subscribe('/topic/winner/' + roomId, (newWinner) => {
        const data = JSON.parse(newWinner.body);
        if(data.winner === winner){
          setLoser((prevLoser) => [...prevLoser, challenger]);
        }else{
          setWinner(data.winner)
          setLoser((prevLoser) => [...prevLoser, winner]);
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
      const subscription = stompClient.subscribe('/topic/final/' + roomId, (finalAnswer) => {
        const data = JSON.parse(finalAnswer.body);
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
      const subscription = stompClient.subscribe('/topic/final/select/' + roomId, (finalWinner) => {
        const data = JSON.parse(finalWinner.body);
        setFinalWinnerWithUser(data.finalWinner);
      });
      return () => {
        if (subscription) subscription.unsubscribe();
      }
    }
  }
  , [stompClient, connected, finalWinnerWithUser]);

  /**
   * テーマを子に公開する
   */
  useEffect(() => {
    if (connected) {
      const subscription = stompClient.subscribe('/topic/final/theme/' + roomId, (theme) => {
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
    loser,
    setLoser,
    winner,
    setWinner,
    challenger,
    setChallenger,
    user,
    setUser,
    roomId,
    setRoomId,
    prepared,
    setPrepared,
    themeOptions,
    setThemeOptions,
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