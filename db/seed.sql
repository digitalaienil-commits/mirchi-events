-- Starter categories and the three launch events. Applied by `npm run db:seed` (only when there are no events yet).

insert into categories (name, slug, sort_order) values
  ('Music', 'music', 1),
  ('Festivals', 'festivals', 2),
  ('Sports', 'sports', 3),
  ('Campus', 'campus', 4),
  ('Comedy', 'comedy', 5)
on conflict (slug) do nothing;

insert into events
  (title, subtitle, category_id, start_date, end_date, date_label, venue, city,
   price_label, cta_label, external_url, is_published, is_featured, sort_order)
values
  (
    'Mirchi Freshers Season 13',
    'Pop Cam Challenge · Presented by OPPO Reno16 Series 5G',
    (select id from categories where slug = 'campus'),
    null, null, 'Voting live now',
    'A C Patil College of Engineering', 'Mumbai',
    'Free to vote', 'Vote now',
    'https://www.mirchilive.events/v/a-c-patil-college-of-engineering?contest=POP_CAM&sort=most-voted',
    true, true, 1
  ),
  (
    'SBI Green Marathon Season 7',
    'Half Marathon · 10K · 5K across 17 cities',
    (select id from categories where slug = 'sports'),
    '2026-10-11', '2027-02-28', 'Oct 2026 – Feb 2027',
    '17 cities', 'Across India',
    'Registrations open', 'Register now',
    'https://greenmarathon.in/',
    true, true, 2
  ),
  (
    'Mirchi Rock N Dhol 2026',
    '9-night Navratri garba festival · 8 PM onwards',
    (select id from categories where slug = 'festivals'),
    '2026-10-11', '2026-10-19', null,
    'Akash Aman Party Plot', 'Ahmedabad',
    '₹249 onwards', 'Book tickets',
    'https://www.district.in/events/mirchi-rock-n-dhol-2026-buy-tickets',
    true, true, 3
  );
