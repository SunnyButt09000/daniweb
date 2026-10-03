// Models and layouts for each product. Each entry appears on the product page as a card with its
// drawing, and in the quote builder's "Model / layout" list. The drawing comes from `layout`.
//
// HOW TO MANAGE MODELS
// - Add a model: copy an entry in the right product list, give it a new unique `code`, and edit it.
// - Remove a model: delete its entry. Old quote links with that code fall back to "Standard".
// - Reorder: the order here is the order on the website. Put the most asked-for first.
// - `popular: true` adds a "Popular" tag. Keep it to one or two per product.
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
// uPVC, composite and stable doors: half · half-georgian · glazed · glazed-georgian · slot · squares3 ·
//   arch (2 panel 1 arch) · arch2 (2 panel 2 arch) · arch4 (4 panel 1 arch) · sq2 (2 panel 2 square) ·
//   stripes · panel2 · panel4 · solid · cottage
//   uPVC and composite doors can add a door set: "+side1" (one side panel), "+side2" (two), "+top" (top light),
//   e.g. "slot+side1+top"
// French doors: pair · pair+1 (one side panel) · pair+2 (two side panels) · pair+top · pair+2+top · georgian
// Bi-fold: panels folding left-right, e.g. "3-0" (three to the left) or "2-2"

