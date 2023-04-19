import React, { useState, createContext } from "react";
export const Context = createContext({
  rooms: [],
  setRooms: () => {},
  unfilteredRooms: [],
  setUnfilteredRooms: () => {},
  user: null,
  setUser: () => {},
  checking: true,
  setChecking: () => {},
});
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [unfilteredRooms, setUnfilteredRooms] = useState([]);
  const [checking, setChecking] = useState(true);
  return (
    <Context.Provider value={{ user, setUser,rooms,setRooms,unfilteredRooms,setUnfilteredRooms,checking,setChecking }}>{children}</Context.Provider>
  );
};
