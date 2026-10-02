// Frequently asked questions. Shown on /faq/ and used by the website assistant.
// `k` = extra keywords that help the assistant match a question to an answer.

export const faqGroups = [
  {
    id: 'quotes',
    title: 'Quotes & prices',
    items: [
      {
        q: 'How much do uPVC windows cost?',
        a: 'Price depends on size, style, glass, colour and how many windows you are replacing, so we do not publish a price list that could mislead you. Use our online quote builder or send your sizes and photos on WhatsApp for a fast estimate, then we confirm a fixed price after a free survey.',
        k: ['price', 'prices', 'cost', 'costs', 'how much', 'expensive', 'cheap', 'rate', 'per window', 'estimate', 'budget', 'qeemat', 'kitna'],
      },
      {
        q: 'Is the survey and quote really free?',
        a: 'Yes. Surveys and quotations for new windows and doors are free and there is no obligation to go ahead.',
        k: ['free survey', 'free quote', 'obligation', 'charge for quote', 'survey cost'],
      },
      {
        q: 'Can I get a price over WhatsApp?',
        a: 'Yes. Send us the approximate width and height of each window or door, the style you want and a photo of the outside. We reply with an estimate and book a survey to confirm the exact price.',
        k: ['whatsapp', 'photo', 'photos', 'online quote', 'quick quote', 'message'],
      },
      {
        q: 'How long is a quotation valid?',
        a: 'The validity period is printed on your written quotation. Material prices can change, so please check the date if you are planning work for later in the year.',
        k: ['valid', 'validity', 'quote expiry', 'how long quote'],
      },
      {
        q: 'Do you need a deposit?',
        a: 'Payment terms, including any deposit, are set out clearly on your written quotation before you agree to anything. We never ask for full payment before work is completed.',
        k: ['deposit', 'payment', 'pay', 'upfront', 'finance', 'payment terms', 'card', 'bank transfer'],
      },
    ],
  },
  {
    id: 'installation',
    title: 'Surveys & installation',
    items: [
      {
        q: 'How long does it take to fit new windows?',
        a: 'A typical window takes two to four hours to replace, so most houses are completed in one to three days. Bays, large doors and structural work take longer. We give you a timetable before work starts.',
        k: ['how long', 'install time', 'fitting time', 'days', 'duration', 'installation take'],
      },
      {
        q: 'What is the lead time?',
        a: 'All windows and doors are made to order after the final survey. Lead times vary with the product and colour — standard white windows are quicker than coloured or composite doors — and we confirm the date on your quote.',
        k: ['lead time', 'when', 'how soon', 'wait', 'manufacture', 'delivery', 'weeks'],
      },
      {
        q: 'Will there be a lot of mess?',
        a: 'We use dust sheets, protect floors and furniture, and clean up every day. Old frames and packaging are taken away. There is some unavoidable dust when frames come out, so we recommend moving delicate items away from the windows.',
        k: ['mess', 'dust', 'clean', 'tidy', 'disruption', 'rubbish', 'old frames', 'waste'],
      },
      {
        q: 'Do I need to be at home during installation?',
        a: 'Someone over 18 should be at home at the start and end of each day so we can agree the plan and hand over. You do not need to stay in the room.',
        k: ['home', 'be there', 'present', 'access', 'keys'],
      },
      {
        q: 'Will you damage my plaster or window boards?',
        a: 'Careful removal keeps damage to a minimum, but older plaster can come away. We seal and trim internally as standard; any additional plastering or decorating is discussed and quoted at survey.',
        k: ['plaster', 'damage', 'window board', 'decorating', 'making good', 'trims'],
      },
    ],
  },
  {
    id: 'products',
    title: 'Products & performance',
    items: [
      {
        q: 'What window styles do you offer?',
        a: 'Casement, flush casement, tilt & turn, vertical sliding sash, bay and bow, horizontal sliding and shaped windows. Doors include uPVC and composite front and back doors, French doors, sliding patio doors, bi-folds and stable doors.',
        k: ['styles', 'types', 'range', 'products', 'what do you sell', 'options', 'kinds', 'window types', 'door types'],
      },
      {
        q: 'What is an A-rated window?',
        a: 'A Window Energy Rating (WER) grades a whole window — glass and frame — for how well it keeps heat in and lets useful solar gain through. Replacement windows must achieve a U-value of 1.4 W/m²K or better, or WER band B or above. A-rated options are available.',
        k: ['a rated', 'a-rated', 'energy rating', 'wer', 'u value', 'u-value', 'energy efficient', 'insulation', 'heat loss', 'warm', 'thermal', 'efficiency', 'bills'],
      },
      {
        q: 'Double or triple glazing?',
        a: 'Modern double glazing with Low-E glass, argon and warm-edge spacers meets current regulations and suits most homes. Triple glazing improves insulation further and can help with noise, but the panes are heavier and the price is higher. We will advise what makes sense for your home.',
        k: ['triple', 'double', 'glazing', 'triple glazing', 'double glazing', 'glass options'],
      },
      {
        q: 'Will new windows reduce noise?',
        a: 'Yes, well-sealed modern windows are much quieter than old or failed units. For busy roads, acoustic laminated glass or triple glazing with unequal pane thicknesses gives the biggest improvement.',
        k: ['noise', 'noisy', 'sound', 'acoustic', 'traffic', 'quiet', 'soundproof'],
      },
      {
        q: 'What colours are available?',
        a: 'White, cream and a large range of woodgrain and RAL colours, including anthracite grey (RAL 7016), black, agate grey, Chartwell green, golden oak and rosewood. Many colours are available as dual colour — one colour outside, white inside.',
        k: ['colour', 'colours', 'color', 'colors', 'grey', 'gray', 'anthracite', 'black', 'woodgrain', 'oak', 'white', 'cream', 'green', 'dual colour', 'ral'],
      },
      {
        q: 'How secure are your doors and windows?',
        a: 'Windows have multipoint espagnolette locking and key-locking handles. Doors have multipoint hook locks and anti-snap cylinders rated TS 007 3-star or SS 312 Diamond. PAS 24 and Secured by Design options are available if you need them.',
        k: ['secure', 'security', 'burglar', 'locks', 'pas 24', 'pas24', 'secured by design', 'safe', 'break in', 'anti snap'],
      },
      {
        q: 'Do uPVC windows need maintenance?',
        a: 'Very little: wash frames with warm soapy water two or three times a year, keep drainage slots clear and lubricate hinges and locking points once or twice a year. Our care guide explains everything.',
        k: ['maintenance', 'maintain', 'cleaning', 'clean', 'care', 'look after', 'lubricate'],
      },
    ],
  },
  {
    id: 'regulations',
    title: 'Regulations & certificates',
    items: [
      {
        q: 'Do replacement windows need Building Regulations approval?',
        a: 'Yes. In England and Wales, replacement windows and doors in existing homes must meet Building Regulations for energy efficiency, ventilation, safety glass and means of escape. Work is either self-certified by an installer registered with a Competent Person Scheme (such as FENSA or Certass) or approved through your local authority building control. Either way, you should receive a compliance certificate — keep it safe for when you sell.',
        k: ['building regulations', 'building regs', 'fensa', 'certass', 'certificate', 'compliance', 'building control', 'regulations', 'legal', 'certified'],
      },
      {
        q: 'Do I need planning permission?',
        a: 'Replacing windows and doors in a house with ones of similar appearance is usually permitted development. You may need permission for flats, listed buildings (listed building consent), conservation areas with an Article 4 direction, or if the new windows look substantially different. Check with your local planning authority if in doubt.',
        k: ['planning', 'planning permission', 'permission', 'listed', 'conservation', 'article 4', 'council'],
      },
      {
        q: 'Do new windows need trickle vents?',
        a: 'Under Approved Document F (2021), if the windows you are replacing have trickle vents, the new ones must have them too, and ventilation should not be made worse. We assess each room at survey.',
        k: ['trickle vent', 'trickle vents', 'ventilation', 'vents', 'part f', 'condensation', 'mould', 'mold'],
      },
      {
        q: 'What is a fire escape window?',
        a: 'Habitable rooms on the first floor — and some ground-floor rooms — need a window that can be used for escape: a clear openable area of at least 0.33 m², at least 450 mm wide and 450 mm high, with the bottom of the opening no more than 1,100 mm above the floor. Egress hinges help achieve this.',
        k: ['fire escape', 'escape window', 'egress', 'fire', 'emergency exit', 'part b'],
      },
    ],
  },
  {
    id: 'repairs',
    title: 'Repairs',
    items: [
      {
        q: 'Do you repair windows and doors you did not install?',
        a: 'Yes. We repair uPVC windows and doors from most UK manufacturers and systems. Sending a photo of the problem — and of the lock or hinge — on WhatsApp helps us bring the right parts.',
        k: ['repair other', 'not installed by you', 'any brand', 'other company', 'existing windows', 'fix my'],
      },
      {
        q: 'My double glazing is misted. Do I need a new window?',
        a: 'Usually not. Misting between the panes means the sealed unit has failed. We replace just the glass unit in your existing frame, which costs far less than a new window.',
        k: ['misted', 'foggy', 'cloudy', 'condensation between', 'steamed up', 'blown'],
      },
      {
        q: 'How quickly can you come out for a repair?',
        a: 'It depends on our diary and whether parts need ordering. Send photos on WhatsApp and we will give you the earliest appointment. Where glass is broken or a door cannot be secured, tell us — we prioritise making the property safe.',
        k: ['urgent', 'emergency', 'same day', 'today', 'tomorrow', 'quickly', 'asap', 'how soon repair', 'fast'],
      },
      {
        q: 'Do you charge a call-out fee?',
        a: 'Any call-out or diagnosis charge is confirmed before we book the visit, so there are no surprises. Many repairs can be quoted in advance from photos.',
        k: ['call out', 'callout', 'call-out', 'visit fee', 'charge', 'repair cost', 'repair price'],
      },
    ],
  },
  {
    id: 'aftercare',
    title: 'Guarantees & aftercare',
    items: [
      {
        q: 'What guarantee do I get?',
        a: 'Installations are covered by our written installation guarantee and repairs by a parts-and-labour guarantee. The exact terms are given on your quotation and guarantee certificate. See our guarantee page for details.',
        k: ['guarantee', 'warranty', 'guaranteed', 'cover', 'insurance backed', 'ibg'],
      },
      {
        q: 'What if something goes wrong after fitting?',
        a: 'Contact us by phone, WhatsApp or email with a description and photos. We will arrange a visit and put it right under your guarantee.',
        k: ['problem after', 'went wrong', 'complaint', 'aftercare', 'issue', 'fault'],
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
