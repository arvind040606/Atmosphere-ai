import { createContext, useState, type ReactNode } from "react";
import type { ConditionFamily } from "../constants/weather";

interface WeatherFamilyCtx {
  family: ConditionFamily;
  setFamily: (f: ConditionFamily) => void;
}

// Context objects are not components but must live here alongside the
// provider. Fast-refresh handles this fine in practice.
// eslint-disable-next-line react-refresh/only-export-components
export const WeatherFamilyContext = createContext<WeatherFamilyCtx>({
  family: "sun",
  setFamily: () => {},
});

export function WeatherFamilyProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<ConditionFamily>("sun");
  return (
    <WeatherFamilyContext.Provider value={{ family, setFamily }}>
      {children}
    </WeatherFamilyContext.Provider>
  );
}
