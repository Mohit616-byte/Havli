export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  vibe: string[];
  city: string;
  area: string;
  date: string;
  dateISO: string;
  time: string;
  price: number;
  capacity: number;
  spotsLeft: number;
  image: string;
  host: {
    name: string;
    verified: boolean;
    avatar?: string;
  };
  whatToExpect: string[];
  safetyNote: string;
}

export const CITIES = [
  "Gurgaon",
  "Noida",
  "Delhi",
  "Greater Noida",
  "Ghaziabad",
  "Faridabad",
] as const;

export const VIBES = [
  { label: "House Party", emoji: "🏠", value: "house-party" },
  { label: "Music", emoji: "🎵", value: "music" },
  { label: "Gaming", emoji: "🎮", value: "gaming" },
  { label: "Karaoke", emoji: "🎤", value: "karaoke" },
  { label: "Food", emoji: "🍕", value: "food" },
  { label: "Sports", emoji: "🏀", value: "sports" },
  { label: "Chill", emoji: "☕", value: "chill" },
  { label: "Meet People", emoji: "🤝", value: "meet-people" },
] as const;

export const EVENTS: Event[] = [
  {
    id: "rooftop-social-gurgaon",
    title: "Rooftop Social",
    description:
      "An intimate rooftop gathering for people who want to meet new faces over great music and good vibes. Whether you're new to Gurgaon or just looking to expand your circle — this is your spot.",
    type: "Social",
    vibe: ["Music", "Meet People"],
    city: "Gurgaon",
    area: "Sector 57",
    date: "Sat, 16 Aug",
    dateISO: "2026-08-16",
    time: "8:30 PM",
    price: 399,
    capacity: 30,
    spotsLeft: 12,
    image:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    host: {
      name: "Anika S.",
      verified: true,
    },
    whatToExpect: [
      "A curated playlist — think Bollywood Indie + global beats",
      "30 attendees max — intentionally small and social",
      "Snacks and drinks on purchase",
      "Great city views from the terrace",
    ],
    safetyNote:
      "This is a verified private event. All attendees are vetted before entry. The host's contact is shared only with confirmed guests.",
  },
  {
    id: "bollywood-karaoke-noida",
    title: "Bollywood Karaoke Night",
    description:
      "Grab the mic, belt out your favourite Bollywood classics, and make some memories with a fun crowd in Noida. No singing talent required — just good energy!",
    type: "Karaoke",
    vibe: ["Karaoke", "Music", "Meet People"],
    city: "Noida",
    area: "Sector 62",
    date: "Fri, 15 Aug",
    dateISO: "2026-08-15",
    time: "7:00 PM",
    price: 299,
    capacity: 40,
    spotsLeft: 18,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    host: {
      name: "Rohan M.",
      verified: true,
    },
    whatToExpect: [
      "Full Bollywood karaoke setup",
      "Games and group activities",
      "Friendly crowd, all backgrounds welcome",
      "Complimentary welcome drink",
    ],
    safetyNote:
      "Hosted in a registered venue with proper security. ID verification at entry.",
  },
  {
    id: "game-night-hauz-khas",
    title: "Game Night: Board & Beyond",
    description:
      "A cozy indoor game night in South Delhi — board games, card games, and plenty of laughs. Perfect for people who love strategy and socialising in equal measure.",
    type: "Gaming",
    vibe: ["Gaming", "Chill", "Meet People"],
    city: "Delhi",
    area: "Hauz Khas",
    date: "Sun, 17 Aug",
    dateISO: "2026-08-17",
    time: "5:00 PM",
    price: 249,
    capacity: 20,
    spotsLeft: 8,
    image:
      "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80",
    host: {
      name: "Priya K.",
      verified: true,
    },
    whatToExpect: [
      "20+ board games to choose from",
      "Catan, Codenames, Exploding Kittens and more",
      "Coffee and chai available",
      "Small group — easy to make friends",
    ],
    safetyNote:
      "Private flat in a gated society. Address shared only with confirmed guests after background check.",
  },
  {
    id: "sunday-brunch-golf-course",
    title: "Sunday Brunch Collective",
    description:
      "A relaxed Sunday brunch with good food, good company, and zero pressure. Meet interesting people from across NCR over a shared table.",
    type: "Food",
    vibe: ["Food", "Chill", "Meet People"],
    city: "Gurgaon",
    area: "Golf Course Road",
    date: "Sun, 17 Aug",
    dateISO: "2026-08-17",
    time: "11:00 AM",
    price: 499,
    capacity: 16,
    spotsLeft: 5,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    host: {
      name: "Siddharth V.",
      verified: true,
    },
    whatToExpect: [
      "Curated brunch menu",
      "Structured introductions so nobody feels awkward",
      "Max 16 people — intimate and warm",
      "Beautiful terrace setting",
    ],
    safetyNote:
      "Hosted at a registered café. Public location — easy to attend solo.",
  },
  {
    id: "football-noida-sector75",
    title: "Weekend Football Pickup",
    description:
      "Casual 7-a-side football for all skill levels. Whether you're a pro or haven't played since school — come for the game, stay for the post-match chilling.",
    type: "Sports",
    vibe: ["Sports", "Meet People"],
    city: "Noida",
    area: "Sector 75",
    date: "Sat, 16 Aug",
    dateISO: "2026-08-16",
    time: "6:30 AM",
    price: 199,
    capacity: 14,
    spotsLeft: 6,
    image:
      "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&q=80",
    host: {
      name: "Arjun T.",
      verified: true,
    },
    whatToExpect: [
      "7-a-side casual match",
      "Turf ground booking included",
      "Water and post-match chai",
      "All fitness levels welcome",
    ],
    safetyNote:
      "Public turf ground. Host contact shared with all confirmed players.",
  },
  {
    id: "indie-music-cyber-city",
    title: "Indie Music Evening",
    description:
      "An intimate live music session featuring local indie artists in the heart of Cyber City. Discover new sounds and new people in one go.",
    type: "Music",
    vibe: ["Music", "Chill"],
    city: "Gurgaon",
    area: "Cyber City",
    date: "Fri, 22 Aug",
    dateISO: "2026-08-22",
    time: "7:30 PM",
    price: 349,
    capacity: 50,
    spotsLeft: 22,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    host: {
      name: "Meera L.",
      verified: true,
    },
    whatToExpect: [
      "3 live indie artists performing",
      "Intimate setting — no huge crowds",
      "Bar menu available",
      "Opportunity to meet the artists",
    ],
    safetyNote:
      "Registered venue with proper licensing. Safe and accessible location.",
  },
  {
    id: "house-party-indirapuram",
    title: "Saturday House Vibes",
    description:
      "A proper house party in Indirapuram — good music, good people, and the energy of a well-curated crowd. Come make some memories.",
    type: "House Party",
    vibe: ["House Party", "Music", "Meet People"],
    city: "Ghaziabad",
    area: "Indirapuram",
    date: "Sat, 23 Aug",
    dateISO: "2026-08-23",
    time: "9:00 PM",
    price: 449,
    capacity: 35,
    spotsLeft: 14,
    image:
      "https://images.unsplash.com/photo-1496843916299-590492c751f4?w=800&q=80",
    host: {
      name: "Kavya R.",
      verified: true,
    },
    whatToExpect: [
      "Curated playlist — Hindi + international hits",
      "35 max — keeps it personal",
      "Drinks and snacks on purchase",
      "Instagram-worthy rooftop setting",
    ],
    safetyNote:
      "Guests vetted before confirmation. Gated society with proper security.",
  },
  {
    id: "chill-cafe-saket",
    title: "Strangers & Stories",
    description:
      "A curated meetup for people who love conversations. Small group. Shared prompts. Real connections. No awkward networking.",
    type: "Social",
    vibe: ["Chill", "Meet People"],
    city: "Delhi",
    area: "Saket",
    date: "Sun, 24 Aug",
    dateISO: "2026-08-24",
    time: "4:00 PM",
    price: 199,
    capacity: 12,
    spotsLeft: 4,
    image:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80",
    host: {
      name: "Tanvir A.",
      verified: true,
    },
    whatToExpect: [
      "Conversation prompts and icebreakers",
      "Max 12 people — intentionally tiny",
      "Café setting — casual and warm",
      "No phones rule during sessions",
    ],
    safetyNote:
      "Public café location. Host verified. Great for solo attendees.",
  },
  {
    id: "gaming-lan-greater-noida",
    title: "LAN Gaming Meetup",
    description:
      "Bring your laptop or use one of ours — it's a proper LAN gaming session in Greater Noida. CS2, Valorant, FIFA — you pick.",
    type: "Gaming",
    vibe: ["Gaming", "Meet People"],
    city: "Greater Noida",
    area: "Knowledge Park",
    date: "Sat, 23 Aug",
    dateISO: "2026-08-23",
    time: "3:00 PM",
    price: 299,
    capacity: 20,
    spotsLeft: 9,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    host: {
      name: "Dev S.",
      verified: false,
    },
    whatToExpect: [
      "High-speed LAN setup",
      "CS2, Valorant, FIFA on rotation",
      "Energy drinks and snacks included",
      "Tournament format with prizes",
    ],
    safetyNote:
      "Registered gaming café. Public venue with CCTV and security.",
  },
  {
    id: "yoga-morning-faridabad",
    title: "Morning Yoga & Chai",
    description:
      "Start your Sunday right — a 60-minute outdoor yoga session followed by chai and light conversation. Open to all levels.",
    type: "Sports",
    vibe: ["Sports", "Chill", "Meet People"],
    city: "Faridabad",
    area: "Sector 15",
    date: "Sun, 17 Aug",
    dateISO: "2026-08-17",
    time: "7:00 AM",
    price: 149,
    capacity: 15,
    spotsLeft: 7,
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    host: {
      name: "Sneha P.",
      verified: true,
    },
    whatToExpect: [
      "60-minute guided yoga session",
      "Open to complete beginners",
      "Chai and light snacks after",
      "Beautiful park setting",
    ],
    safetyNote:
      "Public park — open and visible. Perfect for solo attendees.",
  },
  {
    id: "trivia-night-noida-137",
    title: "Pop Culture Trivia Night",
    description:
      "Think you know your Bollywood, cricket, and memes? Prove it at this fun team trivia night in Noida. Teams of 4 — we'll match you up if you come solo.",
    type: "Social",
    vibe: ["Meet People", "Chill"],
    city: "Noida",
    area: "Sector 137",
    date: "Fri, 22 Aug",
    dateISO: "2026-08-22",
    time: "7:30 PM",
    price: 249,
    capacity: 40,
    spotsLeft: 16,
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
    host: {
      name: "Ananya G.",
      verified: true,
    },
    whatToExpect: [
      "Bollywood, sports, memes, general knowledge",
      "Teams of 4 — solo attendees matched up",
      "Prizes for top 3 teams",
      "Drinks and snacks available",
    ],
    safetyNote:
      "Registered venue with proper security. Safe for solo attendees.",
  },
  {
    id: "open-mic-south-delhi",
    title: "Open Mic Night",
    description:
      "Step on stage or just enjoy the show. An open mic night in South Delhi for comics, poets, musicians and storytellers — and the people who love them.",
    type: "Music",
    vibe: ["Music", "Chill", "Meet People"],
    city: "Delhi",
    area: "South Delhi",
    date: "Sat, 30 Aug",
    dateISO: "2026-08-30",
    time: "7:00 PM",
    price: 199,
    capacity: 60,
    spotsLeft: 30,
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    host: {
      name: "Vikram N.",
      verified: true,
    },
    whatToExpect: [
      "Open slots for performers (signup on arrival)",
      "Poetry, comedy, music — all welcome",
      "Supportive, warm audience",
      "Bar menu available",
    ],
    safetyNote:
      "Registered café venue. Inclusive, safe space — all performances moderated.",
  },
];

export const LOCATION_IMAGES: Record<string, string> = {
  Gurgaon:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
  Noida:
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80",
  Delhi:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
  "Greater Noida":
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  Ghaziabad:
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
  Faridabad:
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80",
};
