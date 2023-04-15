import React, { useState, createContext } from "react";
export const Context = createContext({
  rooms: [],
  setRooms: () => {},
  unfilteredRooms: [],
  setUnfilteredRooms: () => {},
  user: null,
  setUser: () => {},
});
export const Provider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [unfilteredRooms, setUnfilteredRooms] = useState([]);
  return (
    <Context.Provider value={{ user, setUser,rooms,setRooms,unfilteredRooms,setUnfilteredRooms }}>{children}</Context.Provider>
  );
};
