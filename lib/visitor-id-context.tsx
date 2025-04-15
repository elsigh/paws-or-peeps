"use client";

import { createContext, useContext, type ReactNode } from "react";

type VisitorIdContextType = {
  visitorId: string | null;
};

const VisitorIdContext = createContext<VisitorIdContextType>({
  visitorId: null,
});

export const useVisitorId = () => useContext(VisitorIdContext);

export function VisitorIdProvider({
  children,
  visitorId,
}: {
  children: ReactNode;
  visitorId: string | null;
}) {
  return (
    <VisitorIdContext.Provider value={{ visitorId }}>
      {children}
    </VisitorIdContext.Provider>
  );
}
