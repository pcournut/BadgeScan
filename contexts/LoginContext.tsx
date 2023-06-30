import { createContext } from "react";

export const LoginContext = createContext({
  devEnvironment: true,
  setDevEnvironment: (value: boolean) => {},
});
