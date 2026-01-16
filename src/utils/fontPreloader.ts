/**
 * Font Preloader Utility
 * Preloads all typography fonts used in the configurator to prevent FOUT
 */

const TYPOGRAPHY_FONTS = [
  { family: 'Inter', weights: [300, 400, 500, 600, 700, 800] },
  { family: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900] },
  { family: 'Syne', weights: [400, 500, 600, 700, 800] },
  { family: 'Space Grotesk', weights: [300, 400, 500, 600, 700] },
  { family: 'Cormorant Garamond', weights: [300, 400, 500, 600, 700] },
  { family: 'Oswald', weights: [400, 500, 600, 700] },
];

/**
 * Preloads all typography fonts to ensure they're available before use.
 * Uses the CSS Font Loading API for reliable font detection.
 */
export async function preloadTypographyFonts(): Promise<void> {
  if (!document.fonts) return;

  const loadPromises = TYPOGRAPHY_FONTS.flatMap(({ family, weights }) =>
    weights.map((weight) =>
      document.fonts.load(`${weight} 16px "${family}"`).catch(() => {
        // Silently ignore individual font loading failures
      })
    )
  );

  await Promise.allSettled(loadPromises);
}

/**
 * Checks if a specific font weight/family combination is loaded.
 */
export function isFontLoaded(family: string, weight: number): boolean {
  if (!document.fonts) return true; // Assume loaded if API unavailable
  return document.fonts.check(`${weight} 16px "${family}"`);
}
