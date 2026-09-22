import type { CSSProperties, ReactNode } from "react";
import { StorefrontConfigProvider } from "@/components/storefront/storefront-config-provider";
import { storefrontCssVars, type StorefrontConfig } from "@/lib/storefront/config";
import { cn } from "@/lib/utils";

export function StorefrontTheme({
  config,
  className,
  children,
}: {
  config: StorefrontConfig;
  className?: string;
  children: ReactNode;
}) {
  return (
    <StorefrontConfigProvider value={config}>
      <div className={cn("min-h-full", className)} style={storefrontCssVars(config.theme.colors) as CSSProperties}>
        {children}
      </div>
    </StorefrontConfigProvider>
  );
}
