import { createContext } from "react";
import { EnrichedUser } from "../types";

export const ScanScreenContext = createContext({
  enrichedUsers: [] as EnrichedUser[],
  setEnrichedUsers: (value: EnrichedUser[]) => {},
  selectedUserIndex: 0,
  setSelectedUserIndex: (value: number) => {},
});
