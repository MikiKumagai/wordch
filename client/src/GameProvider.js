import { createContext } from "react";
import { useGameValues } from "./useGameValues";

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  return (
    <GameContext.Provider value={useGameValues()}>
      {children}
    </GameContext.Provider>
  );
};