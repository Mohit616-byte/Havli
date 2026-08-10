-- ============================================================
-- HAVLI — Seed Data for Supabase
-- Contains approved initial events for Delhi NCR + Test Event
-- ============================================================

INSERT INTO public.events (
  id,
  title,
  description,
  event_type,
  vibe,
  city,
  area,
  date,
  start_time,
  price,
  capacity,
  spots_left,
  image_url,
  what_to_expect,
  safety_note,
  status
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'HAVLI DATABASE TEST EVENT',
  'This is a real-data test event coming directly from Supabase PostgreSQL to verify Phase 3B backend integration.',
  'Social',
  'Chill, Meet People',
  'Gurgaon',
  'Cyber City',
  '2026-08-30',
  '19:00:00',
  0,
  50,
  50,
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  'Verifying Supabase Connection
Querying real PostgreSQL database
Testing end-to-end API pipeline',
  'This is a test event for database connection verification.',
  'approved'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Rooftop Social',
  'An intimate rooftop gathering for people who want to meet new faces over great music and good vibes. Whether you''re new to Gurgaon or just looking to expand your circle — this is your spot.',
  'Social',
  'Music, Meet People',
  'Gurgaon',
  'Sector 57',
  '2026-08-16',
  '20:30:00',
  399,
  30,
  12,
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  'A curated playlist — think Bollywood Indie + global beats
30 attendees max — intentionally small and social
Snacks and drinks on purchase
Great city views from the terrace',
  'This is a verified private event. All attendees are vetted before entry.',
  'approved'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Bollywood Karaoke Night',
  'Grab the mic, belt out your favourite Bollywood classics, and make some memories with a fun crowd in Noida. No singing talent required — just good energy!',
  'Karaoke',
  'Karaoke, Music, Meet People',
  'Noida',
  'Sector 62',
  '2026-08-15',
  '19:00:00',
  299,
  40,
  18,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
  'Full Bollywood karaoke setup
Games and group activities
Friendly crowd, all backgrounds welcome
Complimentary welcome drink',
  'Hosted in a registered venue with proper security. ID verification at entry.',
  'approved'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Game Night: Board & Beyond',
  'A cozy indoor game night in South Delhi — board games, card games, and plenty of laughs. Perfect for people who love strategy and socialising in equal measure.',
  'Gaming',
  'Gaming, Chill, Meet People',
  'Delhi',
  'Hauz Khas',
  '2026-08-17',
  '17:00:00',
  249,
  20,
  8,
  'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80',
  '20+ board games to choose from
Catan, Codenames, Exploding Kittens and more
Coffee and chai available
Small group — easy to make friends',
  'Private flat in a gated society. Address shared only with confirmed guests.',
  'approved'
),
(
  '55555555-5555-5555-5555-555555555555',
  'Sunday Brunch Collective',
  'A relaxed Sunday brunch with good food, good company, and zero pressure. Meet interesting people from across NCR over a shared table.',
  'Food',
  'Food, Chill, Meet People',
  'Gurgaon',
  'Golf Course Road',
  '2026-08-17',
  '11:00:00',
  499,
  16,
  5,
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'Curated brunch menu
Structured introductions so nobody feels awkward
Max 16 people — intimate and warm
Beautiful terrace setting',
  'Hosted at a registered café. Public location — easy to attend solo.',
  'approved'
),
(
  '66666666-6666-6666-6666-666666666666',
  'Weekend Football Pickup',
  'Casual 7-a-side football for all skill levels. Whether you''re a pro or haven''t played since school — come for the game, stay for the post-match chilling.',
  'Sports',
  'Sports, Meet People',
  'Noida',
  'Sector 75',
  '2026-08-16',
  '06:30:00',
  199,
  14,
  6,
  'https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&q=80',
  '7-a-side casual match
Turf ground booking included
Water and post-match chai
All fitness levels welcome',
  'Public turf ground. Host contact shared with all confirmed players.',
  'approved'
),
(
  '77777777-7777-7777-7777-777777777777',
  'Indie Music Evening',
  'An intimate live music session featuring local indie artists in the heart of Cyber City. Discover new sounds and new people in one go.',
  'Music',
  'Music, Chill',
  'Gurgaon',
  'Cyber City',
  '2026-08-22',
  '19:30:00',
  349,
  50,
  22,
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
  '3 live indie artists performing
Intimate setting — no huge crowds
Bar menu available
Opportunity to meet the artists',
  'Registered venue with proper licensing. Safe and accessible location.',
  'approved'
),
(
  '88888888-8888-8888-8888-888888888888',
  'Saturday House Vibes',
  'A proper house party in Indirapuram — good music, good people, and the energy of a well-curated crowd. Come make some memories.',
  'House Party',
  'House Party, Music, Meet People',
  'Ghaziabad',
  'Indirapuram',
  '2026-08-23',
  '21:00:00',
  449,
  35,
  14,
  'https://images.unsplash.com/photo-1496843916299-590492c751f4?w=800&q=80',
  'Curated playlist — Hindi + international hits
35 max — keeps it personal
Drinks and snacks on purchase
Instagram-worthy rooftop setting',
  'Guests vetted before confirmation. Gated society with proper security.',
  'approved'
),
(
  '99999999-9999-9999-9999-999999999999',
  'Strangers & Stories',
  'A curated meetup for people who love conversations. Small group. Shared prompts. Real connections. No awkward networking.',
  'Social',
  'Chill, Meet People',
  'Delhi',
  'Saket',
  '2026-08-24',
  '16:00:00',
  199,
  12,
  4,
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
  'Conversation prompts and icebreakers
Max 12 people — intentionally tiny
Café setting — casual and warm
No phones rule during sessions',
  'Public café location. Host verified. Great for solo attendees.',
  'approved'
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'LAN Gaming Meetup',
  'Bring your laptop or use one of ours — it''s a proper LAN gaming session in Greater Noida. CS2, Valorant, FIFA — you pick.',
  'Gaming',
  'Gaming, Meet People',
  'Greater Noida',
  'Knowledge Park',
  '2026-08-23',
  '15:00:00',
  299,
  20,
  9,
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  'High-speed LAN setup
CS2, Valorant, FIFA on rotation
Energy drinks and snacks included
Tournament format with prizes',
  'Registered gaming café. Public venue with CCTV and security.',
  'approved'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Morning Yoga & Chai',
  'Start your Sunday right — a 60-minute outdoor yoga session followed by chai and light conversation. Open to all levels.',
  'Sports',
  'Sports, Chill, Meet People',
  'Faridabad',
  'Sector 15',
  '2026-08-17',
  '07:00:00',
  149,
  15,
  7,
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  '60-minute guided yoga session
Open to complete beginners
Chai and light snacks after
Beautiful park setting',
  'Public park — open and visible. Perfect for solo attendees.',
  'approved'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Pop Culture Trivia Night',
  'Think you know your Bollywood, cricket, and memes? Prove it at this fun team trivia night in Noida. Teams of 4 — we''ll match you up if you come solo.',
  'Social',
  'Meet People, Chill',
  'Noida',
  'Sector 137',
  '2026-08-22',
  '19:30:00',
  249,
  40,
  16,
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80',
  'Bollywood, sports, memes, general knowledge
Teams of 4 — solo attendees matched up
Prizes for top 3 teams
Drinks and snacks available',
  'Registered venue with proper security. Safe for solo attendees.',
  'approved'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Open Mic Night',
  'Step on stage or just enjoy the show. An open mic night in South Delhi for comics, poets, musicians and storytellers — and the people who love them.',
  'Music',
  'Music, Chill, Meet People',
  'Delhi',
  'South Delhi',
  '2026-08-30',
  '19:00:00',
  199,
  60,
  30,
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
  'Open slots for performers (signup on arrival)
Poetry, comedy, music — all welcome
Supportive, warm audience
Bar menu available',
  'Registered café venue. Inclusive, safe space — all performances moderated.',
  'approved'
)
ON CONFLICT (id) DO NOTHING;
