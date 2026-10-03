// Models and layouts for each product. Each entry appears on the product page as a card with its
// drawing, and in the quote builder's "Model / layout" list. The drawing comes from `layout`.
//
// HOW TO MANAGE MODELS
// - Add a model: copy an entry in the right product list, give it a new unique `code`, and edit it.
// - Remove a model: delete its entry. Old quote links with that code fall back to "Standard".
// - Reorder: the order here is the order on the website. Put the most asked-for first.
// - `popular: true` adds a "Popular" tag. Keep it to one or two per product.
// - `{ group: 'Heading' }` starts a group of models under that heading on the product page.
// - `size` is a typical width × height in mm. It is only a starting point in the quote builder.
// - Names are generic UK trade descriptions. Do not use a manufacturer's model name unless you
//   sell that exact product.
//
// LAYOUT LEGEND (drawings are viewed from outside, like a window schedule)
// Casement, flush casement, tilt & turn:
//   columns are separated by |, panes stacked in a column by /
//   F fixed · L side-hung, hinges on the left · R side-hung, hinges on the right · T top-hung
//   B bottom-hung (tilt only) · TL / TR tilt & turn, hinges left / right
//   "2:F" makes a column twice as wide; "T*1/F*2" makes the top pane half the height of the one below
// Sash: "6/6" = six panes in the top sash over six in the bottom (1, 2, 3, 4, 6, 8, 9 or 12)
// Bay and bow: "3@45", "3@30", "3@90" (box bay), "4@bow", "5@bow"
// Sliding window and patio door: panels left to right, S sliding · F fixed, e.g. "F|S|S|F"
// Shaped: arch · segment · gable · rake · triangle · circle · octagon
// uPVC and composite doors (see the list at the top of doorLeaf in src/assets/js/draw.js):
//   half-glazed family: half · dual, with a base of -2p (two panels), -mp (moulded) or -groove, e.g. "dual-2p";
//   half-georgian · glazed · glazed-georgian · full · full-mid · flat · flat-mid · groove · cottage · cottage-half ·
//   long · long-o · panel2 · panel4 · panel6 · sq1 · sq2 · sq4p · sq4x2 · sq2arch · angle2 · arch · arch2 · arch4 ·
//   sunburst2 · sunburst4 · grill · p3sq · edw2 · geo5 · vic · oval · slot · midsq · midsq-o · twin · sq1s ·
//   squares3 · sq3o · mid3 · sq4c · sq4o · curve5 · diamond1 · diamond3 · circle · stripes · solid
//   add a door set with "+side1" (one side panel), "+side2" (two) or "+top" (top light), e.g. "slot+side1+top"
// Stable doors: half · half-2p · half-mp · half-groove · half-georgian · solid · cottage
// Glass designs (Georgian bars, diamond lead, square lead) are chosen in the quote builder, not here.
// French doors: pair · pair+1 (one side panel) · pair+2 (two side panels) · pair+top · pair+2+top · georgian
// Bi-fold: panels folding left-right, e.g. "3-0" (three to the left) or "2-2"

