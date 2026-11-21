import React, { createContext, useContext, useState } from 'react';

const DisguiseContext = createContext(null);

export const DisguiseProvider = ({ children }) => {
  const [isDisguised, setIsDisguised] = useState(false);
  const [disguiseType, setDisguiseType] = useState('calculator'); // 'calculator' | 'weather'

  const activateDisguise = (type = 'calculator') => {
    setDisguiseType(type);
    setIsDisguised(true);
  };

  const deactivateDisguise = () => {
    setIsDisguised(false);
  };

  return (
    <DisguiseContext.Provider value={{
      isDisguised,
      disguiseType,
      activateDisguise,
      deactivateDisguise
    }}>
      {children}
    </DisguiseContext.Provider>
  );
};

export const useDisguise = () => useContext(DisguiseContext);
