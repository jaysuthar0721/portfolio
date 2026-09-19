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

## Aerospace motion
Decorative SVG orbital paths sit behind all pages at low opacity. Two markers travel slowly around the paths; mobile displays one. A small trajectory below the homepage actions has a moving vehicle marker. Buttons and navigation use brief directional hover/focus cues. These visuals are decorative, not flight-data visualizations.

Motion uses CSS animations with no third-party libraries or continuous JavaScript rendering. The footer pause button persists the choice across pages when storage is available. System reduced-motion always takes precedence; background-tab animations pause. SVGs are hidden from assistive technology and cannot intercept clicks. All content remains available without JavaScript.


## Leadership case study
The site includes a dedicated Ram Rocketry leadership page. It uses the same editorial system as the rest of the portfolio, but treats leadership as an engineering case study rather than a résumé list. The page separates organization building from IREC program leadership, distinguishes the formal Project Coordinator title from the broader Chief Engineer role, and uses current subscale metrics to show the technical scope being coordinated.

Ram Rocketry imagery comes from the team's Drive photo library. Use a small number of contextual images with descriptive captions rather than a large gallery. Leadership lessons are written as process changes with concrete operating rules, including earlier task assignment, explicit decision ownership, shared success metrics, and documentation/test planning.


## Manufacturing project tab
Projects now has an internal two-tab navigation: Project case studies and Manufacturing. Manufacturing lives at `manufacturing.html` so it can carry a longer process-focused narrative without crowding the main case-study page.

The manufacturing page follows the existing editorial layout and uses real MECH 200A source material: the Fall 2024 milling process summary, the production-traveler midterm exercise, Haas CNC mill operator training, and class-era machining photos. Keep claims scoped to coursework or simulated manufacturing scenarios when appropriate. The legacy Wix portfolio remains linked as an external reference rather than embedded.
