// Frequently asked questions. Shown on /faq/ and used by the website assistant.
// `q` and `a` are plain text (no HTML): the assistant escapes them before display.
// `k` = extra keywords that help the assistant match a question to an answer:
// synonyms, short phrases, common misspellings and some Roman Urdu.
// Keep item 0 of each group in place, and item 1 of 'products' and 'repairs':
// the home page picks those five by position.

export const faqGroups = [
  {
    id: 'quotes',
    title: 'Quotes, prices & payment',
    items: [
      {
        q: 'How much do uPVC windows cost?',
        a: 'It depends on the size, style, glass and colour, and on how many windows you’re replacing, so we don’t publish a price list that could mislead you. For a quick estimate, use the online quote builder or send sizes and photos on WhatsApp. We then confirm a fixed price in writing after a free survey.',
        k: [
          'price', 'prices', 'pricing', 'cost', 'costs', 'how much', 'expensive', 'cheap', 'cheapest', 'affordable', 'rate', 'rates',
          'per window', 'price per window', 'cost per window', 'price list', 'ballpark', 'rough price', 'rough cost', 'estimate', 'budget',
          'window price', 'window prices', 'door price', 'new windows cost', 'replacement windows cost', 'double glazing cost', 'double glazing price',
          'prise', 'pirce', 'cots',
          'qeemat', 'qimat', 'kimat', 'kitna', 'kitne ka', 'kitne ki', 'kitne paise', 'kitna kharcha', 'kharcha', 'rate kya hai', 'price kya hai',
        ],
      },
      {
        q: 'Are the survey and quote really free?',
        a: 'Yes. Surveys and written quotations for new windows and doors are free, and there’s no obligation to go ahead. You won’t be asked to sign on the day.',
        k: [
          'free survey', 'free quote', 'free quotation', 'free estimate', 'free visit', 'no obligation', 'obligation', 'charge for quote', 'charge for survey',
          'survey cost', 'survey fee', 'pay for survey', 'pay for quote', 'quote fee', 'is it free', 'hard sell', 'pressure', 'sign on the day',
          'free hai', 'muft', 'free mein', 'survey ke paise',
        ],
      },
      {
        q: 'Can I get a price over WhatsApp?',
        a: 'Yes. Send the rough width and height of each window or door, the style you want and a photo of each one from outside. We reply with an estimate, then book a free survey to confirm the exact price.',
        k: [
          'whatsapp', 'whats app', 'watsapp', 'whatsap', 'watsap', 'send photos', 'send pictures', 'photo', 'photos', 'picture', 'pictures', 'pics', 'video',
          'quick quote', 'quick price', 'price by text', 'text you', 'message', 'quote by message', 'quote without visit', 'remote quote',
          'photo bhej', 'tasveer', 'tasveer bhejo', 'whatsapp pe',
        ],
      },
      {
        q: 'How do I measure for the online quote builder?',
        a: 'On the Get a quote page at /quote/, you choose each window or door and type its width and height in millimetres, and the drawing redraws to size. For the width, measure the existing frame edge to edge at the top, middle and bottom. For the height, measure at the left, centre and right, and use the smallest figure each time. It doesn’t need to be perfect, because we measure every opening again at the survey before anything is made.',
        k: [
          'measure', 'measuring', 'measurement', 'measurements', 'how to measure', 'measure window', 'measure door', 'size', 'sizes', 'sizing', 'width', 'height',
          'mm', 'millimetres', 'millimeters', 'tape measure', 'quote builder', 'quote tool', 'quote page', 'online quote', 'online form', 'configurator',
          'draw window', 'drawing', 'draw to size', 'schedule', 'mesure', 'measurment', 'mesurement', 'measurmint',
          'naap', 'naapna', 'naap kaise', 'size kaise', 'measure kaise', 'size kya',
        ],
      },
      {
        q: 'What if my windows are bigger or smaller than I measured?',
        a: 'That’s fine, and it’s common. Your estimate is based on the sizes you send us, and we measure every opening ourselves at the survey. If sizes or details change, we explain the difference and give you a revised written quote before anything is ordered.',
        k: [
          'bigger than', 'smaller than', 'bigger than expected', 'wrong size', 'wrong sizes', 'wrong measurement', 'measured wrong', 'measurement mistake',
          'different size', 'size different', 'size changed', 'estimate change', 'estimate changed', 'estimate different', 'change after survey',
          'different after survey', 'size galat', 'galat naap', 'naap galat',
        ],
      },
      {
        q: 'How long is a quotation valid?',
        a: 'The validity period is printed on your written quotation. Material prices can change, so check the date if you plan to go ahead later in the year. If it has run out, ask us to check it again.',
        k: [
          'valid', 'validity', 'quote expiry', 'quote expire', 'expire', 'expired', 'expiry', 'how long quote', 'quote still valid', 'old quote', 'last year quote',
          'gone up', 'quote date', 'how long does a quote last', 'kab tak valid', 'kitne din valid',
        ],
      },
      {
        q: 'Do you need a deposit?',
        a: 'Any deposit and stage payments are set out on your written quotation before you agree to anything. We never ask for full payment before the work is complete.',
        k: [
          'deposit', 'deposits', 'advance', 'advance payment', 'upfront', 'up front', 'pay upfront', 'pay before', 'pay in advance', 'payment stages', 'stage payment',
          'payment terms', 'full payment', 'pay at the end', 'when do i pay', 'down payment', 'depost', 'deposite',
          'pehle paise', 'advance dena', 'advance kitna',
        ],
      },
      {
        q: 'How can I pay?',
        a: 'The payment methods we accept, and when each payment is due, are set out on your quotation. If you’d like to pay a particular way, or want to ask about spreading the cost, raise it before you accept the quote.',
        k: [
          'payment', 'payments', 'payment method', 'payment methods', 'payment options', 'how to pay', 'how do i pay', 'pay by card', 'card', 'credit card',
          'debit card', 'bank transfer', 'transfer', 'cash', 'cheque', 'invoice', 'finance', 'monthly payments', 'pay monthly', 'instalments', 'installments',
          'spread payments', 'offer finance', 'finance options', 'finance available', 'buy now pay later', 'paymnet', 'payement',
          'payment kaise', 'paise kaise', 'qist', 'qiston', 'qiston mein',
        ],
      },
    ],
  },
  {
    id: 'installation',
    title: 'Surveys & installation',
    items: [
      {
        q: 'How long does it take to fit new windows?',
        a: 'A typical window takes two to four hours to replace, so most houses are finished in one to three days. Bays, large doors and any structural work take longer. We give you a timetable before work starts.',
        k: [
          'how long', 'how long to fit', 'how long to install', 'install time', 'installation time', 'fitting time', 'how many days', 'days', 'duration',
          'one day', 'fit in a day', 'installation take', 'hours per window', 'whole house', 'instalation', 'installtion',
          'kitne din', 'kitna time', 'kitna waqt', 'kitne ghante', 'time lagega',
        ],
      },
      {
        q: 'What is the lead time for new windows and doors?',
        a: 'Everything is made to order after the final survey. Lead times depend on the product and colour, and standard white windows usually come through sooner than coloured frames or composite doors. We confirm the expected date on your quote and tell you if it changes.',
        k: [
          'lead time', 'lead times', 'leadtime', 'how soon', 'how quickly', 'wait', 'waiting time', 'waiting list', 'manufacture', 'manufacturing',
          'made to order', 'delivery', 'delivery time', 'weeks', 'how many weeks', 'start date', 'earliest date',
          'kab tak', 'kab milega', 'kab milenge', 'kab lagenge', 'kab lagaoge', 'kitne hafte',
        ],
      },
      {
        q: 'Do I need to be at home during the installation?',
        a: 'Someone over 18 should be in at the start and end of each day, so we can agree the plan and hand over. You don’t need to stay in the room while we work.',
        k: [
          'be home', 'at home', 'be there', 'be present', 'present', 'stay in', 'stay home', 'go to work', 'out at work', 'access', 'keys', 'leave keys',
          'adult', 'ghar par', 'ghar pe rehna', 'ghar pe',
        ],
      },
      {
        q: 'Will there be a lot of mess?',
        a: 'We lay dust sheets, protect floors and furniture, and tidy up at the end of each day. Some dust is unavoidable when old frames come out, so move delicate items away from the windows before we arrive.',
        k: [
          'mess', 'messy', 'dust', 'dusty', 'dirt', 'dirty', 'clean up', 'tidy', 'tidy up', 'disruption', 'disruptive', 'dust sheets', 'protect floor',
          'furniture', 'carpet', 'curtains', 'blinds', 'gand', 'safai', 'mitti',
        ],
      },
      {
        q: 'Do you take away the old windows and doors?',
        a: 'Yes. Removing and disposing of your old frames and glass, along with all the packaging, is part of our installation service. You don’t need to hire a skip.',
        k: [
          'old frames', 'old windows', 'old doors', 'disposal', 'dispose', 'dispose of', 'remove old', 'removal', 'take away', 'take old windows',
          'rubbish', 'waste', 'skip', 'recycle', 'recycling', 'dispossal',
          'purani khidkiyan', 'purane frame', 'purana darwaza', 'kachra',
        ],
      },
      {
        q: 'Will you damage my plaster or window boards?',
        a: 'We take the old frames out carefully to keep damage to a minimum, but older plaster can sometimes come away. Sealing and trims inside are included as standard. Any extra plastering or decorating is discussed and quoted at the survey.',
        k: [
          'plaster', 'plastering', 'damage', 'damage walls', 'wall damage', 'window board', 'window boards', 'window sill', 'inside sill', 'decorating',
          'decoration', 'making good', 'make good', 'trims', 'trim', 'render', 'brickwork', 'plastr', 'deewar',
        ],
      },
      {
        q: 'Can you fit windows in winter or when it’s raining?',
        a: 'Yes. We fit all year round, and each new frame goes in as soon as the old one comes out, so each opening is exposed only briefly and the house keeps most of its heat. External sealant needs a dry surface, so in heavy rain or high winds we may change the order of work or move the date.',
        k: [
          'winter', 'cold weather', 'fit in the rain', 'raining', 'rainy day', 'wet weather', 'bad weather', 'weather', 'snow', 'frost', 'freezing',
          'stormy', 'christmas', 'all year', 'time of year', 'best time', 'wintr',
          'barish', 'baarish', 'sardi', 'sardiyon', 'thand', 'mausam',
        ],
      },
      {
        q: 'Do you work at weekends?',
        a: 'Yes. Our service hours are 7am to 8pm, seven days a week, so surveys, fittings and repairs can be booked for a weekend or an evening. The team answers WhatsApp and chat messages from 7am to midnight, every day.',
        k: [
          'weekend', 'weekends', 'saturday', 'saturdays', 'sunday', 'sundays', 'evening', 'evenings', 'after work', 'opening hours', 'opening times',
          'working days', 'working hours', 'bank holiday', 'days you work', 'chutti', 'chutti wale din', 'itwar', 'hafta', 'sunday ko',
        ],
      },
    ],
  },
  {
    id: 'products',
    title: 'Products & performance',
    items: [
      {
        q: 'What window and door styles do you offer?',
        a: 'For windows we fit casement, flush casement, tilt & turn, vertical sliding sash, bay and bow, horizontal sliding and shaped designs. For doors we fit uPVC and composite front and back doors, French doors, sliding patio doors, bi-folds and stable doors. Each style has its own page with the options.',
        k: [
          'styles', 'style', 'types', 'type', 'range', 'products', 'what do you sell', 'what you sell', 'options', 'kinds', 'window types',
          'door types', 'window styles', 'door styles', 'catalogue', 'brochure', 'designs', 'full range',
          'kaun si', 'konsi khidki', 'konsa darwaza', 'kis type',
        ],
      },
      {
        q: 'What is an A-rated window?',
        a: 'A Window Energy Rating (WER) grades the whole window, glass and frame together, on how well it keeps heat in and lets useful sunlight warm the room. Replacement windows must reach a U-value of 1.4 W/m²K or better, or WER band B or above. A-rated options are available if you want to go further.',
        k: [
          'a rated', 'a-rated', 'energy rating', 'energy ratings', 'wer', 'window energy rating', 'u value', 'u-value', 'uvalue', 'u values',
          'energy efficient', 'energy efficiency', 'efficiency', 'insulation', 'insulated', 'heat loss', 'warm', 'warmer', 'thermal', 'heating bills', 'bills',
          'save energy', 'save money', 'part l', 'band b', 'epc', 'energy saving', 'efficent', 'effecient',
          'bijli bill', 'gas bill', 'garam', 'garmi',
        ],
      },
      {
        q: 'Should I choose double or triple glazing?',
        a: 'Modern double glazing with Low-E glass, argon gas and warm-edge spacers meets current regulations and suits most homes. Triple glazing keeps in more heat and can cut more noise, but the units are heavier and cost more. We’ll tell you at the survey whether it’s worth it for your house.',
        k: [
          'triple', 'triple glazing', 'triple glazed', 'tripple', 'tripple glazing', 'double', 'double glazing', 'double glazed', 'glazing', 'glass options',
          'which glass', 'best glass', 'low e', 'low-e', 'argon', 'gas filled', 'warm edge', 'spacer', 'double or triple', 'worth it',
          'do sheeshe', 'teen sheeshe', 'teen glass',
        ],
      },
      {
        q: 'Will new windows cut down noise?',
        a: 'Yes. Well-sealed modern windows are much quieter than old frames or failed units. Near a busy road, railway or flight path, the biggest improvement comes from acoustic laminated glass or triple glazing with panes of different thickness. Tell us at the survey which rooms are noisiest.',
        k: [
          'noise', 'noisy', 'sound', 'sound proof', 'soundproof', 'soundproofing', 'acoustic', 'traffic', 'traffic noise', 'road noise',
          'busy road', 'railway', 'trains', 'planes', 'flight path', 'airport', 'neighbours', 'quiet', 'quieter', 'noise reduction', 'nois', 'accoustic',
          'shor', 'awaz', 'awaaz',
        ],
      },
      {
        q: 'What colours can I choose?',
        a: 'You can choose white, cream or one of a wide range of woodgrain and RAL colours, including anthracite grey (RAL 7016), black, agate grey, Chartwell green, golden oak and rosewood. Many come as dual colour, with the colour outside and white inside. Colours look different on screen, so we bring samples to the survey.',
        k: [
          'colour', 'colours', 'color', 'colors', 'colour options', 'colour samples', 'samples', 'grey', 'gray', 'anthracite', 'anthracite grey', '7016',
          'black', 'black windows', 'grey windows', 'woodgrain', 'wood grain', 'wood effect', 'wood look', 'oak', 'golden oak', 'rosewood', 'white', 'cream',
          'green', 'chartwell', 'agate', 'dual colour', 'two colour', 'foiled', 'ral', 'coulour', 'colur',
          'rang', 'kala', 'kaala', 'safed', 'konsa rang',
        ],
      },
      {
        q: 'How secure are your windows and doors?',
        a: 'Windows have multipoint espagnolette locking and key-locking handles. Doors have multipoint hook locks and anti-snap cylinders rated TS 007 3-star or SS 312 Diamond. PAS 24 and Secured by Design options are available, for example if your insurer asks for them.',
        k: [
          'secure', 'security', 'burglar', 'burglary', 'burglar proof', 'locks', 'lock', 'locking', 'multipoint', 'multi point', 'anti snap', 'anti-snap',
          'snap secure', 'cylinder', 'euro cylinder', 'ts007', 'ts 007', '3 star', 'diamond', 'sold secure', 'pas 24', 'pas24', 'secured by design', 'sbd',
          'safe', 'break in', 'break-in', 'insurance', 'insurer', 'secruity', 'secuirty',
          'chori', 'chor', 'mehfooz', 'tala',
        ],
      },
      {
        q: 'How do I clean and look after uPVC windows?',
        a: 'Wash the frames two or three times a year with warm water, a little washing-up liquid and a soft cloth, and clean the glass with a normal glass cleaner. Avoid abrasive pads, bleach, solvents and pressure washers near the seals. Twice a year, clear the drainage slots along the bottom of the frame and lubricate the hinges and locking points. Our care guide has the full routine.',
        k: [
          'maintenance', 'maintain', 'maintenence', 'maintainance', 'cleaning', 'clean', 'clean windows', 'clean frames', 'how to clean', 'cleaner',
          'cleaning products', 'washing', 'wash', 'bleach', 'pressure washer', 'care', 'look after', 'lubricate', 'lubrication',
          'oil', 'grease', 'wd40', 'wd-40', 'silicone spray', 'drainage', 'drain holes',
          'saaf', 'saaf kaise', 'safai kaise', 'dekhbhal',
        ],
      },
      {
        q: 'Can you match my existing windows?',
        a: 'Usually, yes. If you’re only replacing some of your windows, we match the style, colour, glass pattern and any Georgian bars as closely as we can. Send photos of the windows you want to match and we’ll confirm what’s possible at the survey. New white uPVC can look brighter next to frames that have weathered for years.',
        k: [
          'match', 'matching', 'match existing', 'same as existing', 'same as the others', 'same as my other windows', 'one window',
          'one window only', 'replace one window', 'single window', 'just one window', 'some windows', 'few windows', 'georgian bars', 'georgian',
          'astragal bars', 'match colour', 'mismatch', 'look the same',
          'ek khidki', 'sirf ek', 'same jaisi', 'baqi jaisi',
        ],
      },
      {
        q: 'Should I choose uPVC or aluminium?',
        a: 'Our range is uPVC windows plus uPVC and composite doors. uPVC insulates well, needs very little upkeep and usually costs less than aluminium. Aluminium allows slimmer frames around very large panes, but at a higher price. If you like a slimmer, modern look, ask about our flush casement windows and darker colours.',
        k: [
          'aluminium', 'aluminum', 'alu', 'alluminium', 'aluminim', 'aluminium windows', 'aluminium doors', 'upvc vs aluminium', 'upvc or aluminium',
          'aluminium vs upvc', 'metal windows', 'metal frames', 'slim frames', 'slimline', 'thin frames', 'slim look', 'crittall', 'steel look',
          'best material', 'which material', 'plastic or metal', 'upvc or metal',
        ],
      },
    ],
  },
  {
    id: 'regulations',
    title: 'Regulations & certificates',
    items: [
      {
        q: 'Do replacement windows need Building Regulations approval?',
        a: 'Yes. In England and Wales, replacement windows and doors must meet the Building Regulations on energy efficiency, ventilation, safety glass and means of escape. The work is either self-certified by an installer registered with a Competent Person Scheme, such as FENSA or Certass, or approved by your local authority building control. Either way you should get a compliance certificate, so keep it safe for when you sell.',
        k: [
          'building regulations', 'building regs', 'building regulation', 'regs', 'fensa', 'fensa certificate', 'certass', 'certificate', 'certificates',
          'compliance', 'compliance certificate', 'building control', 'competent person scheme', 'regulations', 'approved document', 'legal', 'law',
          'certified', 'registered', 'selling house', 'sell my house', 'solicitor', 'conveyancing', 'paperwork', 'fensa registered', 'buliding regs',
          'qanoon', 'certificate milega',
        ],
      },
      {
        q: 'Do I need planning permission?',
        a: 'Replacing the windows and doors on a house with ones of similar appearance is usually permitted development, so planning permission isn’t needed. Flats and maisonettes, conservation areas with an Article 4 direction, and windows that look very different may need permission, and listed buildings need listed building consent. Leaseholders should also check their lease, as the freeholder’s consent is often required. If in doubt, ask your local planning authority before you order.',
        k: [
          'planning', 'planning permission', 'permission', 'permitted development', 'listed', 'listed building', 'listed building consent', 'conservation',
          'conservation area', 'article 4', 'council', 'local authority', 'flat', 'flats', 'maisonette', 'leasehold', 'freeholder', 'planing',
          'ijazat', 'permission chahiye',
        ],
      },
      {
        q: 'Do new windows need trickle vents?',
        a: 'Under Approved Document F (2021 edition), if the windows you are replacing have trickle vents, the new ones must have them too, and ventilation must not be made worse. We check each room at the survey and tell you where vents are needed.',
        k: [
          'trickle vent', 'trickle vents', 'trickel vent', 'tricke vent', 'trickle', 'vents', 'vent', 'ventilation', 'air vent', 'air vents', 'slot vent',
          'vent on top', 'part f', 'approved document f', 'fresh air', 'airflow', 'hawa',
        ],
      },
      {
        q: 'What is a fire escape window?',
        a: 'An escape window is one you could climb out of in a fire, and upstairs habitable rooms such as bedrooms usually need one. The opening must give at least 0.33 m² of clear space, be at least 450 mm wide and 450 mm high, and have its bottom edge no more than 1,100 mm above the floor. Egress (escape) hinges help a casement open wide enough to meet this.',
        k: [
          'fire escape', 'escape window', 'escape windows', 'egress', 'fire', 'fire exit',
          'emergency exit', 'means of escape', 'part b', 'bedroom window', 'first floor bedroom', 'opening size', 'clear opening', 'egres',
          'aag', 'aag lage',
        ],
      },
      {
        q: 'Where do I need safety glass?',
        a: 'Part K of the Building Regulations requires safety glass where people are most likely to walk into it. That means any glazing within 800 mm of the floor, and glass in a door or within 300 mm of a door, up to 1,500 mm above the floor. We use toughened or laminated glass in these places and list it on your quote.',
        k: [
          'safety glass', 'safety glazing', 'toughened', 'toughened glass', 'tempered', 'tempered glass', 'laminated', 'laminated glass', 'part k',
          'critical location', 'critical locations', 'low glass', 'glass near floor', 'glass in door', 'door glass', 'side panel', 'side light',
          'kitemark', 'kite mark', 'shatter', 'shatterproof', 'toughend', 'toughned',
          'bachon', 'bachay', 'mazboot sheesha',
        ],
      },
    ],
  },
  {
    id: 'repairs',
    title: 'Repairs',
    items: [
      {
        q: 'Do you repair windows and doors you didn’t install?',
        a: 'Yes. We repair uPVC windows and doors from most UK manufacturers and systems. Send a photo of the problem on WhatsApp, with a close-up of the lock or hinge, so we can bring the right parts first time.',
        k: [
          'repair other', 'not installed by you', 'didnt install', 'did not install', 'other company', 'other installer', 'another company', 'any brand',
          'any make', 'any manufacturer', 'existing windows', 'fix my', 'someone else fitted',
          'previous owner', 'came with the house', 'rapair', 'repiar',
          'kisi aur ne', 'doosri company',
        ],
      },
      {
        q: 'My double glazing is misted. Do I need a new window?',
        a: 'Usually not. Mist between the panes means the sealed unit has failed, and we can replace just that glass unit in your existing frame. It costs far less than a new window.',
        k: [
          'misted', 'misty', 'misting', 'misted up', 'foggy', 'fogged', 'cloudy', 'moisture between', 'mist between panes',
          'steamed up', 'blown', 'blown unit', 'failed unit', 'need a new window',
          'dhundla', 'dhund', 'dhundla sheesha',
        ],
      },
      {
        q: 'Can you replace just the glass and keep the frame?',
        a: 'Yes, as long as the frame is in good order. We can replace a cracked, broken or misted sealed unit on its own, or swap clear glass for obscure, acoustic or safety glass. We measure the unit, have a new one made to size and usually fit it in under an hour. Where safety glass is needed, such as in a door or within 800 mm of the floor, we fit toughened or laminated glass.',
        k: [
          'just the glass', 'glass only', 'only the glass', 'keep the frame', 'keep frame', 'without new frame', 'replace glass only', 'replace the glass',
          'new glass', 'new glass unit', 'glass unit', 'dg unit', 'replacement unit', 'upgrade glass', 'change glass',
          'obscure glass', 'frosted glass', 'privacy glass',
          'sirf sheesha', 'sheesha badalna', 'glass change',
        ],
      },
      {
        q: 'How quickly can you come out for a repair?',
        a: 'It depends on our diary and whether parts need ordering. Send photos on WhatsApp and we’ll offer the earliest appointment we have. If glass is broken or a door won’t lock, tell us, because making the property safe comes first.',
        k: [
          'urgent', 'emergency', 'emergency repair', 'same day', 'today', 'tomorrow', 'quickly', 'asap', 'how soon repair', 'fast', 'earliest',
          'next available', 'cant lock', 'won\'t lock', 'wont lock', 'insecure', 'board up', 'boarding up', 'emergancy', 'urjent',
          'jaldi', 'fori', 'foran', 'abhi', 'aaj', 'kal tak',
        ],
      },
      {
        q: 'Do you charge a call-out fee?',
        a: 'Any call-out or diagnosis charge is confirmed before we book the visit, so there are no surprises. Many repairs can be priced in advance from photos.',
        k: [
          'call out', 'callout', 'call-out', 'call out fee', 'call out charge', 'visit fee', 'visit charge', 'inspection fee', 'diagnosis', 'diagnostic',
          'charge', 'charges', 'repair cost', 'repair price', 'how much repair', 'free call out',
          'repair kitne ka', 'repair qeemat', 'aane ke paise',
        ],
      },
      {
        q: 'Do you work for landlords, letting agents and businesses?',
        a: 'Yes. We carry out repairs and replacements for landlords, letting agents, property managers and businesses. We can contact your tenant directly to arrange access, then send you photos and a written summary of the work. If you’re a tenant, check with your landlord or agent first, as they are usually responsible for repairs to windows and doors.',
        k: [
          'landlord', 'landlords', 'letting agent', 'letting agents', 'lettings', 'estate agent', 'property manager', 'property management', 'managing agent',
          'tenant', 'tenants', 'tenancy', 'renting', 'rented', 'rental', 'rental property', 'buy to let', 'btl', 'hmo', 'housing association',
          'tenant repair', 'tenants repair', 'repair for tenant', 'rental repair', 'landlord repair', 'tenant access',
          'commercial', 'business', 'businesses', 'shop', 'shops', 'office', 'offices', 'landlrod', 'landord',
          'kirayedar', 'kiraya', 'kiraye ka ghar', 'malik makan',
        ],
      },
    ],
  },
  {
    id: 'aftercare',
    title: 'Guarantees & aftercare',
    items: [
      {
        q: 'What guarantee do I get?',
        a: 'New installations come with our written installation guarantee, and repairs with a parts-and-labour guarantee. The length and full terms are on your quotation and guarantee certificate, and our guarantee page explains what is and isn’t covered. Your statutory rights are not affected.',
        k: [
          'guarantee', 'guarantees', 'guaranteed', 'warranty', 'warranties', 'how long guarantee', 'guarantee length', 'years guarantee', '10 year guarantee',
          'ten year guarantee', 'insurance backed', 'insurance-backed', 'ibg', 'guarantee certificate', 'what is covered', 'guarentee', 'gaurantee',
          'garantee', 'warrenty', 'waranty',
          'guarantee kitni', 'warranty kitni', 'kitni guarantee', 'kitne saal', 'kitne saal ki',
        ],
      },
      {
        q: 'What if something goes wrong after fitting?',
        a: 'Contact us by phone, WhatsApp or email with your address, a short description and photos or a video. We’ll arrange a visit and, if it’s covered, put it right under your guarantee.',
        k: [
          'problem after', 'went wrong', 'gone wrong', 'complaint', 'complain', 'aftercare', 'after care', 'issue', 'fault', 'defect', 'defective',
          'snagging', 'snag', 'after installation', 'after fitting', 'problem with new windows', 'new door problem', 'claim',
          'make a claim', 'shikayat', 'masla', 'kharab ho gaya',
        ],
      },
      {
        q: 'Why is there condensation on my new windows?',
        a: 'Condensation on the room side of the glass comes from moisture in the air indoors, not a fault with the window. New windows are more airtight than old ones, so keep trickle vents open, use extractor fans and open a window after cooking, showers or drying clothes. Condensation on the outside of the glass on a cold morning is normal and shows the glass is keeping heat in. Only moisture between the panes means a sealed unit has failed.',
        k: [
          'condensation', 'condensation on new windows', 'new windows condensation', 'condensation outside', 'condensation room side',
          'wet windows', 'water on windows', 'water on the window', 'droplets', 'wet in the morning', 'steamy windows', 'moisture', 'damp', 'humidity',
          'mould', 'mold', 'black mould', 'condesation', 'condensaton', 'condinsation', 'condensastion',
          'pani', 'geela', 'nami', 'sheeshe pe pani',
        ],
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
