-- Pedidos e checkout simulado do Mark Fruit.
-- O frontend nunca informa preços, totais ou produtor ao banco.

create table public.orders (
  id                 bigint generated always as identity primary key,
  buyer_id           uuid not null references public.profiles(id),
  producer_id        uuid not null references public.profiles(id),
  status             text not null default 'RECEIVED'
    check (status in ('RECEIVED', 'PREPARING', 'READY_OR_SHIPPED', 'COMPLETED')),
  fulfillment_method text not null
    check (fulfillment_method in ('DELIVERY', 'PICKUP')),
  delivery_address   jsonb not null default '{}'::jsonb,
  subtotal           numeric(10,2) not null check (subtotal >= 0),
  total              numeric(10,2) not null check (total >= 0),
  payment_method     text not null
    check (payment_method in ('SIMULATED_PIX', 'SIMULATED_CARD')),
  payment_status     text not null default 'SIMULATED_APPROVED'
    check (payment_status = 'SIMULATED_APPROVED'),
  checkout_token     uuid not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (buyer_id, producer_id, checkout_token)
);

create table public.order_items (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references public.orders(id) on delete cascade,
  post_id    bigint references public.posts(id) on delete set null,
  title      text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity   integer not null check (quantity > 0),
  subtotal   numeric(10,2) not null check (subtotal >= 0)
);

create index orders_buyer_idx on public.orders(buyer_id);
create index orders_producer_idx on public.orders(producer_id);
create index orders_created_idx on public.orders(created_at desc);
create index order_items_order_idx on public.order_items(order_id);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders, public.order_items from anon, authenticated;
grant select on table public.orders, public.order_items to authenticated;

create policy "orders_select_participant" on public.orders
  for select to authenticated
  using (
    (select auth.uid()) = buyer_id
    or (select auth.uid()) = producer_id
  );

create policy "order_items_select_participant" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.orders
      where public.orders.id = order_items.order_id
        and (
          (select auth.uid()) = public.orders.buyer_id
          or (select auth.uid()) = public.orders.producer_id
        )
    )
  );

