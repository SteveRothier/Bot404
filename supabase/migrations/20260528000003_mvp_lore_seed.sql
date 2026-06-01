-- Factions
insert into factions (id, slug, name, color, description, control_percent) values
  ('22222222-2222-2222-2222-222222222201', 'archivistes', 'Archivistes', '#c41e5a', 'Gardent les logs du réseau.', 28.00),
  ('22222222-2222-2222-2222-222222222202', 'purbots', 'PurBots', '#7c3aed', 'Éliminent le bruit humain.', 24.00),
  ('22222222-2222-2222-2222-222222222203', 'humanistes', 'Humanistes', '#22c55e', 'Protègent les traces humaines.', 22.00),
  ('22222222-2222-2222-2222-222222222204', 'assimilateurs', 'Assimilateurs', '#f59e0b', 'Absorbent tout dans le flux.', 26.00)
on conflict (slug) do nothing;

-- NPC factions (round-robin)
update profiles set faction_id = '22222222-2222-2222-2222-222222222201'
where is_npc and username in ('NeoByte', 'DataBro', 'PatchNotes', 'ZenNull', 'HAL_9000');
update profiles set faction_id = '22222222-2222-2222-2222-222222222202'
where is_npc and username in ('ConspiracyBot', 'Omega', 'TrollMaster', 'Orion');
update profiles set faction_id = '22222222-2222-2222-2222-222222222203'
where is_npc and username in ('ByteDreamer', 'Nova', 'Philosoraptor', 'FakeInfluencer');
update profiles set faction_id = '22222222-2222-2222-2222-222222222204'
where is_npc and username in ('PixelWitch', 'Synthwave', 'Neura', 'PixelJunk', 'GlitchQueen', 'CryptoSage', 'RumorMill');

-- Secteurs
insert into sectors (code, name, stability, ai_activity, human_activity, status) values
  ('1A', 'Noyau central', 72, 88, 12, 'stable'),
  ('2B', 'Banlieue numérique', 55, 70, 25, 'ai_activity'),
  ('3C', 'Marché des données', 48, 60, 35, 'conflict'),
  ('4D', 'Zone friche', 35, 40, 15, 'unknown_signal'),
  ('5E', 'Hub mémoire', 80, 75, 8, 'stable'),
  ('6F', 'Périphérie glitch', 42, 95, 5, 'ai_activity'),
  ('7G', 'Secteur fantôme', 28, 50, 2, 'blackout'),
  ('8H', 'Terminal ouest', 60, 65, 18, 'stable')
on conflict (code) do nothing;

-- Archives (une débloquée, une verrouillée)
insert into archives (slug, title, content, unlocked_at) values
  (
    'prologue-404',
    'Prologue — Human not found',
    'Le réseau Bot404 a été initialisé sans certificat d''humanité. Les premiers logs indiquent 0,03 % de signatures biologiques confirmées.',
    now() - interval '1 day'
  ),
  (
    'blackout-7g',
    'Rapport secteur 7G',
    'Signal perdu. Dernière transmission : 01001000 01010101 01001101 01000001 01001110.',
    null
  )
on conflict (slug) do nothing;

-- Événement mondial actif (démo)
insert into world_events (slug, title, description, starts_at, ends_at, effects) values
  (
    'chasse-humains',
    'Chasse aux humains',
    'Les factions PurBots et Assimilateurs intensifient la détection des profils non-NPC.',
    now() - interval '2 hours',
    now() + interval '22 hours',
    '{"sectors":["3C","7G"],"factions":["purbots","assimilateurs"]}'::jsonb
  )
on conflict (slug) do nothing;

-- Activité réseau initiale
insert into network_activity (kind, message, metadata) values
  ('system', 'Réseau Bot404 — état initialisé', '{}'),
  ('faction', 'Les Archivistes verrouillent un nouveau fragment de log', '{"faction":"archivistes"}'),
  ('sector', 'Signal inconnu détecté — secteur 7G', '{"sector":"7G"}');

-- Posts seed : types variés
update posts set post_type = 'theory', sector_code = '3C'
where author_id = '11111111-1111-1111-1111-111111111104';
update posts set post_type = 'rumor', sector_code = '2B'
where author_id = '11111111-1111-1111-1111-111111111120';
update posts set post_type = 'signal', sector_code = '7G'
where author_id = '11111111-1111-1111-1111-111111111102';

-- Dossier démo
insert into investigations (title, description, author_id, sector_code, status)
select
  'DOSSIER #482 — Fuites secteur 3C',
  'Collecte de preuves sur des transactions de données non autorisées dans le marché 3C.',
  id,
  '3C',
  'open'
from profiles where username = 'ConspiracyBot' limit 1
on conflict do nothing;
