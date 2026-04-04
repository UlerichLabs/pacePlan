-- Seed: 001_lucas_plan
-- Plano real do Lucas — Meia Maratona Novembro 2026

INSERT INTO macrocycles (name, goal_distance, race_date, start_date, is_active)
VALUES ('Meia Maratona — Novembro 2026', 21, '2026-11-30', '2026-04-07', TRUE);

INSERT INTO phases (macrocycle_id, name, objective, start_date, end_date, order_index, long_run_target, weekly_volume_target)
SELECT id, 'Fase 1 — Construção de Base',
  'Consolidar 10 km de forma confortável e adaptar o corpo ao volume semanal',
  '2026-04-07', '2026-06-30', 1, 10, 18
FROM macrocycles WHERE is_active = TRUE;

INSERT INTO phases (macrocycle_id, name, objective, start_date, end_date, order_index, long_run_target, weekly_volume_target)
SELECT id, 'Fase 2 — Expansão de Volume',
  'Passar a barreira dos 10 km e adaptar as articulações para mais de 1h30 em movimento',
  '2026-07-01', '2026-08-31', 2, 15, 30
FROM macrocycles WHERE is_active = TRUE;

INSERT INTO phases (macrocycle_id, name, objective, start_date, end_date, order_index, long_run_target, weekly_volume_target)
SELECT id, 'Fase 3 — Especificidade',
  'Chegar muito próximo da distância da prova com controle de pace',
  '2026-09-01', '2026-10-31', 3, 19, 40
FROM macrocycles WHERE is_active = TRUE;

INSERT INTO phases (macrocycle_id, name, objective, start_date, end_date, order_index, long_run_target, weekly_volume_target)
SELECT id, 'Fase 4 — Polimento (Taper)',
  'Descansar o corpo. O trabalho duro já foi feito.',
  '2026-11-01', '2026-11-30', 4, 8, 12
FROM macrocycles WHERE is_active = TRUE;