export const models = {
  'casement-windows': [
    { code: 'CW-01', name: 'Single side-hung', layout: 'L', size: [600, 1050], desc: 'One opening sash, hinged at the side.', bestFor: 'Landings, cloakrooms and narrow openings' },
    { code: 'CW-02', name: 'Single top-hung', layout: 'T', size: [600, 900], desc: 'One sash hinged at the top, so it can stay open in light rain.', bestFor: 'Bathrooms and kitchens' },
    { code: 'CW-03', name: 'Single fixed light', layout: 'F', size: [600, 900], desc: 'A non-opening window for light only.', bestFor: 'Stairwells and high-level glazing' },
    { code: 'CW-04', name: 'Two-pane: side-hung and fixed', layout: 'L|F', size: [1200, 1050], desc: 'A side-hung opener beside a fixed light.', bestFor: 'Bedrooms, including escape windows', popular: true },
    { code: 'CW-05', name: 'Two-pane: side-hung and top-hung over fixed', layout: 'L|T*1/F*2', size: [1200, 1200], desc: 'A side-hung opener beside a fixed light with a top-hung vent above it.', bestFor: 'Most rooms. The classic UK layout', popular: true },
    { code: 'CW-06', name: 'Two-pane: top-hung vents over fixed', layout: 'T*1/F*2|T*1/F*2', size: [1200, 1200], desc: 'Two fixed lights, each with a top-hung vent above.', bestFor: 'Kitchens and rooms you ventilate often' },
    { code: 'CW-07', name: 'Pair of top-hung vents', layout: 'T|T', size: [1000, 600], desc: 'Two short top-hung sashes side by side.', bestFor: 'Over a kitchen sink or worktop' },
    { code: 'CW-08', name: 'Three-pane: openers at both ends', layout: 'L|F|R', size: [1800, 1200], desc: 'A wide fixed centre light with a side-hung opener at each end.', bestFor: 'Living rooms and front bedrooms' },
    { code: 'CW-09', name: 'Three-pane: side-hung, fixed and top-hung', layout: 'L|F|T*1/F*2', size: [1800, 1200], desc: 'A side-hung opener, a fixed centre and a top-hung vent over a fixed light.', bestFor: 'Living rooms that need an escape opener' },
    { code: 'CW-10', name: 'Three-pane with fixed top lights', layout: 'F*1/L*3|F*1/F*3|F*1/R*3', size: [1800, 1350], desc: 'Fixed top lights across the window, with side-hung openers below at each end.', bestFor: '1930s houses and tall openings' },
    { code: 'CW-11', name: 'Four-pane: openers at both ends', layout: 'L|F|F|R', size: [2400, 1200], desc: 'Two fixed centre lights with a side-hung opener at each end.', bestFor: 'Wide living-room openings' },
    { code: 'CW-12', name: 'Two-pane: pair of side-hung sashes', layout: 'L|R', size: [1200, 1050], desc: 'Two openers hinged at the outer edges, sometimes called a French casement.', bestFor: 'Bedrooms needing a wide clear opening' },
    { code: 'CW-13', name: 'Three-pane: top-hung vents over fixed', layout: 'T*1/F*2|T*1/F*2|T*1/F*2', size: [1800, 1200], desc: 'Three fixed lights, each with a top-hung vent above.', bestFor: 'Kitchens and rooms over a path' },
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
    { code: 'UD-01', name: 'Half-glazed panel door', layout: 'half', size: [920, 2090], desc: 'Glass in the top half and a panel below.', bestFor: 'Back and side doors', popular: true },
    { code: 'UD-02', name: 'Half-glazed with Georgian bars', layout: 'half-georgian', size: [920, 2090], desc: 'Half glazed, with bars dividing the glass.', bestFor: 'Matching Georgian-bar windows' },
    { code: 'UD-03', name: 'Fully glazed', layout: 'glazed', size: [920, 2090], desc: 'Mostly glass, with a short panel at the bottom.', bestFor: 'Garden and utility doors' },
    { code: 'UD-04', name: 'Fully glazed with Georgian bars', layout: 'glazed-georgian', size: [920, 2090], desc: 'Mostly glass, divided by bars.', bestFor: 'Garden doors on period-style homes' },
    { code: 'UD-05', name: 'Solid four-panel', layout: 'panel4', size: [920, 2090], desc: 'No glass, with four raised panels.', bestFor: 'Garages and doors that need privacy' },
    { code: 'UD-06', name: 'Solid two-panel', layout: 'panel2', size: [920, 2090], desc: 'No glass, with two tall panels.', bestFor: 'Side and utility doors' },
    { code: 'UD-07', name: 'Three square lights', layout: 'squares3', size: [920, 2090], desc: 'Three small square glass panels in a line, with a panel below.', bestFor: 'Front doors on modern homes' },
    { code: 'UD-08', name: 'Cottage door', layout: 'cottage', size: [920, 2090], desc: 'A small glazed top with vertical boarding below.', bestFor: 'Cottages and rural homes' },
    { code: 'UD-09', name: '2 panel, 2 square', layout: 'sq2', size: [920, 2090], desc: 'Two small square glass panels at the top, with two raised panels below.', bestFor: 'Front doors on 1930s and modern homes' },
    { code: 'UD-10', name: '2 panel, 2 arch', layout: 'arch2', size: [920, 2090], desc: 'Two arched glass panels at the top, with two raised panels below.', bestFor: 'Victorian and traditional homes' },
    { code: 'UD-11', name: '4 panel, 1 arch', layout: 'arch4', size: [920, 2090], desc: 'One arched glass panel above four raised panels.', bestFor: 'Traditional front doors' },
    { code: 'UD-12', name: 'Door with one side panel', layout: 'half+side1', size: [1300, 2090], desc: 'A half-glazed door with a glazed side panel on the handle side.', bestFor: 'Dark hallways that need more light' },
    { code: 'UD-13', name: 'Door with two side panels', layout: 'half+side2', size: [1700, 2090], desc: 'A half-glazed door with a glazed side panel either side.', bestFor: 'Wide entrances and porches' },
    { code: 'UD-14', name: 'Door with top light', layout: 'half+top', size: [920, 2400], desc: 'A half-glazed door under a fixed glazed top light.', bestFor: 'Tall openings and older houses' },
  ],

  'composite-doors': [
    { code: 'CD-01', name: 'Vertical slot glazed', layout: 'slot', size: [920, 2090], desc: 'A tall, narrow strip of glass to one side.', bestFor: 'Modern front doors', popular: true },
    { code: 'CD-02', name: 'Half-glazed', layout: 'half', size: [920, 2090], desc: 'Glass in the top half and a panel below.', bestFor: 'Front and back doors' },
    { code: 'CD-03', name: '2 panel, 1 arch', layout: 'arch', size: [920, 2090], desc: 'An arched glass panel above two raised panels.', bestFor: 'Victorian and Edwardian homes', popular: true },
    { code: 'CD-04', name: 'Three square lights', layout: 'squares3', size: [920, 2090], desc: 'Three small square glass panels in a line, with a panel below.', bestFor: '1930s and modern homes' },
    { code: 'CD-05', name: 'Contemporary stripes', layout: 'stripes', size: [920, 2090], desc: 'Horizontal glass slots across the door.', bestFor: 'New builds and modern refurbishments' },
    { code: 'CD-06', name: 'Solid contemporary', layout: 'solid', size: [920, 2090], desc: 'A flat, unglazed door with a long bar handle option.', bestFor: 'Minimal modern frontages' },
    { code: 'CD-07', name: 'Traditional four-panel', layout: 'panel4', size: [920, 2090], desc: 'No glass, with four raised panels like painted timber.', bestFor: 'Period homes that want privacy' },
    { code: 'CD-08', name: 'Cottage', layout: 'cottage', size: [920, 2090], desc: 'A small glazed top with vertical boarding below.', bestFor: 'Cottages and country homes' },
    { code: 'CD-09', name: '2 panel, 2 square', layout: 'sq2', size: [920, 2090], desc: 'Two small square glass panels at the top, with two raised panels below.', bestFor: '1930s and modern homes' },
    { code: 'CD-10', name: '2 panel, 2 arch', layout: 'arch2', size: [920, 2090], desc: 'Two arched glass panels at the top, with two raised panels below.', bestFor: 'Victorian and Edwardian homes' },
    { code: 'CD-11', name: '4 panel, 1 arch', layout: 'arch4', size: [920, 2090], desc: 'One arched glass panel above four raised panels.', bestFor: 'Traditional front doors' },
    { code: 'CD-12', name: 'Fully glazed back door', layout: 'glazed', size: [920, 2090], desc: 'Mostly glass, with a short panel at the bottom.', bestFor: 'Kitchen and garden doors' },
    { code: 'CD-13', name: 'Half-glazed with Georgian bars', layout: 'half-georgian', size: [920, 2090], desc: 'Glass in the top half divided by bars, with a panel below.', bestFor: 'Back doors on period-style homes' },
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
    { code: 'ST-01', name: 'Half-glazed top', layout: 'half', size: [920, 2090], desc: 'A glazed top leaf over a solid bottom leaf.', bestFor: 'Kitchens and back doors', popular: true },
    { code: 'ST-02', name: 'Georgian bar top', layout: 'half-georgian', size: [920, 2090], desc: 'A glazed top leaf with bars, over a solid bottom leaf.', bestFor: 'Period and cottage homes' },
    { code: 'ST-03', name: 'Solid top and bottom', layout: 'solid', size: [920, 2090], desc: 'Both leaves solid, for privacy.', bestFor: 'Utility rooms and outbuildings' },
    { code: 'ST-04', name: 'Cottage boarded', layout: 'cottage', size: [920, 2090], desc: 'A small glazed top over a boarded bottom leaf.', bestFor: 'Cottages and country homes' },
  ],
};
