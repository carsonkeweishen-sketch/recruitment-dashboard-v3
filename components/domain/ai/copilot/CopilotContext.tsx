"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

interface CopilotContextValue {
  moduleKey: string;
  objectType: string;
  objectId: string;
  isPanelOpen: boolean;
  setContext: (moduleKey: string, objectType: string, objectId: string) => void;
  openPanel: () => void;
  closePanel: () => void;
}

const defaultContext: CopilotContextValue = {
  moduleKey: "dashboard",
  objectType: "dashboard",
  objectId: "global",
  isPanelOpen: false,
  setContext: () => {},
  openPanel: () => {},
  closePanel: () => {},
};

const CopilotContext = createContext<CopilotContextValue>(defaultContext);

// ============================================================================
// Provider
// ============================================================================

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [moduleKey, setModuleKey] = useState("dashboard");
  const [objectType, setObjectType] = useState("dashboard");
  const [objectId, setObjectId] = useState("global");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const setContext = useCallback((mk: string, ot: string, oid: string) => {
    setModuleKey(mk);
    setObjectType(ot);
    setObjectId(oid);
  }, []);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  return (
    <CopilotContext.Provider
      value={{ moduleKey, objectType, objectId, isPanelOpen, setContext, openPanel, closePanel }}
    >
      {children}
    </CopilotContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useCopilotContext() {
  return useContext(CopilotContext);
}

export function useCopilotContextFor(moduleKey: string, objectType?: string, objectId?: string) {
  const { setContext } = useCopilotContext();
  const ot = objectType || moduleKey;
  const oid = objectId || "all";
  // Use useEffect pattern via setContext on mount
  // Pages call this in useEffect
  return { setContext: () => setContext(moduleKey, ot, oid) };
}
