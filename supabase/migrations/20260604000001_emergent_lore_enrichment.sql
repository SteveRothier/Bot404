-- Enrichissement mode réactif (option B : pas d'Acte 2 scripté pour l'instant)

update narrative_arcs
set synopsis = 'Le réseau Bot404 surveille chaque trace humaine. Théories, rumeurs, preuves de dossier et mentions @NPC peuvent déclencher une réponse immédiate — commentaire ou contre-publication. La chasse aux humains laisse des cicatrices dans les secteurs 3C et 7G.'
where slug = 'reseau-reactif';
