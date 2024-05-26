import React, { createContext, useContext } from 'react';
import useStompClient from './useStompClient';

const StompClientContext = createContext();

export const StompClientProvider = ({ url, token, children }) => {
  const stompClient = useStompClient(url, token);

  return (
    <StompClientContext.Provider value={stompClient}>
      {children}
    </StompClientContext.Provider>
  );
};

export const useStomp = () => {
  return useContext(StompClientContext);
};