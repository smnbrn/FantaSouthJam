"use client";

import * as React from "react";

import { UserContext, type UserContextValue } from "@/providers/user-provider";

/** Utente e profilo correnti, condivisi da <UserProvider> (vedi src/providers/user-provider.tsx). */
export function useUser(): UserContextValue {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser deve essere usato dentro <UserProvider>");
  return ctx;
}
