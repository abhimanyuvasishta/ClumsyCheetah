export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Project origin + anon key, or null if Vercel/local env is missing or not a real URL. */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const rawUrl = stripWrappingQuotes(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const anonKey = stripWrappingQuotes(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");
  if (!rawUrl || !anonKey || !isHttpUrl(rawUrl)) {
    return null;
  }
  const parsed = new URL(rawUrl);
  // Auth client rejects URLs with a path (e.g. /rest/v1). Always use origin only.
  const url = `${parsed.protocol}//${parsed.host}`;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}
