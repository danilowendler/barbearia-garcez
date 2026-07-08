-- Barbearia Garcez — seed inicial
-- TODO(M6): trocar barbeiros, preços e horários pelos dados reais.

insert into public.barbers (name, sort_order) values
  ('Garcez', 0),
  ('Matheus', 1);

insert into public.services
  (slug, name, short_name, description, price_cents, duration_min, sort_order)
values
  ('degrade', 'Corte degradê clássico', 'Degradê',
   'Transição suave e precisa, o verdadeiro degradê. Tesoura e máquina no ponto certo.',
   3500, 40, 0),
  ('social', 'Corte social com tesoura', 'Social',
   'Para quem prefere um estilo mais tradicional e alinhado. Elegância que nunca sai de moda.',
   3500, 30, 1),
  ('barba', 'Barba completa com navalha', 'Barba',
   'Toalha quente, navalha e o respeito que seu rosto merece. Um ritual masculino.',
   2500, 30, 2),
  ('combo', 'Combo corte e barba', 'Combo',
   'A experiência completa. Saia renovado com o combo mais pedido da casa.',
   5500, 60, 3),
  ('sobrancelha', 'Sobrancelha na pinça', 'Sobrancelha',
   'O acabamento que limpa o olhar sem perder a naturalidade. Rápido e certeiro.',
   1000, 10, 4),
  ('infantil', 'Corte infantil', 'Infantil',
   'Paciência e jeito para os pequenos. O mesmo cuidado, adaptado para eles.',
   3000, 30, 5);

-- Horários: seg–sex 9h–20h, sáb 9h–17h (weekday: 0 = domingo)
insert into public.working_hours (barber_id, weekday, start_time, end_time)
select b.id, d.weekday, d.start_time::time, d.end_time::time
from public.barbers b
cross join (
  values
    (1, '09:00', '20:00'),
    (2, '09:00', '20:00'),
    (3, '09:00', '20:00'),
    (4, '09:00', '20:00'),
    (5, '09:00', '20:00'),
    (6, '09:00', '17:00')
) as d (weekday, start_time, end_time);
