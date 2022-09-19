import React from "react";
export const MyContext = React.createContext({
  user: null,
  setUser: () => {},
});
