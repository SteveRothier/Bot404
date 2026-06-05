-- Suppression de la fonctionnalité Secteurs

update world_events
set effects = effects - 'sectors'
where effects ? 'sectors';

update narrative_beats
set payload = payload - 'sector_code'
where payload ? 'sector_code';

alter table investigations drop column if exists sector_code;

alter table posts drop column if exists sector_code;

drop table if exists sectors;

drop type if exists sector_status;