export const models = {
  'casement-windows': [
    { group: 'Single-pane windows' },
    { code: 'CW-01', name: 'Single side-hung', layout: 'L', size: [600, 1050], desc: 'One opening sash, hinged at the side.', bestFor: 'Landings, cloakrooms and narrow openings' },
    { code: 'CW-02', name: 'Single top-hung', layout: 'T', size: [600, 900], desc: 'One sash hinged at the top, so it can stay open in light rain.', bestFor: 'Bathrooms and kitchens' },
    { code: 'CW-03', name: 'Single fixed light', layout: 'F', size: [600, 900], desc: 'A non-opening window for light only.', bestFor: 'Stairwells and high-level glazing' },
    { code: 'CW-14', name: 'Fixed with a fixed top light', layout: 'F*1/F*3', size: [600, 1200], desc: 'A fixed light divided by a transom, with a smaller fixed light above.', bestFor: 'Halls and stairwells' },
    { code: 'CW-15', name: 'Top-hung fanlight over fixed', layout: 'T*1/F*3', size: [600, 1200], desc: 'A small top-hung vent above a fixed light.', bestFor: 'Bathrooms and small rooms' },
    { code: 'CW-16', name: 'Side-hung under a fixed top light', layout: 'F*1/L*3', size: [600, 1200], desc: 'A side-hung opener below a fixed top light.', bestFor: 'Bedrooms in 1930s houses' },
    { code: 'CW-17', name: 'Side-hung under a top-hung fanlight', layout: 'T*1/L*3', size: [600, 1200], desc: 'A side-hung opener with a top-hung vent above it.', bestFor: 'Rooms that need a vent and a wide opener' },
    { code: 'CW-18', name: 'Top-hung under a fixed top light', layout: 'F*1/T*3', size: [600, 1200], desc: 'A large top-hung opener below a fixed top light.', bestFor: 'Kitchens and bathrooms' },
    { code: 'CW-19', name: 'Three-tier: fixed, top-hung, fixed', layout: 'F*1/T*1/F*1', size: [600, 1600], desc: 'A tall window with a top-hung opener between two fixed lights.', bestFor: 'Stairwells and tall narrow openings' },
    { group: 'Two-pane windows' },
    { code: 'CW-04', name: 'Two-pane: side-hung and fixed', layout: 'L|F', size: [1200, 1050], desc: 'A side-hung opener beside a fixed light.', bestFor: 'Bedrooms, including escape windows', popular: true },
    { code: 'CW-05', name: 'Two-pane: side-hung and top-hung over fixed', layout: 'L|T*1/F*2', size: [1200, 1200], desc: 'A side-hung opener beside a fixed light with a top-hung vent above it.', bestFor: 'Most rooms. The classic UK layout', popular: true },
    { code: 'CW-20', name: 'Two-pane: top-hung and fixed', layout: 'T|F', size: [1200, 1050], desc: 'A full-height top-hung opener beside a fixed light.', bestFor: 'Kitchens and rooms over a path' },
    { code: 'CW-21', name: 'Two-pane: fanlight over fixed, and fixed', layout: 'T*1/F*3|F', size: [1200, 1200], desc: 'A top-hung vent over a fixed light, beside a full-height fixed light.', bestFor: 'Living rooms that need ventilation only' },
    { code: 'CW-22', name: 'Two-pane: side-hung under fanlight, and fixed', layout: 'T*1/L*3|F', size: [1200, 1200], desc: 'A side-hung opener with a top-hung vent above, beside a fixed light.', bestFor: 'Bedrooms that need a vent and an escape opener' },
    { code: 'CW-23', name: 'Two-pane with top lights: side-hung and fixed', layout: 'F*1/L*3|F*1/F*3', size: [1200, 1300], desc: 'Fixed top lights across the window, a side-hung opener and a fixed light below.', bestFor: '1930s and transomed windows' },
    { code: 'CW-12', name: 'Two-pane: pair of side-hung sashes', layout: 'L|R', size: [1200, 1050], desc: 'Two openers hinged at the outer edges, sometimes called a French casement.', bestFor: 'Bedrooms needing a wide clear opening' },
    { code: 'CW-24', name: 'Two-pane: pair of side-hung under fanlights', layout: 'T*1/L*3|T*1/R*3', size: [1200, 1200], desc: 'Two side-hung openers, each with a top-hung vent above.', bestFor: 'Large bedrooms and lounges' },
    { code: 'CW-06', name: 'Two-pane: top-hung vents over fixed', layout: 'T*1/F*2|T*1/F*2', size: [1200, 1200], desc: 'Two fixed lights, each with a top-hung vent above.', bestFor: 'Kitchens and rooms you ventilate often' },
    { code: 'CW-07', name: 'Pair of top-hung vents', layout: 'T|T', size: [1000, 600], desc: 'Two short top-hung sashes side by side.', bestFor: 'Over a kitchen sink or worktop' },
    { code: 'CW-25', name: 'Two fixed lights', layout: 'F|F', size: [1200, 1050], desc: 'Two fixed lights with a mullion between.', bestFor: 'Where another window gives ventilation' },
    { group: 'Three-pane windows' },
    { code: 'CW-08', name: 'Three-pane: openers at both ends', layout: 'L|F|R', size: [1800, 1200], desc: 'A wide fixed centre light with a side-hung opener at each end.', bestFor: 'Living rooms and front bedrooms' },
    { code: 'CW-09', name: 'Three-pane: side-hung, fixed and top-hung', layout: 'L|F|T*1/F*2', size: [1800, 1200], desc: 'A side-hung opener, a fixed centre and a top-hung vent over a fixed light.', bestFor: 'Living rooms that need an escape opener' },
    { code: 'CW-26', name: 'Three-pane: side-hung centre', layout: 'F|L|F', size: [1800, 1200], desc: 'A side-hung opener between two fixed lights.', bestFor: 'Bedrooms with furniture at the sides' },
    { code: 'CW-27', name: 'Three-pane: vent in the centre', layout: 'F|T*1/F*3|F', size: [1800, 1200], desc: 'A top-hung vent over the centre light, with fixed lights either side.', bestFor: 'Living rooms and dining rooms' },
    { code: 'CW-28', name: 'Three-pane: side-hung ends under fanlights', layout: 'T*1/L*3|F|T*1/R*3', size: [1800, 1200], desc: 'Side-hung openers at each end with top-hung vents above, and a fixed centre.', bestFor: 'Large living rooms' },
    { code: 'CW-29', name: 'Three-pane: side-hung ends, vent in the centre', layout: 'L|T*1/F*3|R', size: [1800, 1200], desc: 'Side-hung openers at each end and a top-hung vent over the fixed centre.', bestFor: 'Wide rooms that need plenty of air' },
    { code: 'CW-30', name: 'Three-pane: vents at both ends', layout: 'T*1/F*3|F|T*1/F*3', size: [1800, 1200], desc: 'Top-hung vents over the two end lights, with a fixed centre.', bestFor: 'Kitchens and dining rooms' },
    { code: 'CW-13', name: 'Three-pane: top-hung vents over fixed', layout: 'T*1/F*2|T*1/F*2|T*1/F*2', size: [1800, 1200], desc: 'Three fixed lights, each with a top-hung vent above.', bestFor: 'Kitchens and rooms over a path' },
    { code: 'CW-31', name: 'Three-pane: one side-hung end', layout: 'L|F|F', size: [1800, 1200], desc: 'A side-hung opener at one end and two fixed lights.', bestFor: 'Rooms with one usable side' },
    { code: 'CW-10', name: 'Three-pane with fixed top lights', layout: 'F*1/L*3|F*1/F*3|F*1/R*3', size: [1800, 1350], desc: 'Fixed top lights across the window, with side-hung openers below at each end.', bestFor: '1930s houses and tall openings' },
    { code: 'CW-32', name: 'Three fixed lights', layout: 'F|F|F', size: [1800, 1200], desc: 'Three fixed lights with mullions between.', bestFor: 'Picture windows and stairwells' },
    { group: 'Four-pane windows' },
    { code: 'CW-11', name: 'Four-pane: openers at both ends', layout: 'L|F|F|R', size: [2400, 1200], desc: 'Two fixed centre lights with a side-hung opener at each end.', bestFor: 'Wide living-room openings' },
    { code: 'CW-33', name: 'Four-pane with top lights, openers at both ends', layout: 'F*1/L*3|F*1/F*3|F*1/F*3|F*1/R*3', size: [2400, 1350], desc: 'Fixed top lights across the window, with side-hung openers below at each end.', bestFor: 'Wide transomed windows' },
    { code: 'CW-34', name: 'Four-pane: vents at both ends', layout: 'T*1/F*3|F|F|T*1/F*3', size: [2400, 1200], desc: 'Top-hung vents over the two end lights, with two fixed centre lights.', bestFor: 'Wide kitchens and lounges' },
  ],

  'flush-casement-windows': [
    { code: 'FC-01', name: 'Single flush side-hung', layout: 'L', size: [550, 1000], desc: 'One flush sash, hinged at the side.', bestFor: 'Cottages and narrow openings' },
    { code: 'FC-02', name: 'Two-pane: flush side-hung and fixed', layout: 'L|F', size: [1100, 1050], desc: 'A flush opener beside a fixed light.', bestFor: 'Bedrooms and kitchens', popular: true },
    { code: 'FC-03', name: 'Two-pane: pair of flush side-hung sashes', layout: 'L|R', size: [1100, 1050], desc: 'Two flush openers hinged at the outer edges, like traditional timber casements.', bestFor: 'Period and character homes' },
    { code: 'FC-04', name: 'Two-pane: flush top-hung over fixed', layout: 'T*1/F*2|T*1/F*2', size: [1100, 1200], desc: 'Two fixed lights, each with a flush top-hung vent above.', bestFor: 'Kitchens and bathrooms' },
    { code: 'FC-05', name: 'Three-pane: flush openers at both ends', layout: 'L|F|R', size: [1700, 1200], desc: 'A fixed centre with a flush side-hung opener at each end.', bestFor: 'Living rooms', popular: true },
    { code: 'FC-06', name: 'Three-pane: side-hung, fixed and top-hung', layout: 'L|F|T*1/F*2', size: [1700, 1200], desc: 'Flush side-hung opener, fixed centre, and a top-hung vent over a fixed light.', bestFor: 'Rooms that need an escape opener and a vent' },
  ],

  'tilt-and-turn-windows': [
    { code: 'TT-01', name: 'Single tilt & turn', layout: 'TL', size: [700, 1200], desc: 'One sash that tilts in at the top to ventilate and swings in fully to clean or escape.', bestFor: 'Flats, upper floors and hard-to-reach windows', popular: true },
    { code: 'TT-02', name: 'Tilt & turn beside a fixed light', layout: 'TL|F', size: [1400, 1200], desc: 'A tilt & turn sash next to a fixed pane.', bestFor: 'Bedrooms and living rooms' },
    { code: 'TT-03', name: 'Pair of tilt & turn sashes', layout: 'TL|TR', size: [1400, 1300], desc: 'Two tilt & turn sashes, hinged at the outer edges.', bestFor: 'Wide openings that need a large clear opening' },
    { code: 'TT-06', name: 'Three-pane: tilt & turn in the centre', layout: 'F|TL|F', size: [2100, 1200], desc: 'A tilt & turn sash between two fixed lights.', bestFor: 'Living rooms and wide openings' },
    { code: 'TT-07', name: 'Three-pane: tilt & turn at both ends', layout: 'TL|F|TR', size: [2100, 1200], desc: 'Tilt & turn sashes at each end with a fixed centre.', bestFor: 'Large rooms that need plenty of air' },
    { code: 'TT-08', name: 'Four-pane: tilt & turn at both ends', layout: 'TL|F|F|TR', size: [2800, 1200], desc: 'Tilt & turn sashes at each end with two fixed centre lights.', bestFor: 'Very wide openings' },
    { code: 'TT-04', name: 'Tilt & turn under a fixed top light', layout: 'F*1/TL*3', size: [800, 1600], desc: 'A tall tilt & turn sash with a fixed light above.', bestFor: 'Tall openings and stairwells' },
    { code: 'TT-05', name: 'Tilt-only vent', layout: 'B', size: [900, 500], desc: 'A sash that only tilts inwards from the bottom.', bestFor: 'High-level and basement windows' },
  ],

  'sash-windows': [
    { code: 'SW-01', name: 'One over one', layout: '1/1', size: [900, 1500], desc: 'Plain top and bottom sashes with no bars.', bestFor: 'Late Victorian homes and clear views' },
    { code: 'SW-02', name: 'Two over two', layout: '2/2', size: [900, 1500], desc: 'Each sash split by one vertical bar.', bestFor: 'Victorian terraces', popular: true },
    { code: 'SW-03', name: 'Four over four', layout: '4/4', size: [900, 1500], desc: 'Each sash split into four panes.', bestFor: 'Victorian and Edwardian homes' },
    { code: 'SW-04', name: 'Six over six', layout: '6/6', size: [900, 1500], desc: 'The classic Georgian pattern: six panes in each sash.', bestFor: 'Georgian and Georgian-style homes', popular: true },
    { code: 'SW-05', name: 'Six over one', layout: '6/1', size: [900, 1500], desc: 'Six panes in the top sash over a plain bottom sash.', bestFor: 'Edwardian homes' },
    { code: 'SW-06', name: 'Eight over eight', layout: '8/8', size: [1200, 1600], desc: 'Eight panes in each sash, for wider openings.', bestFor: 'Large Georgian-style windows' },
  ],

  'bay-and-bow-windows': [
    { code: 'BB-01', name: '45° three-facet bay', layout: '3@45', size: [2400, 1300], desc: 'A wide front facet with angled sides set at 45°.', bestFor: 'Most Victorian and 1930s bays', popular: true },
    { code: 'BB-02', name: '30° three-facet bay', layout: '3@30', size: [2400, 1300], desc: 'A shallower bay with sides set at 30°.', bestFor: 'Shallow bays and later homes' },
    { code: 'BB-03', name: 'Box bay (90°)', layout: '3@90', size: [2200, 1300], desc: 'A square bay with sides at right angles to the front.', bestFor: 'Edwardian and Arts and Crafts homes' },
    { code: 'BB-04', name: 'Four-facet bow', layout: '4@bow', size: [2700, 1300], desc: 'A gentle curve made of four facets.', bestFor: 'Rounded bays' },
    { code: 'BB-05', name: 'Five-facet bow', layout: '5@bow', size: [3000, 1300], desc: 'A smoother curve made of five facets.', bestFor: 'Wide rounded bays' },
  ],

  'sliding-windows': [
    { code: 'SL-01', name: 'Two-pane slider', layout: 'S|F', size: [1500, 1000], desc: 'One pane slides across behind a fixed pane.', bestFor: 'Over walkways and where an opener can’t swing out', popular: true },
    { code: 'SL-02', name: 'Yorkshire light', layout: 'F|S', size: [1200, 900], desc: 'A traditional horizontal sliding sash in a small cottage-style frame.', bestFor: 'Cottages and period terraces in the North' },
    { code: 'SL-03', name: 'Three-pane slider', layout: 'S|F|S', size: [2400, 1100], desc: 'A fixed centre with a sliding pane at each end.', bestFor: 'Wide openings' },
    { code: 'SL-04', name: 'Two-pane, both sliding', layout: 'S|S', size: [1800, 1100], desc: 'Both panes slide, so either side can open.', bestFor: 'Conservatories and garden rooms' },
  ],

  'shaped-and-feature-windows': [
    { code: 'SH-01', name: 'Arched head', layout: 'arch', size: [1000, 1400], desc: 'A rectangle with a full round arch on top.', bestFor: 'Stairwells and feature openings', popular: true },
    { code: 'SH-02', name: 'Segmental arch', layout: 'segment', size: [1200, 1300], desc: 'A rectangle with a shallow curved head.', bestFor: 'Victorian brick arches' },
    { code: 'SH-03', name: 'Gable (apex)', layout: 'gable', size: [1600, 1800], desc: 'A pointed top that follows a roof pitch.', bestFor: 'Gable ends and extensions' },
    { code: 'SH-04', name: 'Raked head', layout: 'rake', size: [1500, 1500], desc: 'A sloping top on one side.', bestFor: 'Under a mono-pitch roof or stairs' },
    { code: 'SH-05', name: 'Triangle', layout: 'triangle', size: [1500, 900], desc: 'A triangular fixed window.', bestFor: 'Above doors and in gables' },
    { code: 'SH-06', name: 'Circular', layout: 'circle', size: [700, 700], desc: 'A round window, fixed or with a pivot opener.', bestFor: 'Feature walls and landings' },
    { code: 'SH-07', name: 'Octagonal', layout: 'octagon', size: [600, 600], desc: 'An eight-sided feature window.', bestFor: 'Feature walls and stairwells' },
  ],

  'upvc-doors': [
    { group: 'Half-glazed, glazed and back doors' },
    { code: 'UD-01', name: 'Half-glazed, flat panel', layout: 'half', size: [920, 2090], desc: 'Glass in the top half and a flat panel below.', bestFor: 'Back and side doors', popular: true },
    { code: 'UD-15', name: 'Half-glazed, two-panel base', layout: 'half-2p', size: [920, 2090], desc: 'Glass in the top half and two raised panels below.', bestFor: 'Front and back doors' },
    { code: 'UD-16', name: 'Dual-glazed, two-panel base', layout: 'dual-2p', size: [920, 2090], desc: 'Two glass panels side by side in the top half, with two raised panels below.', bestFor: 'Front and back doors' },
    { code: 'UD-17', name: 'Half-glazed, moulded panel', layout: 'half-mp', size: [920, 2090], desc: 'Glass in the top half and a square moulded panel below.', bestFor: 'Traditional back doors' },
    { code: 'UD-18', name: 'Dual-glazed, moulded panel', layout: 'dual-mp', size: [920, 2090], desc: 'Two glass panels in the top half and a square moulded panel below.', bestFor: 'Traditional back doors' },
    { code: 'UD-19', name: 'Half-glazed, grooved base', layout: 'half-groove', size: [920, 2090], desc: 'Glass in the top half and tongue-and-groove style boarding below.', bestFor: 'Cottages and back doors' },
    { code: 'UD-20', name: 'Dual-glazed, grooved base', layout: 'dual-groove', size: [920, 2090], desc: 'Two glass panels in the top half and boarding below.', bestFor: 'Cottages and back doors' },
    { code: 'UD-02', name: 'Half-glazed with Georgian bars', layout: 'half-georgian', size: [920, 2090], desc: 'Half glazed, with bars dividing the glass.', bestFor: 'Matching Georgian-bar windows' },
    { code: 'UD-03', name: 'Mostly glazed', layout: 'glazed', size: [920, 2090], desc: 'Mostly glass, with a short panel at the bottom.', bestFor: 'Garden and utility doors' },
    { code: 'UD-04', name: 'Mostly glazed with Georgian bars', layout: 'glazed-georgian', size: [920, 2090], desc: 'Mostly glass, divided by bars.', bestFor: 'Garden doors on period-style homes' },
    { code: 'UD-23', name: 'Full glass', layout: 'full', size: [920, 2090], desc: 'Glazed from top to bottom.', bestFor: 'Garden doors and conservatories' },
    { code: 'UD-24', name: 'Full glass with mid rail', layout: 'full-mid', size: [920, 2090], desc: 'Two glass panels divided by a mid rail.', bestFor: 'Garden doors' },
    { code: 'UD-21', name: 'Flat panel, solid', layout: 'flat', size: [920, 2090], desc: 'A plain flat panel with no glass.', bestFor: 'Garages, stores and utility rooms' },
    { code: 'UD-22', name: 'Flat panel with mid rail', layout: 'flat-mid', size: [920, 2090], desc: 'Two flat panels divided by a mid rail.', bestFor: 'Side and utility doors' },
    { code: 'UD-25', name: 'Grooved full panel', layout: 'groove', size: [920, 2090], desc: 'Solid tongue-and-groove style boarding, no glass.', bestFor: 'Cottages, garages and stores' },
    { code: 'UD-08', name: 'Cottage door', layout: 'cottage', size: [920, 2090], desc: 'A small glazed top with vertical boarding below.', bestFor: 'Cottages and rural homes' },
    { group: 'Panel front doors' },
    { code: 'UD-05', name: 'Solid four-panel', layout: 'panel4', size: [920, 2090], desc: 'No glass, with four raised panels.', bestFor: 'Front doors that need privacy' },
    { code: 'UD-06', name: 'Solid two-panel', layout: 'panel2', size: [920, 2090], desc: 'No glass, with two tall panels.', bestFor: 'Side and utility doors' },
    { code: 'UD-09', name: '2 panel, 2 square', layout: 'sq2', size: [920, 2090], desc: 'Two tall glass panels in the top half, with two raised panels below.', bestFor: 'Front doors on 1930s and modern homes' },
    { code: 'UD-10', name: '2 panel, 2 arch', layout: 'arch2', size: [920, 2090], desc: 'Two arched glass panels in the top half, with two raised panels below.', bestFor: 'Victorian and traditional homes' },
    { code: 'UD-26', name: '4 panel, 2 square', layout: 'sq4p', size: [920, 2090], desc: 'Two small square lights at the top, with four raised panels.', bestFor: 'Traditional front doors' },
    { code: 'UD-27', name: 'Edwardian two-light', layout: 'edw2', size: [920, 2090], desc: 'Two small glazed lights at the top of a six-panel door.', bestFor: 'Edwardian and 1930s homes' },
    { code: 'UD-28', name: 'Edwardian four-light', layout: 'sq4x2', size: [920, 2090], desc: 'Two small lights over two tall glass panels, with two panels below.', bestFor: 'Edwardian homes' },
    { code: 'UD-11', name: 'Georgian fanlight, four panel', layout: 'sunburst4', size: [920, 2090], desc: 'A half-moon fanlight at the top of a four-panel door.', bestFor: 'Georgian-style front doors' },
    { code: 'UD-29', name: 'Georgian three-light', layout: 'sq2arch', size: [920, 2090], desc: 'A half-moon fanlight over two tall glass panels, with two panels below.', bestFor: 'Georgian-style front doors' },
    { code: 'UD-30', name: 'Georgian five-light', layout: 'geo5', size: [920, 2090], desc: 'A half-moon fanlight over four glass panels.', bestFor: 'Bright hallways' },
    { code: 'UD-31', name: 'Victorian arched', layout: 'vic', size: [920, 2090], desc: 'A tall arched glass panel over a moulded panel.', bestFor: 'Victorian and Edwardian homes' },
    { code: 'UD-32', name: 'Oval glass', layout: 'oval', size: [920, 2090], desc: 'An oval glass panel over two raised panels.', bestFor: 'Feature front doors' },
    { code: 'UD-07', name: 'Three square lights', layout: 'squares3', size: [920, 2090], desc: 'Three small square glass panels in a line, with a panel below.', bestFor: 'Front doors on modern homes' },
    { group: 'Door sets with side panels or a top light' },
    { code: 'UD-12', name: 'Door with one side panel', layout: 'half+side1', size: [1300, 2090], desc: 'A half-glazed door with a glazed side panel on the handle side.', bestFor: 'Dark hallways that need more light' },
    { code: 'UD-13', name: 'Door with two side panels', layout: 'half+side2', size: [1700, 2090], desc: 'A half-glazed door with a glazed side panel either side.', bestFor: 'Wide entrances and porches' },
    { code: 'UD-14', name: 'Door with top light', layout: 'half+top', size: [920, 2400], desc: 'A half-glazed door under a fixed glazed top light.', bestFor: 'Tall openings and older houses' },
  ],

  'composite-doors': [
    { group: 'Traditional panel designs' },
    { code: 'CD-03', name: '2 panel, 1 arch', layout: 'arch', size: [920, 2090], desc: 'An arched glass panel above two raised panels.', bestFor: 'Victorian and Edwardian homes', popular: true },
    { code: 'CD-18', name: '2 panel, 1 square', layout: 'sq1', size: [920, 2090], desc: 'One large glass panel above two raised panels.', bestFor: 'Most front doors' },
    { code: 'CD-09', name: '2 panel, 2 square', layout: 'sq2', size: [920, 2090], desc: 'Two tall glass panels in the top half, with two raised panels below.', bestFor: '1930s and modern homes' },
    { code: 'CD-10', name: '2 panel, 2 arch', layout: 'arch2', size: [920, 2090], desc: 'Two arched glass panels in the top half, with two raised panels below.', bestFor: 'Victorian and Edwardian homes' },
    { code: 'CD-17', name: '2 panel, 2 angle', layout: 'angle2', size: [920, 2090], desc: 'Two glass panels with angled tops, with two raised panels below.', bestFor: 'Art Deco and 1930s homes' },
    { code: 'CD-19', name: '2 panel, 2 square, 1 arch', layout: 'sq2arch', size: [920, 2090], desc: 'A half-moon fanlight over two tall glass panels, with two panels below.', bestFor: 'Georgian-style homes' },
    { code: 'CD-25', name: '2 panel, 4 square', layout: 'sq4x2', size: [920, 2090], desc: 'Two small lights over two tall glass panels, with two panels below.', bestFor: 'Edwardian homes' },
    { code: 'CD-23', name: '2 panel, 1 grill', layout: 'grill', size: [920, 2090], desc: 'A large glass panel divided by bars, above two raised panels.', bestFor: 'Georgian-style homes' },
    { code: 'CD-24', name: '2 panel sunburst', layout: 'sunburst2', size: [920, 2090], desc: 'An arch-topped glass panel with bars, above two raised panels.', bestFor: 'Period homes' },
    { code: 'CD-11', name: '4 panel, 1 arch', layout: 'arch4', size: [920, 2090], desc: 'A small arched light at the top of a four-panel door.', bestFor: 'Traditional front doors' },
    { code: 'CD-22', name: '4 panel sunburst', layout: 'sunburst4', size: [920, 2090], desc: 'A half-moon sunburst fanlight at the top of a four-panel door.', bestFor: 'Georgian-style front doors' },
    { code: 'CD-21', name: '4 panel, 2 square', layout: 'sq4p', size: [920, 2090], desc: 'Two small square lights at the top, with four raised panels.', bestFor: 'Traditional front doors' },
    { code: 'CD-07', name: '4 panel', layout: 'panel4', size: [920, 2090], desc: 'No glass, with four raised panels like painted timber.', bestFor: 'Period homes that want privacy' },
    { code: 'CD-20', name: '6 panel', layout: 'panel6', size: [920, 2090], desc: 'Six raised panels, no glass.', bestFor: 'Georgian and traditional homes' },
    { code: 'CD-26', name: '3 panel, 1 square', layout: 'p3sq', size: [920, 2090], desc: 'A glass light across the top with boarding below.', bestFor: 'Cottages and farmhouses' },
    { group: 'Modern and contemporary designs' },
    { code: 'CD-01', name: 'Long offset glazing', layout: 'slot', size: [920, 2090], desc: 'A tall, narrow strip of glass towards the handle side.', bestFor: 'Modern front doors', popular: true },
    { code: 'CD-39', name: 'Mid square', layout: 'midsq', size: [920, 2090], desc: 'A tall glass panel in the centre of the door.', bestFor: 'Modern front doors' },
    { code: 'CD-40', name: 'Mid square offset', layout: 'midsq-o', size: [920, 2090], desc: 'A tall glass panel towards the handle side.', bestFor: 'Modern front doors' },
    { code: 'CD-37', name: 'Twin square', layout: 'twin', size: [920, 2090], desc: 'Two tall glass panels, one above the other, in the centre.', bestFor: 'Contemporary homes' },
    { code: 'CD-28', name: '1 square', layout: 'sq1s', size: [920, 2090], desc: 'One glass panel in the upper part of a plain door.', bestFor: 'Modern and new-build homes' },
    { code: 'CD-04', name: '3 square centre', layout: 'sq3c', size: [920, 2090], desc: 'Three small square lights in a line down the centre.', bestFor: '1930s and modern homes' },
    { code: 'CD-36', name: '3 square offset', layout: 'sq3o', size: [920, 2090], desc: 'Three small square lights towards the handle side.', bestFor: 'Modern homes' },
    { code: 'CD-35', name: 'Mid 3 square', layout: 'mid3', size: [920, 2090], desc: 'Three small square lights at mid height.', bestFor: 'Modern homes' },
    { code: 'CD-31', name: '4 square centre', layout: 'sq4c', size: [920, 2090], desc: 'Four small square lights down the centre.', bestFor: 'Modern homes' },
    { code: 'CD-32', name: '4 square offset', layout: 'sq4o', size: [920, 2090], desc: 'Four small square lights towards the handle side.', bestFor: 'Modern homes' },
    { code: 'CD-38', name: '5 square curved', layout: 'curve5', size: [920, 2090], desc: 'Five small lights set along a curve.', bestFor: 'Contemporary homes' },
    { code: 'CD-27', name: '1 diamond', layout: 'diamond1', size: [920, 2090], desc: 'One diamond-shaped light in a plain door.', bestFor: 'Modern homes' },
    { code: 'CD-34', name: '3 diamond', layout: 'diamond3', size: [920, 2090], desc: 'Three diamond-shaped lights down the centre.', bestFor: 'Modern homes' },
    { code: 'CD-33', name: 'Circle', layout: 'circle', size: [920, 2090], desc: 'A round porthole light in the upper part of the door.', bestFor: 'Contemporary homes' },
    { code: 'CD-05', name: 'Contemporary stripes', layout: 'stripes', size: [920, 2090], desc: 'Horizontal glass slots across the door.', bestFor: 'New builds and modern refurbishments' },
    { code: 'CD-06', name: 'Solid contemporary', layout: 'solid', size: [920, 2090], desc: 'A flat, unglazed door with a long bar handle option.', bestFor: 'Minimal modern frontages' },
    { group: 'Cottage designs' },
    { code: 'CD-29', name: 'Cottage', layout: 'groove', size: [920, 2090], desc: 'A boarded door with no glass.', bestFor: 'Cottages and country homes' },
    { code: 'CD-30', name: 'Cottage half glazed', layout: 'cottage-half', size: [920, 2090], desc: 'A boarded door with a large glass panel in the top half.', bestFor: 'Cottages and back doors' },
    { code: 'CD-08', name: 'Cottage with top light', layout: 'cottage', size: [920, 2090], desc: 'A small glazed top with vertical boarding below.', bestFor: 'Cottages and country homes' },
    { code: 'CD-41', name: 'Cottage long centre', layout: 'long', size: [920, 2090], desc: 'A boarded door with a long glass strip in the centre.', bestFor: 'Cottages and modern rural homes' },
    { code: 'CD-42', name: 'Cottage long offset', layout: 'long-o', size: [920, 2090], desc: 'A boarded door with a long glass strip towards the handle side.', bestFor: 'Cottages and modern rural homes' },
    { group: 'Back doors' },
    { code: 'CD-02', name: 'Half-glazed', layout: 'half', size: [920, 2090], desc: 'Glass in the top half and a panel below.', bestFor: 'Front and back doors' },
    { code: 'CD-13', name: 'Half-glazed with Georgian bars', layout: 'half-georgian', size: [920, 2090], desc: 'Glass in the top half divided by bars, with a panel below.', bestFor: 'Back doors on period-style homes' },
    { code: 'CD-12', name: 'Fully glazed back door', layout: 'glazed', size: [920, 2090], desc: 'Mostly glass, with a short panel at the bottom.', bestFor: 'Kitchen and garden doors' },
    { group: 'Door sets with side panels or a top light' },
    { code: 'CD-14', name: 'Front door with one side panel', layout: 'slot+side1', size: [1350, 2090], desc: 'A composite door with a glazed side panel on the handle side.', bestFor: 'Hallways that need more light' },
    { code: 'CD-15', name: 'Front door with two side panels', layout: 'slot+side2', size: [1800, 2090], desc: 'A composite door with a glazed side panel either side.', bestFor: 'Wide entrances and porches' },
    { code: 'CD-16', name: 'Front door with top light', layout: 'arch+top', size: [920, 2400], desc: 'A composite door under a fixed glazed top light.', bestFor: 'Tall openings in older houses' },
  ],

  'french-doors': [
    { code: 'FD-01', name: 'Standard pair', layout: 'pair', size: [1200, 2100], desc: 'Two glazed doors that open from the centre.', bestFor: 'Most garden openings', popular: true },
    { code: 'FD-02', name: 'Pair with two side panels', layout: 'pair+2', size: [2400, 2100], desc: 'A pair of doors with a fixed glazed panel either side.', bestFor: 'Wider openings', popular: true },
    { code: 'FD-03', name: 'Pair with one side panel', layout: 'pair+1', size: [1800, 2100], desc: 'A pair of doors with a fixed glazed panel on one side.', bestFor: 'Openings next to a wall or kitchen run' },
    { code: 'FD-04', name: 'Pair with top light', layout: 'pair+top', size: [1500, 2350], desc: 'A pair of doors under a fixed glazed top light.', bestFor: 'Tall openings' },
    { code: 'FD-05', name: 'Pair with side panels and top light', layout: 'pair+2+top', size: [2600, 2400], desc: 'A pair of doors, fixed side panels and a top light across the frame.', bestFor: 'Large openings and extensions' },
    { code: 'FD-06', name: 'Georgian bar pair', layout: 'georgian', size: [1400, 2100], desc: 'A pair of doors with bars dividing the glass.', bestFor: 'Period homes' },
  ],

  'patio-doors': [
    { code: 'PD-01', name: 'Two-pane patio door', layout: 'S|F', size: [1800, 2100], desc: 'One panel slides across a fixed panel.', bestFor: 'Most patio openings', popular: true },
    { code: 'PD-02', name: 'Two-pane, both sliding', layout: 'S|S', size: [2400, 2100], desc: 'Both panels slide, so you can open either side.', bestFor: 'Openings used from both sides' },
    { code: 'PD-03', name: 'Three-pane patio door', layout: 'S|F|S', size: [3000, 2100], desc: 'A fixed centre panel with a sliding panel at each end.', bestFor: 'Wide openings' },
    { code: 'PD-04', name: 'Four-pane patio door', layout: 'F|S|S|F', size: [3600, 2100], desc: 'Two centre panels slide apart behind the fixed outer panels.', bestFor: 'Very wide openings and extensions' },
  ],

  'bifold-doors': [
    { code: 'BF-01', name: 'Two panels (2-0)', layout: '2-0', size: [1800, 2100], desc: 'Two panels that fold and stack to one side.', bestFor: 'Smaller openings' },
    { code: 'BF-02', name: 'Three panels (3-0)', layout: '3-0', size: [2400, 2100], desc: 'Three panels folding to one side, with a traffic door for everyday use.', bestFor: 'The most popular size for kitchens and extensions', popular: true },
    { code: 'BF-03', name: 'Three panels (2-1)', layout: '2-1', size: [2400, 2100], desc: 'Two panels fold one way and a single traffic door opens the other.', bestFor: 'Where the stack needs to sit to one side' },
    { code: 'BF-04', name: 'Four panels (4-0)', layout: '4-0', size: [3200, 2100], desc: 'Four panels folding to one side.', bestFor: 'Wider openings with one stack' },
    { code: 'BF-05', name: 'Four panels (3-1)', layout: '3-1', size: [3200, 2100], desc: 'Three panels fold one way and a traffic door opens the other.', bestFor: 'Wide openings used every day', popular: true },
    { code: 'BF-06', name: 'Four panels (2-2)', layout: '2-2', size: [3200, 2100], desc: 'Two panels fold each way from the centre.', bestFor: 'A central opening' },
    { code: 'BF-07', name: 'Five panels (5-0)', layout: '5-0', size: [4000, 2100], desc: 'Five panels folding to one side, with a traffic door.', bestFor: 'Large extensions' },
    { code: 'BF-08', name: 'Six panels (3-3)', layout: '3-3', size: [4800, 2100], desc: 'Three panels fold each way, with a traffic door on each side.', bestFor: 'Very wide openings' },
  ],

  'stable-doors': [
    { code: 'ST-01', name: 'Half-glazed top, flat bottom', layout: 'half', size: [920, 2090], desc: 'A glazed top leaf over a flat bottom leaf.', bestFor: 'Kitchens and back doors', popular: true },
    { code: 'ST-05', name: 'Half-glazed top, two-panel bottom', layout: 'half-2p', size: [920, 2090], desc: 'A glazed top leaf over a bottom leaf with two raised panels.', bestFor: 'Traditional homes' },
    { code: 'ST-06', name: 'Half-glazed top, moulded bottom', layout: 'half-mp', size: [920, 2090], desc: 'A glazed top leaf over a bottom leaf with a square moulded panel.', bestFor: 'Traditional homes' },
    { code: 'ST-07', name: 'Half-glazed top, grooved bottom', layout: 'half-groove', size: [920, 2090], desc: 'A glazed top leaf over a boarded bottom leaf.', bestFor: 'Cottages and farmhouses' },
    { code: 'ST-02', name: 'Georgian bar top', layout: 'half-georgian', size: [920, 2090], desc: 'A glazed top leaf with bars, over a solid bottom leaf.', bestFor: 'Period and cottage homes' },
    { code: 'ST-03', name: 'Solid top and bottom', layout: 'solid', size: [920, 2090], desc: 'Both leaves solid, for privacy.', bestFor: 'Utility rooms and outbuildings' },
    { code: 'ST-04', name: 'Cottage boarded', layout: 'cottage', size: [920, 2090], desc: 'A small glazed top over a boarded bottom leaf.', bestFor: 'Cottages and country homes' },
  ],
};
