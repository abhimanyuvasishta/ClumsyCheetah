import type { CSSProperties, ReactNode } from "react";
import { StorefrontConfigProvider } from "@/components/storefront/storefront-config-provider";
import { storefrontCssVars, type StorefrontConfig } from "@/lib/storefront/config";
import { fontStack, googleFontsStylesheetHref } from "@/lib/storefront/fonts";
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
  const href = googleFontsStylesheetHref(config.theme.headingFont, config.theme.bodyFont);
  const style = {
    ...storefrontCssVars(config.theme.colors, config.theme.headingFont, config.theme.bodyFont),
    fontFamily: fontStack(config.theme.bodyFont, "body"),
  } as CSSProperties;

  return (
    <StorefrontConfigProvider value={config}>
      <link rel="stylesheet" href={href} />
      {config.brand.faviconUrl ? <link rel="icon" href={config.brand.faviconUrl} /> : null}
      {config.brand.iconUrl ? <link rel="apple-touch-icon" href={config.brand.iconUrl} /> : null}
      <div className={cn("min-h-full", className)} style={style}>
        {children}
      </div>
    </StorefrontConfigProvider>
  );
}
