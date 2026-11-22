export const DEMO_PREFERENCES = Object.freeze({
  values: ['family', 'calm', 'growth'],
  interests: ['music', 'coffee', 'books', 'travel'],
  intent: 'long-term',
  style: 'gentle',
  maxDistanceKm: 60
});

export const PROFILES = Object.freeze([
  {
    id: 'aanya', name: 'Aanya', age: 27, city: 'Pune', distanceKm: 12,
    emoji: '🌸', gradient: 'g1', intent: 'long-term', style: 'gentle',
    values: ['family', 'calm', 'growth', 'creativity'],
    interests: ['music', 'coffee', 'books', 'travel', 'pets'],
    promptQ: 'A perfect Sunday',
    promptA: 'Long walk, filter coffee, and a second-hand book shop.',
    greenFlags: ['clear intent', 'kind communication'], likesYou: true
  },
  {
    id: 'rohan', name: 'Rohan', age: 29, city: 'Mumbai', distanceKm: 34,
    emoji: '🎧', gradient: 'g2', intent: 'long-term', style: 'direct',
    values: ['ambition', 'growth', 'family'],
    interests: ['music', 'tech', 'travel', 'fitness'],
    promptQ: 'I geek out on',
    promptA: 'Tiny details in live sound systems and old Bollywood playlists.',
    greenFlags: ['clear intent', 'consistent habits'], likesYou: true
  },
  {
    id: 'meera', name: 'Meera', age: 26, city: 'Bengaluru', distanceKm: 48,
    emoji: '📚', gradient: 'g3', intent: 'meaningful', style: 'gentle',
    values: ['calm', 'creativity', 'family'],
    interests: ['books', 'coffee', 'art', 'yoga'],
    promptQ: 'Small joy',
    promptA: 'Rain on the window and a book I started twice.',
    greenFlags: ['reflective', 'kind communication'], likesYou: false
  },
  {
    id: 'kabir', name: 'Kabir', age: 31, city: 'Pune', distanceKm: 8,
    emoji: '🏔️', gradient: 'g4', intent: 'long-term', style: 'playful',
    values: ['adventure', 'growth', 'family'],
    interests: ['trekking', 'travel', 'fitness', 'coffee'],
    promptQ: 'Would rather',
    promptA: 'Take the longer route if the view is better.',
    greenFlags: ['clear intent', 'active lifestyle'], likesYou: true
  },
  {
    id: 'ishita', name: 'Ishita', age: 28, city: 'Mumbai', distanceKm: 41,
    emoji: '🎨', gradient: 'g5', intent: 'exploring', style: 'playful',
    values: ['creativity', 'calm', 'adventure'],
    interests: ['art', 'music', 'travel', 'cooking'],
    promptQ: 'My happy place',
    promptA: 'A pottery studio with terrible coffee and good music.',
    greenFlags: ['curious', 'creative'], likesYou: false
  },
  {
    id: 'arjun', name: 'Arjun', age: 30, city: 'Hyderabad', distanceKm: 55,
    emoji: '☕', gradient: 'g6', intent: 'meaningful', style: 'direct',
    values: ['family', 'ambition', 'growth'],
    interests: ['coffee', 'books', 'tech', 'movies'],
    promptQ: 'Conversation starter',
    promptA: 'Ask me about the spreadsheet I use for my coffee beans.',
    greenFlags: ['clear intent', 'honest communicator'], likesYou: true
  },
  {
    id: 'tara', name: 'Tara', age: 25, city: 'Pune', distanceKm: 16,
    emoji: '🐾', gradient: 'g7', intent: 'long-term', style: 'gentle',
    values: ['family', 'calm', 'growth'],
    interests: ['pets', 'yoga', 'cooking', 'music'],
    promptQ: 'Unusual fact',
    promptA: 'I can identify most street dogs in my neighbourhood by name.',
    greenFlags: ['clear intent', 'kind communication'], likesYou: true
  },
  {
    id: 'neil', name: 'Neil', age: 33, city: 'Bengaluru', distanceKm: 52,
    emoji: '🎬', gradient: 'g8', intent: 'exploring', style: 'playful',
    values: ['creativity', 'adventure', 'growth'],
    interests: ['movies', 'music', 'travel', 'cooking'],
    promptQ: 'Perfect plan',
    promptA: 'A film festival, unexpected snacks, and no fixed itinerary.',
    greenFlags: ['curious', 'open-minded'], likesYou: false
  },
  {
    id: 'sana', name: 'Sana', age: 29, city: 'Mumbai', distanceKm: 38,
    emoji: '🌿', gradient: 'g9', intent: 'long-term', style: 'gentle',
    values: ['family', 'calm', 'growth', 'faith'],
    interests: ['yoga', 'books', 'cooking', 'coffee'],
    promptQ: 'What I value',
    promptA: 'Quite mornings, honest words, and showing up when it matters.',
    greenFlags: ['clear intent', 'consistent habits'], likesYou: true
  },
  {
    id: 'vikram', name: 'Vikram', age: 32, city: 'Pune', distanceKm: 21,
    emoji: '🚴', gradient: 'g10', intent: 'meaningful', style: 'direct',
    values: ['growth', 'adventure', 'family'],
    interests: ['fitness', 'travel', 'tech', 'coffee'],
    promptQ: 'Weekend ritual',
    promptA: 'A long cycle, a simple lunch, and one unfinished conversation.',
    greenFlags: ['honest communicator', 'active lifestyle'], likesYou: false
  },
  {
    id: 'diya', name: 'Diya', age: 27, city: 'Hyderabad', distanceKm: 59,
    emoji: '🎶', gradient: 'g11', intent: 'long-term', style: 'playful',
    values: ['family', 'creativity', 'calm'],
    interests: ['music', 'art', 'coffee', 'travel'],
    promptQ: 'Current obsession',
    promptA: 'Making playlists for imaginary road trips.',
    greenFlags: ['clear intent', 'creative'], likesYou: true
  },
  {
    id: 'aashir', name: 'Aashir', age: 28, city: 'Bengaluru', distanceKm: 44,
    emoji: '🍜', gradient: 'g12', intent: 'exploring', style: 'gentle',
    values: ['calm', 'growth', 'adventure'],
    interests: ['cooking', 'coffee', 'movies', 'pets'],
    promptQ: 'Comfort food',
    promptA: 'Anything hot, spicy, and shared with someone who listens.',
    greenFlags: ['kind communication', 'curious'], likesYou: false
  }
]);

