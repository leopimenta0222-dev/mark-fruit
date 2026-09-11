-- Replaces the checkout function so PostgreSQL locks the posts alias.

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
  v_buyer          uuid := auth.uid();
  v_producer       uuid;
  v_order_id       bigint;
  v_order_ids      jsonb := '[]'::jsonb;
  v_input_count    integer;
  v_distinct_count integer;
  v_found_count    integer;
  v_subtotal       numeric(10,2);
begin
  if v_buyer is null then raise exception 'AUTH_REQUIRED'; end if;
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
  if submission_token is null then raise exception 'MISSING_SUBMISSION_TOKEN'; end if;

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

  if v_input_count <> v_distinct_count then raise exception 'DUPLICATE_ITEM'; end if;
  if exists (
    select 1
    from jsonb_to_recordset(checkout_items)
      as input(post_id bigint, quantity integer)
    where input.post_id is null or input.quantity is null or input.quantity <= 0
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
  if v_found_count <> v_input_count then raise exception 'PRODUCT_NOT_FOUND'; end if;

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
      buyer_id, producer_id, fulfillment_method, delivery_address,
      subtotal, total, payment_method, checkout_token
    ) values (
      v_buyer, v_producer, fulfillment_method,
      case when fulfillment_method = 'DELIVERY' then delivery_address else '{}'::jsonb end,
      v_subtotal, v_subtotal, payment_method, submission_token
    ) returning id into v_order_id;

    insert into public.order_items (
      order_id, post_id, title, unit_price, quantity, subtotal
    )
    select
      v_order_id, public.posts.id, public.posts.title, public.posts.price,
      input.quantity, public.posts.price * input.quantity
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

revoke execute on function public.create_checkout(jsonb, text, jsonb, text, uuid)
  from public, anon;
grant execute on function public.create_checkout(jsonb, text, jsonb, text, uuid)
  to authenticated;
