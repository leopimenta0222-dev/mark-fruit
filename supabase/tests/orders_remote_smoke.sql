-- Transactional smoke test for the linked Mark Fruit project.
-- It creates no lasting rows because every assertion runs before ROLLBACK.

begin;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"90f43083-d81a-4a27-be7b-97e73fc3bdd2","role":"authenticated"}',
  true
);

create temporary table checkout_result on commit drop as
select public.create_checkout(
  '[{"post_id":1,"quantity":1}]'::jsonb,
  'PICKUP',
  '{}'::jsonb,
  'SIMULATED_PIX',
  '11111111-1111-4111-8111-111111111111'::uuid
) as payload;

do $$
declare
  v_order_id bigint := (
    select (payload->'orderIds'->>0)::bigint from checkout_result
  );
begin
  if (select jsonb_array_length(payload->'orderIds') from checkout_result) <> 1 then
    raise exception 'checkout did not create exactly one order';
  end if;
  if (select count(*) from public.orders where id = v_order_id) <> 1 then
    raise exception 'buyer cannot read the created order';
  end if;
  if (select count(*) from public.order_items where order_id = v_order_id) <> 1 then
    raise exception 'buyer cannot read the created order item';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"eaa1a0b5-a5b5-47cb-8d81-01fc882ae91d","role":"authenticated"}',
  true
);

do $$
declare
  v_order_id bigint := (
    select (payload->'orderIds'->>0)::bigint from checkout_result
  );
begin
  if (select count(*) from public.orders where id = v_order_id) <> 1 then
    raise exception 'matching producer cannot read the order';
  end if;
  perform public.advance_order_status(v_order_id);
  if (select status from public.orders where id = v_order_id) <> 'PREPARING' then
    raise exception 'matching producer cannot advance the order';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"7871ec2a-b4ae-4ca9-aa08-77181abea2ad","role":"authenticated"}',
  true
);

do $$
declare
  v_order_id bigint := (
    select (payload->'orderIds'->>0)::bigint from checkout_result
  );
begin
  if (select count(*) from public.orders where id = v_order_id) <> 0 then
    raise exception 'unrelated consumer can read another buyer order';
  end if;
  if (select count(*) from public.order_items where order_id = v_order_id) <> 0 then
    raise exception 'unrelated consumer can read another buyer order items';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"a654053c-4a21-42b4-8c5a-c1a9b7cf9ce5","role":"authenticated"}',
  true
);

do $$
declare
  v_order_id bigint := (
    select (payload->'orderIds'->>0)::bigint from checkout_result
  );
begin
  if (select count(*) from public.orders where id = v_order_id) <> 0 then
    raise exception 'unrelated producer can read another producer order';
  end if;
  begin
    perform public.advance_order_status(v_order_id);
    raise exception 'unrelated producer advanced another producer order';
  exception
    when others then
      if sqlerrm <> 'FORBIDDEN' then
        raise;
      end if;
  end;
end;
$$;

rollback;