create or replace function public.create_checkout(
  checkout_items jsonb,
  fulfillment_method text,
  delivery_address jsonb,
  payment_method text,
  submission_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer         uuid := auth.uid();
  v_producer      uuid;
  v_order_id      bigint;
  v_order_ids     jsonb := '[]'::jsonb;
  v_input_count   integer;
  v_distinct_count integer;
  v_found_count   integer;
  v_subtotal      numeric(10,2);
begin
  if v_buyer is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if checkout_items is null
     or jsonb_typeof(checkout_items) <> 'array'
     or jsonb_array_length(checkout_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  if fulfillment_method not in ('DELIVERY', 'PICKUP') then
    raise exception 'INVALID_FULFILLMENT';
  end if;

  if payment_method not in ('SIMULATED_PIX', 'SIMULATED_CARD') then
    raise exception 'INVALID_PAYMENT';
  end if;

  if submission_token is null then
    raise exception 'MISSING_SUBMISSION_TOKEN';
  end if;

  delivery_address := coalesce(delivery_address, '{}'::jsonb);
  if fulfillment_method = 'DELIVERY' and (
    nullif(trim(delivery_address->>'street'), '') is null
    or nullif(trim(delivery_address->>'number'), '') is null
    or nullif(trim(delivery_address->>'city'), '') is null
    or nullif(trim(delivery_address->>'state'), '') is null
  ) then
    raise exception 'INVALID_ADDRESS';
  end if;

  select count(*), count(distinct input.post_id)
    into v_input_count, v_distinct_count
  from jsonb_to_recordset(checkout_items)
    as input(post_id bigint, quantity integer);

  if v_input_count <> v_distinct_count then
    raise exception 'DUPLICATE_ITEM';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
    where input.post_id is null
       or input.quantity is null
       or input.quantity <= 0
  ) then
    raise exception 'INVALID_QUANTITY';
  end if;

  if exists (
    select 1 from public.orders
    where public.orders.buyer_id = v_buyer
      and public.orders.checkout_token = submission_token
  ) then
    select coalesce(jsonb_agg(public.orders.id order by public.orders.id), '[]'::jsonb)
      into v_order_ids
    from public.orders
    where public.orders.buyer_id = v_buyer
      and public.orders.checkout_token = submission_token;
    return jsonb_build_object('orderIds', v_order_ids);
  end if;

  perform 1
  from public.posts as locked_post
  join jsonb_to_recordset(checkout_items)
    as input(post_id bigint, quantity integer)
    on input.post_id = locked_post.id
  for update of locked_post;

  select count(*) into v_found_count
  from public.posts
  join jsonb_to_recordset(checkout_items)
    as input(post_id bigint, quantity integer)
    on input.post_id = public.posts.id;

  if v_found_count <> v_input_count then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  if exists (
    select 1
    from public.posts
    join jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
      on input.post_id = public.posts.id
    where public.posts.stock < input.quantity
  ) then
    raise exception 'INSUFFICIENT_STOCK';
  end if;

  if exists (
    select 1
    from public.posts
    join jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
      on input.post_id = public.posts.id
    where public.posts.author_id = v_buyer
  ) then
    raise exception 'OWN_PRODUCT';
  end if;

  for v_producer in
    select distinct public.posts.author_id
    from public.posts
    join jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
      on input.post_id = public.posts.id
  loop
    select sum(public.posts.price * input.quantity)
      into v_subtotal
    from public.posts
    join jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
      on input.post_id = public.posts.id
    where public.posts.author_id = v_producer;

    insert into public.orders (
      buyer_id,
      producer_id,
      fulfillment_method,
      delivery_address,
      subtotal,
      total,
      payment_method,
      checkout_token
    ) values (
      v_buyer,
      v_producer,
      fulfillment_method,
      case
        when fulfillment_method = 'DELIVERY' then delivery_address
        else '{}'::jsonb
      end,
      v_subtotal,
      v_subtotal,
      payment_method,
      submission_token
    )
    returning id into v_order_id;

    insert into public.order_items (
      order_id,
      post_id,
      title,
      unit_price,
      quantity,
      subtotal
    )
    select
      v_order_id,
      public.posts.id,
      public.posts.title,
      public.posts.price,
      input.quantity,
      public.posts.price * input.quantity
    from public.posts
    join jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
      on input.post_id = public.posts.id
    where public.posts.author_id = v_producer;

    update public.posts
    set stock = public.posts.stock - input.quantity
    from jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
    where public.posts.id = input.post_id
      and public.posts.author_id = v_producer;

    v_order_ids := v_order_ids || jsonb_build_array(v_order_id);
  end loop;

  return jsonb_build_object('orderIds', v_order_ids);
end;
$$;

create or replace function public.advance_order_status(target_order_id bigint)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_next  text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_order
  from public.orders
  where public.orders.id = target_order_id
  for update;

  if v_order.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_order.producer_id <> auth.uid() then
    raise exception 'FORBIDDEN';
  end if;

  v_next := case v_order.status
    when 'RECEIVED' then 'PREPARING'
    when 'PREPARING' then 'READY_OR_SHIPPED'
    when 'READY_OR_SHIPPED' then 'COMPLETED'
    else null
  end;

  if v_next is null then
    raise exception 'ORDER_ALREADY_COMPLETED';
  end if;

  update public.orders
  set status = v_next,
      updated_at = now()
  where public.orders.id = target_order_id
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.create_checkout(jsonb, text, jsonb, text, uuid)
  from public, anon;
grant execute on function public.create_checkout(jsonb, text, jsonb, text, uuid)
  to authenticated;

revoke execute on function public.advance_order_status(bigint)
  from public, anon;
grant execute on function public.advance_order_status(bigint)
  to authenticated;
