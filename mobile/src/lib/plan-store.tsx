import { createContext, useContext, useState, type ReactNode } from 'react';

import type { GenerateRequest, GenerateResponse } from './types';

interface PlanState {
  request: GenerateRequest | null;
  result: GenerateResponse | null;
  setPlan: (request: GenerateRequest, result: GenerateResponse) => void;
}

const PlanContext = createContext<PlanState | null>(null);

// In-memory for the scaffold. Saved recipes move to Supabase once sign-in lands in the app.
export function PlanProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<GenerateRequest | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  return (
    <PlanContext.Provider
      value={{
        request,
        result,
        setPlan: (req, res) => {
          setRequest(req);
          setResult(res);
        },
      }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used inside PlanProvider');
  return ctx;
}
