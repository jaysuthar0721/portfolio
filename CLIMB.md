# Climb to orbit background

`climb.js` mounts two fixed, decorative SVG layers on the four content pages.
`climb.css` uses the existing light/dark theme variables; the resume and
manufacturing redirect pages intentionally remain redirects.

- Scroll progress is the document scroll offset divided by its scrollable height.
  The altitude indicator maps it to an illustrative 0–400 km.
- Between 18% and 80% progress, a smoothstep crossfade replaces airflow with an
  orbital diagram. Streamline dash offsets and the satellite position also follow
  scroll. There are no time-based animations or idle animation loops.
- A passive scroll listener schedules at most one pending animation frame.
  Layout measurements are cached and refreshed on resize, content-size changes,
  font/image loading, and page restoration. Hidden tabs do not schedule frames.
- Mobile hides alternate flow lines, secondary orbital detail, and most stars;
  translation is reduced from 48 to 18 pixels. SVG uses a 1280×720 viewBox with
  `xMidYMid slice`, so the composition crops without creating horizontal overflow.
- The readout occupies a reserved row in the sticky header, outside the reading
  area. It is illustrative decoration, not real telemetry or a live region.
- Both SVGs and the readout are hidden from assistive technology and ignore
  pointer input. Existing navigation, content, theme control, and dialogs retain
  their behavior.
- `prefers-reduced-motion: reduce` displays a static blended composition, removes
  flow particles and altitude updates, and hides the readout. This preference can
  change while the page is open. Print and forced-colors hide the decoration.
- If JavaScript is unavailable, the original static portfolio remains visible.

## Browser verification

Automated checks use Playwright with installed Microsoft Edge (development only;
neither is shipped with the website):

```sh
npm install --no-save --package-lock=false playwright
node tests/check-climb.cjs
node tests/check-climb-accessibility.cjs
```

Screenshots and the 72-case report go to the system temporary directory under
`portfolio-climb-checks`, or the directory specified by `CLIMB_ARTIFACTS`.
The second script checks keyboard theme switching, dynamic content height,
viewport resizing, forced colors, print, and browser-history restoration.

Verified in headless Microsoft Edge at 1440, 390, and 320 px widths. All 72
page/theme/scroll combinations passed, with no JavaScript errors, horizontal
overflow, or idle animation frames. Reduced motion and project dialogs passed
on all viewports. Physical-device and Safari/Firefox testing remain separate.

Check all four content pages at desktop, 390 px, and 320 px widths in both themes:
top (ALT 000), midpoint (approximately ALT 200), and bottom (ALT 400). Resize,
change motion preference while scrolled, and navigate back to a scrolled page.
Ensure the header and readout do not overlap, no horizontal overflow appears,
and the background never captures clicks or keyboard focus. Open a project
dialog, dismiss it with Escape, and check the theme toggle using the keyboard.
Repeat with JavaScript disabled, reduced motion, forced colors, and print media.

The repository's legacy CSS motion remains disabled; the new background uses
direct scroll-driven updates and does not re-enable old transitions or reveals.
