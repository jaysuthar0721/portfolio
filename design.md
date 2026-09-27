# Jay Suthar portfolio design

## Product purpose

This portfolio is a technical record for aerospace and mechanical engineering recruiting. The primary job of each page is to make the engineering contribution, evidence, and scope easy to scan before a visitor chooses to read deeply.

## Visual direction

Engineering notebook meets aerospace flight documentation.

- Unbounded remains the display typeface.
- Geist remains the body and interface typeface.
- CSU green is the identity color.
- Cyan is reserved for technical data, secondary labels, and engineering navigation cues.
- Orange is reserved for active status and interaction emphasis.
- The previous rotating rainbow accent system is no longer the design direction.
- Real project imagery, schematics, tables, and test evidence should provide most visual variation.

## Motion

The scroll-driven climb-to-orbit layer is the signature motion system.

- Atmospheric flow transitions into an orbital diagram as scroll progress increases.
- Motion is driven by scroll and uses transform or opacity where practical.
- Reduced-motion preferences are respected.
- The mobile header does not reserve space for the altitude readout.
- Legacy ambient orbit rotors, project scan lines, telemetry pulses, and card-tilt motion are not part of the active visual language.
- Hover and focus feedback should stay short and interruptible.

## Information architecture

### Home

The first viewport identifies Jay as a mechanical engineering student working in aerospace systems, flight controls, propulsion, and experimental engineering.

A short proof strip immediately establishes three areas:
- Flight systems
- Research
- Program work

The homepage then points to three representative bodies of work:
- Active Fin Stabilization Rocket
- IREC / Ram Rocketry systems leadership
- IFE nanowire research

### Projects

Projects are divided into:
1. Flagship case studies
2. Additional engineering work

Every project card links to a standalone HTML page. Project content must not depend on JavaScript to be readable or shareable.

Flagship projects receive the strongest visual and narrative emphasis. Coursework and manufacturing projects remain available, but they do not compete equally with the primary aerospace case studies.

Each project card should provide:
- Project title
- One-sentence technical scope
- Date and context
- One consistent open action

### About and research

Research should be explained as an engineering workflow, not only as long-form prose. When source imagery exists, connect visuals to fabrication, characterization, hardware integration, and diagnostics.

Do not publish placeholder language such as "coming soon."

### Leadership

Leadership is treated as an engineering case study rather than a resume list. Membership counts, role titles, and current/former status must remain consistent across the page.

## Interaction and accessibility

- Keep the skip link and semantic landmarks.
- Keep visible keyboard focus.
- Maintain minimum 44px interactive targets.
- All essential content must remain available without JavaScript.
- Use descriptive alt text for meaningful images.
- Respect prefers-reduced-motion.
- The narrow-screen header keeps all four destinations visible and preserves a 44px theme control.
- Do not communicate state by color alone.

## Theme behavior

Light and AMOLED themes are both supported.

If the visitor has not explicitly chosen a theme, follow the system color-scheme preference. A manual choice persists locally.

## Content discipline

Use concrete engineering language.

Prefer:
- requirement
- interface
- test
- measurement
- design decision
- failure
- result
- tradeoff

Avoid generic UI narration, decorative technical jargon, and unfinished-site copy.

The site is plain HTML, CSS, and JavaScript with no build step. `styles.css` is the canonical visual implementation, `climb.css` owns the climb layer, and this document should be updated whenever the design direction changes.
