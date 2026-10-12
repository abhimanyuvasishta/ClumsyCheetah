/** Popular free Google Fonts. Any other Google Font family can be typed in by name. */
export const GOOGLE_FONTS = [
  "Fraunces",
  "Geist",
  "Inter",
  "Lora",
  "Merriweather",
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Source Serif 4",
  "EB Garamond",
  "Cinzel",
  "DM Serif Display",
  "Josefin Sans",
  "Josefin Slab",
  "Karla",
  "Lato",
  "Montserrat",
  "Nunito",
  "Nunito Sans",
  "Open Sans",
  "Oswald",
  "Outfit",
  "Poppins",
  "Raleway",
  "Roboto",
  "Roboto Slab",
  "Rubik",
  "Work Sans",
  "Manrope",
  "DM Sans",
  "Figtree",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "IBM Plex Sans",
  "IBM Plex Serif",
  "Noto Sans",
  "Noto Serif",
  "PT Serif",
  "PT Sans",
  "Quicksand",
  "Comfortaa",
  "Pacifico",
  "Great Vibes",
  "Sacramento",
  "Dancing Script",
  "Caveat",
  "Amatic SC",
  "Bebas Neue",
  "Archivo",
  "Barlow",
  "Mulish",
  "Urbanist",
  "Sora",
  "Lexend",
  "Newsreader",
  "Fraunces",
  "Instrument Serif",
  "Instrument Sans",
  "Bricolage Grotesque",
  "Young Serif",
  "Libre Franklin",
  "Source Sans 3",
  "Alegreya",
  "Alegreya Sans",
  "Cardo",
  "Spectral",
  "Old Standard TT",
  "Tinos",
  "Arvo",
  "Zilla Slab",
  "Crete Round",
  "Patua One",
  "Fredoka",
  "Baloo 2",
  "Comic Neue",
  "Inconsolata",
  "JetBrains Mono",
] as const;

const UNIQUE_FONTS = [...new Set(GOOGLE_FONTS)].sort((a, b) => a.localeCompare(b));

export const FREE_FONT_OPTIONS = UNIQUE_FONTS;

export function sanitizeFontFamily(value: string, fallback: string): string {
  const trimmed = value.trim().replace(/['"]/g, "");
  if (!trimmed || trimmed.length > 60) return fallback;
  if (!/^[A-Za-z0-9][A-Za-z0-9 \-]*$/.test(trimmed)) return fallback;
  return trimmed;
}

export function googleFontsStylesheetHref(heading: string, body: string): string {
  const families = [...new Set([heading, body])].map(
    (name) => `family=${encodeURIComponent(name).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700`,
  );
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

export function fontStack(family: string, kind: "heading" | "body"): string {
  const fallback = kind === "heading" ? "Georgia, serif" : "ui-sans-serif, system-ui, sans-serif";
  return `"${family}", ${fallback}`;
}