const INTENT_SCORE = {
  'long-term': 15,
  'meaningful': 11,
  'exploring': 6
};

export function overlapCount(a, b) {
  const set = new Set(Array.isArray(b) ? b : []);
  return (Array.isArray(a) ? a : []).filter((item) => set.has(item)).length;
}

export function scorePair(profile, preferences = DEMO_PREFERENCES) {
  const sharedValues = overlapCount(profile.values, preferences.values);
  const sharedInterests = overlapCount(profile.interests, preferences.interests);
  const valuePoints = Math.min(30, sharedValues * 10);
  const interestPoints = Math.min(30, sharedInterests * 8);
  const intentPoints = profile.intent === preferences.intent ? 15 : (INTENT_SCORE[profile.intent] || 6);
  const stylePoints = profile.style === preferences.style ? 10 : 5;
  const distance = Math.max(0, Number(profile.distanceKm) || 0);
  const distancePoints = distance <= (preferences.maxDistanceKm || 60) ? Math.max(4, 10 - Math.floor(distance / 10)) : 2;
  const flagPoints = Math.min(5, (profile.greenFlags || []).length * 2);

  const breakdown = {
    values: valuePoints,
    interests: interestPoints,
    intent: intentPoints,
    style: stylePoints,
    distance: distancePoints,
    greenFlags: flagPoints
  };

  const score = Math.max(1, Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0)));
  const reasons = [];

  if (sharedValues) reasons.push('Shares ' + sharedValues + ' core value' + (sharedValues > 1 ? 's' : '') + ' with you.');
  if (sharedInterests) reasons.push('Overlaps on ' + sharedInterests + ' interest' + (sharedInterests > 1 ? 's' : '') + '.');
  if (profile.intent === preferences.intent) reasons.push('Looking for the same kind of connection.');
  if (profile.style === preferences.style) reasons.push('Communication style matches your preference.');
  if (distance <= 20) reasons.push('Listed close to your demo area.');
  if (!reasons.length) reasons.push('A calm, low-pressure profile to start a conversation.');

  return { score, breakdown, reasons, sharedValues, sharedInterests };
}

export function redactContact(text) {
  return String(text || '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
    .replace(/\+?\d[\d\s-]{7,}\d/g, '[number]');
}

export function starterLines(profile, result) {
  const interest = (profile.interests || [])[0] || 'music';
  const value = (profile.values || [])[0] || 'growth';
  const lines = [
    'Your note about "' + redactContact(profile.promptA) + "' caught my eye.",
    'We both seem to care about ' + value + '. What does that look like day to day?',
    'Want to start with ' + interest + ' and see where the conversation goes?'
  ];
  if (result && result.sharedInterests >= 2) lines.push('We have a few interests in common — which one should we try first?');
  return lines;
}

export function getProfile(id) {
  return PROFILES.find((profile) => profile.id === id) || null;
}

export function scoreClass(score) {
  if (score >= 80) return 'score-high';
  if (score >= 60) return 'score-mid';
  return 'score-low';
}
