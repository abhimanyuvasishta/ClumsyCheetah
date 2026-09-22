"use client";

import { createContext, useContext } from "react";
import { defaultStorefrontConfig, type StorefrontConfig } from "@/lib/storefront/config";

const StorefrontConfigContext = createContext<StorefrontConfig>(defaultStorefrontConfig);

export function StorefrontConfigProvider({
  value,
  children,
}: {
  value: StorefrontConfig;
  children: React.ReactNode;
}) {
  return <StorefrontConfigContext.Provider value={value}>{children}</StorefrontConfigContext.Provider>;
}

export function useStorefrontConfig(): StorefrontConfig {
  return useContext(StorefrontConfigContext);
}
