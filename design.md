# Jay Suthar portfolio design

## Direction
Swiss industrial typography: white background, CSU green, geometric headings, restrained rules, and no shadows or decorative gradients. The site is plain HTML, CSS, and JavaScript, with no build step. Preserve Unbounded for headings and Geist for body text.

## Tokens
- Background: `#ffffff`; primary text: `#151a16`; body text: `#454d46`.
- Muted labels: `#606760`, replacing the previous low-contrast gray.
- Green: `#1e4d2b`; green hover: `#266138`.
- Active navigation and resume link: `#a84300`, a darker orange for readable small text.
- Dividers: `#dce1dc`; image placeholder fill: `#f3f5f3`.
- Content width: 1280px. Horizontal padding scales from 20px to 80px.

## Layout
- Navigation: compact sticky white bar with a thin divider, two links, 44px minimum link height, and an underlined current page.
- Home: two columns. Name, introduction, and project-first actions on the left; an existing portrait in a solid green frame on the right. No image masking. The two introductory paragraphs remain separate for reading.
- At 700px and below, the portrait follows the introduction and remains visible. No horizontal overflow at small phone widths.
- About: section labels in a narrow left column; headings and prose in a wider right column. Competencies are separated by thin rules.
- Projects: large titles, honest image placeholders, and a label/content grid for Challenge, Action, and Impact. Do not fabricate photos or completed case studies.
- Interior label/content grids stack below 700px.
- Footer: compact divider, wrapping links, visible keyboard focus.

## Typography and interaction
- Hero name: responsive 48–93px display type on desktop; sized separately for mobile.
- Body: approximately 15–16px with 1.8–1.85 line height; paragraph width capped.
- Metadata: small uppercase labels with restrained tracking.
- Buttons: rectangular, at least 48px tall. Green hover for the primary action.
- All page content is visible without JavaScript. Scroll reveals opt into a pending state only after the observer is installed. A zero intersection threshold prevents long project articles from staying hidden on short viewports.
- Reduced-motion preference disables transitions and reveals hidden pending content.
- Use semantic landmarks, descriptive alt text, current-page attributes, and a skip link.

## Content scope
This pass changes presentation, not biographical claims or project narratives. Existing placeholder project copy and contact destinations require a separate content pass. Keep generated writing specific, factual, and free of em dashes.

`styles.css` is the canonical implementation. Keep this document aligned when the design changes.
