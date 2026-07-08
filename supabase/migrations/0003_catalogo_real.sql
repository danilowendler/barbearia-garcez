-- Catálogo real (WhatsApp Business da Barbearia Garcez) — M6
-- Aplicado via scripts/apply-real-catalog.mjs (DML equivalente por REST).

-- Cortes reais: todos R$ 35 / 40 min
insert into public.services
  (slug, name, short_name, description, price_cents, duration_min, sort_order)
values
  ('moicano', 'Moicano', 'Moicano',
   'Laterais zeradas e volume no topo. Atitude do começo ao fim.', 3500, 40, 0),
  ('americano', 'Americano', 'Americano',
   'O clássico americano com contornos marcados e acabamento limpo.', 3500, 40, 1),
  ('low-fade', 'Low fade', 'Low fade',
   'Degradê baixo com transição suave na altura da orelha. Discreto e alinhado.', 3500, 40, 2),
  ('low-fade-v', 'Low fade em V', 'Low fade V',
   'O low fade com desenho em V na nuca. O detalhe que faz a diferença.', 3500, 40, 3),
  ('maraca', 'Maracá', 'Maracá',
   'O corte do momento: topo texturizado e caimento natural.', 3500, 40, 4),
  ('moica', 'Moica', 'Moica',
   'A versão despojada do moicano, com transição mais suave.', 3500, 40, 5),
  ('freestyle', 'Freestyle', 'Freestyle',
   'Desenhos e riscos personalizados na navalha. Sua ideia, nosso traço.', 3500, 40, 6),
  ('dia-a-dia', 'Do dia a dia', 'Dia a dia',
   'Aquele corte certeiro pro dia a dia, sempre no ponto.', 3500, 40, 7)
on conflict (slug) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  duration_min = excluded.duration_min,
  sort_order = excluded.sort_order,
  active = true;

-- Desativa o seed antigo (não deleta: appointments antigos referenciam)
update public.services
set active = false
where slug in ('degrade', 'social', 'barba', 'combo', 'sobrancelha', 'infantil');

-- Horários oficiais (0 = domingo): seg 13–19, ter–qui 9–20, sex 9–22, sáb 9–15
delete from public.working_hours;
insert into public.working_hours (barber_id, weekday, start_time, end_time)
select b.id, d.weekday, d.start_time::time, d.end_time::time
from public.barbers b
cross join (
  values
    (1, '13:00', '19:00'),
    (2, '09:00', '20:00'),
    (3, '09:00', '20:00'),
    (4, '09:00', '20:00'),
    (5, '09:00', '22:00'),
    (6, '09:00', '15:00')
) as d (weekday, start_time, end_time);
