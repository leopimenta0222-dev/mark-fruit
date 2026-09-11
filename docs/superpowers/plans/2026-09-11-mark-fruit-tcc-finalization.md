# Mark Fruit TCC Finalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar em até quatro dias todas as telas do Mark Fruit prontas para prints em tablet e, em até vinte dias, um fluxo estável de compra simulada e pedidos conectado ao Supabase.

**Architecture:** O frontend React ganhará um `CartContext` persistido em `localStorage`, serviços isolados para checkout/pedidos e seis rotas de compra. O Supabase receberá `orders`, `order_items` e uma RPC transacional que valida o usuário, usa preços do banco, separa pedidos por produtor e reduz o estoque sem expor privilégios no navegador.

**Tech Stack:** React 18, Vite 5, React Router 6, Tailwind CSS 3, Supabase JS 2, PostgreSQL/RLS, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-11-mark-fruit-tcc-finalization-design.md`

## Global Constraints

- O alvo prioritário é tablet nas orientações horizontal e vertical; desktop e celular devem continuar funcionais.
- O pagamento é uma simulação acadêmica e nunca pode sugerir cobrança real.
- Um carrinho com vários produtores gera um pedido separado para cada produtor.
- Nenhuma chave `service_role` ou secret key pode entrar no frontend.
- RLS e `GRANT` explícitos devem proteger todas as novas tabelas expostas.
- A interface deve usar linguagem verdadeira: remover descontos inventados e garantias não comprovadas.
- A direção visual é “feira local contemporânea” com a paleta definida na especificação.
- Cada tela deve cobrir carregamento, vazio, erro, sucesso e estado desabilitado quando aplicável.
- Não criar funções extras fora do escopo antes de concluir os prints e o fluxo principal.

---

## File Map

### Database

- Create via Supabase CLI (exact path produced in Task 2 Step 1): migration `orders_checkout` with tables, grants, RLS, indexes and transactional RPCs.
- Create `supabase/tests/orders_rls.test.sql`: permissões de consumidor, produtor e terceiro.
- Modify `supabase/schema.sql`: manter a fonte de verdade reproduzível.
- Modify `supabase/seed.mjs`: pedidos demonstrativos coerentes com os usuários existentes.

### Cart and orders domain

- Create `frontend/src/context/CartContext.jsx`: estado, persistência e comandos do carrinho.
- Create `frontend/src/context/cartReducer.js`: regras puras de quantidade e totais.
- Create `frontend/src/context/cartReducer.test.js`: testes do domínio do carrinho.
- Create `frontend/src/services/orders.js`: RPC de checkout e consultas de pedidos.
- Create `frontend/src/services/orders.test.js`: mapeamento e tratamento de erros.
- Create `frontend/src/utils/format.js`: moeda, data e rótulos de status.
- Create `frontend/src/utils/format.test.js`: testes de apresentação.

### UI

- Create `frontend/src/components/OrderStatus.jsx`: status textual e acessível.
- Create `frontend/src/components/OrderCard.jsx`: resumo reutilizável de pedido.
- Create `frontend/src/pages/Cart.jsx`: carrinho vazio/preenchido.
- Create `frontend/src/pages/Checkout.jsx`: entrega e pagamento simulado.
- Create `frontend/src/pages/OrderConfirmation.jsx`: confirmação e números dos pedidos.
- Create `frontend/src/pages/Orders.jsx`: pedidos do consumidor.
- Create `frontend/src/pages/OrderDetail.jsx`: itens e linha de status.
- Create `frontend/src/pages/ReceivedOrders.jsx`: fila do produtor e avanço de status.
- Modify `frontend/src/main.jsx`: instalar `CartProvider`.
- Modify `frontend/src/App.jsx`: registrar rotas e carregar páginas sob demanda.
- Modify `frontend/src/components/Navbar.jsx`: navegação por toque, carrinho e pedidos.
- Modify `frontend/src/pages/PostDetail.jsx`: adicionar ao carrinho/comprar agora.
- Modify `frontend/src/components/PostCard.jsx`: remover promoções inventadas.
- Modify `frontend/src/pages/Home.jsx`: nova abertura e prateleiras responsivas.
- Modify `frontend/src/index.css` and `frontend/tailwind.config.js`: tokens, foco, tipografia e movimento reduzido.
- Refine all files in `frontend/src/pages/`: consistência visual e tablet.

### Test and evidence

- Modify `frontend/package.json`: scripts e dependências de teste fixadas.
- Create `frontend/src/test/setup.js`: matchers e limpeza dos testes.
- Create `frontend/src/pages/*.test.jsx` for the critical purchase and order screens.
- Create `docs/tcc/roteiro-demonstracao.md`: contas, dados, sequência e plano de contingência.
- Create `docs/tcc/checklist-prints.md`: lista verificável de todas as telas e estados.
- Create `docs/tcc/prints/`: capturas finais em PNG.

---

### Task 1: Test Harness and Shared Formatting

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/test/setup.js`
- Create: `frontend/src/utils/format.js`
- Test: `frontend/src/utils/format.test.js`

**Interfaces:**
- Produces: `formatCurrency(number): string`, `formatDate(string): string`, `ORDER_STATUS: Record<string, {label, next}>`.

- [ ] **Step 1: Install the pinned test tools and add scripts**

Run:

```powershell
cd frontend
npm install --save-dev --save-exact vitest@2.1.9 jsdom@25.0.1 @testing-library/react@16.1.0 @testing-library/jest-dom@6.6.3 @testing-library/user-event@14.5.2
```

Set these scripts in `frontend/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 2: Configure Vitest in `frontend/vite.config.js`**

```js
test: {
  environment: "jsdom",
  setupFiles: "./src/test/setup.js",
  clearMocks: true,
}
```

- [ ] **Step 3: Add the shared test setup**

```js
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 4: Write failing formatter tests**

```js
import { describe, expect, it } from "vitest";
import { formatCurrency, ORDER_STATUS } from "./format.js";

describe("formatCurrency", () => {
  it("formats Brazilian reais", () => {
    expect(formatCurrency(12.5)).toContain("12,50");
  });
});

it("defines the complete order sequence", () => {
  expect(ORDER_STATUS.RECEIVED.next).toBe("PREPARING");
  expect(ORDER_STATUS.COMPLETED.next).toBeNull();
});
```

- [ ] **Step 5: Run the test and confirm failure**

Run: `npm test -- src/utils/format.test.js`  
Expected: FAIL because `format.js` does not exist.

- [ ] **Step 6: Implement the shared formatters**

```js
export const ORDER_STATUS = {
  RECEIVED: { label: "Pedido recebido", next: "PREPARING" },
  PREPARING: { label: "Em preparação", next: "READY_OR_SHIPPED" },
  READY_OR_SHIPPED: { label: "Pronto ou enviado", next: "COMPLETED" },
  COMPLETED: { label: "Concluído", next: null },
};

export const formatCurrency = (value) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (value) =>
  new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
```

- [ ] **Step 7: Verify and commit**

Run: `npm test -- src/utils/format.test.js && npm run build`  
Expected: PASS and production build succeeds.

```powershell
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/src/test frontend/src/utils
git commit -m "test: configura testes do frontend"
```

---

### Task 2: Secure Order Schema and Atomic Checkout RPC

**Files:**
- Create: `supabase/migrations/<generated>_orders_checkout.sql`
- Modify: `supabase/schema.sql`
- Test: `supabase/tests/orders_rls.test.sql`

**Interfaces:**
- Produces tables: `public.orders`, `public.order_items`.
- Produces RPC: `public.create_checkout(checkout_items jsonb, fulfillment_method text, delivery_address jsonb, payment_method text, submission_token uuid) returns jsonb`.
- Produces RPC: `public.advance_order_status(order_id bigint) returns public.orders`.

- [ ] **Step 1: Discover the installed Supabase CLI and create the migration**

Run:

```powershell
npx supabase --version
npx supabase migration new orders_checkout
```

Expected: a timestamped SQL file appears under `supabase/migrations/`. Use that exact generated path in all later commands.

- [ ] **Step 2: Write the RLS assertions first**

Create pgTAP cases that authenticate as a consumer, the matching producer and an unrelated user, then assert:

```sql
select lives_ok($$ select * from public.orders where buyer_id = auth.uid() $$,
  'consumer can query own orders');
select is_empty($$ select * from public.orders where buyer_id <> auth.uid() $$,
  'consumer cannot query another consumer orders');
select throws_ok($$ update public.orders set status = 'COMPLETED' $$, '42501', null,
  'consumer cannot update order status');
```

Include equivalent allow/deny assertions for the matching producer and a producer unrelated to the order. Wrap fixtures in `begin; ... rollback;`.

- [ ] **Step 3: Run database tests and confirm failure**

Run: `npx supabase test db`  
Expected: FAIL because the order tables and policies do not exist.

- [ ] **Step 4: Implement tables, grants and policies in the generated migration**

Use these exact constraints:

```sql
create table public.orders (
  id bigint generated always as identity primary key,
  buyer_id uuid not null references public.profiles(id),
  producer_id uuid not null references public.profiles(id),
  status text not null default 'RECEIVED'
    check (status in ('RECEIVED','PREPARING','READY_OR_SHIPPED','COMPLETED')),
  fulfillment_method text not null
    check (fulfillment_method in ('DELIVERY','PICKUP')),
  delivery_address jsonb not null default '{}'::jsonb,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  total numeric(10,2) not null check (total >= 0),
  payment_method text not null
    check (payment_method in ('SIMULATED_PIX','SIMULATED_CARD')),
  payment_status text not null default 'SIMULATED_APPROVED'
    check (payment_status = 'SIMULATED_APPROVED'),
  checkout_token uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id, producer_id, checkout_token)
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  post_id bigint references public.posts(id) on delete set null,
  title text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;
```

Create these read policies; direct inserts, updates and deletes remain unavailable to browser roles:

```sql
create policy "orders_select_participant" on public.orders
  for select to authenticated
  using ((select auth.uid()) = buyer_id or (select auth.uid()) = producer_id);

create policy "order_items_select_participant" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and ((select auth.uid()) = o.buyer_id or (select auth.uid()) = o.producer_id)
  ));
```

- [ ] **Step 5: Implement the atomic checkout RPC**

Implement `public.create_checkout` as `security definer set search_path = ''`. Its transaction body must follow this structure:

1. reject `auth.uid() is null`;
2. reject an empty array, non-positive quantities and unsupported methods;
3. select each `public.posts` row `for update`;
4. use price, title and producer from the database, never from client totals;
5. reject own products and insufficient stock;
6. group items by `author_id`, insert one `public.orders` row per producer and its snapshots in `public.order_items`;
7. decrement `public.posts.stock` inside the same transaction;
8. return `jsonb_build_object('orderIds', ...)`;
9. return the existing order IDs for the same buyer and `submission_token`, making retries idempotent.

```sql
create or replace function public.create_checkout(
  checkout_items jsonb,
  fulfillment_method text,
  delivery_address jsonb,
  payment_method text,
  submission_token uuid
) returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_buyer uuid := auth.uid();
  v_producer uuid;
  v_order_id bigint;
  v_order_ids jsonb := '[]'::jsonb;
  v_input_count integer;
  v_distinct_count integer;
  v_subtotal numeric(10,2);
begin
  if v_buyer is null then raise exception 'AUTH_REQUIRED'; end if;
  if checkout_items is null or jsonb_typeof(checkout_items) <> 'array'
     or jsonb_array_length(checkout_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if fulfillment_method not in ('DELIVERY','PICKUP') then raise exception 'INVALID_FULFILLMENT'; end if;
  if payment_method not in ('SIMULATED_PIX','SIMULATED_CARD') then raise exception 'INVALID_PAYMENT'; end if;
  if submission_token is null then raise exception 'MISSING_SUBMISSION_TOKEN'; end if;
  if fulfillment_method = 'DELIVERY' and (
    nullif(trim(delivery_address->>'street'), '') is null or
    nullif(trim(delivery_address->>'number'), '') is null or
    nullif(trim(delivery_address->>'city'), '') is null or
    nullif(trim(delivery_address->>'state'), '') is null
  ) then raise exception 'INVALID_ADDRESS'; end if;

  select count(*), count(distinct x.post_id)
    into v_input_count, v_distinct_count
  from jsonb_to_recordset(checkout_items) as x(post_id bigint, quantity integer);
  if v_input_count <> v_distinct_count then raise exception 'DUPLICATE_ITEM'; end if;
  if exists (
    select 1 from jsonb_to_recordset(checkout_items) x(post_id bigint, quantity integer)
    where x.post_id is null or x.quantity is null or x.quantity <= 0
  ) then raise exception 'INVALID_QUANTITY'; end if;

  if exists (select 1 from public.orders where buyer_id = v_buyer and checkout_token = submission_token) then
    select jsonb_build_object('orderIds', jsonb_agg(id order by id)) into v_order_ids
    from public.orders where buyer_id = v_buyer and checkout_token = submission_token;
    return v_order_ids;
  end if;

  perform 1
  from public.posts p
  join jsonb_to_recordset(checkout_items) x(post_id bigint, quantity integer) on x.post_id = p.id
  for update of p;

  if (select count(*) from public.posts p join jsonb_to_recordset(checkout_items)
      x(post_id bigint, quantity integer) on x.post_id = p.id) <> v_input_count
  then raise exception 'PRODUCT_NOT_FOUND'; end if;
  if exists (select 1 from public.posts p join jsonb_to_recordset(checkout_items)
      x(post_id bigint, quantity integer) on x.post_id = p.id
      where p.stock < x.quantity) then raise exception 'INSUFFICIENT_STOCK'; end if;
  if exists (select 1 from public.posts p join jsonb_to_recordset(checkout_items)
      x(post_id bigint, quantity integer) on x.post_id = p.id
      where p.author_id = v_buyer) then raise exception 'OWN_PRODUCT'; end if;

  for v_producer in
    select distinct p.author_id from public.posts p
    join jsonb_to_recordset(checkout_items) x(post_id bigint, quantity integer) on x.post_id = p.id
  loop
    select sum(p.price * x.quantity) into v_subtotal
    from public.posts p
    join jsonb_to_recordset(checkout_items) x(post_id bigint, quantity integer) on x.post_id = p.id
    where p.author_id = v_producer;

    insert into public.orders (
      buyer_id, producer_id, fulfillment_method, delivery_address,
      subtotal, total, payment_method, checkout_token
    ) values (
      v_buyer, v_producer, fulfillment_method,
      case when fulfillment_method = 'DELIVERY' then delivery_address else '{}'::jsonb end,
      v_subtotal, v_subtotal, payment_method, submission_token
    ) returning id into v_order_id;

    insert into public.order_items (order_id, post_id, title, unit_price, quantity, subtotal)
    select v_order_id, p.id, p.title, p.price, x.quantity, p.price * x.quantity
    from public.posts p
    join jsonb_to_recordset(checkout_items) x(post_id bigint, quantity integer) on x.post_id = p.id
    where p.author_id = v_producer;

    update public.posts p set stock = p.stock - x.quantity
    from jsonb_to_recordset(checkout_items) x(post_id bigint, quantity integer)
    where p.id = x.post_id and p.author_id = v_producer;

    v_order_ids := v_order_ids || jsonb_build_array(v_order_id);
  end loop;

  return jsonb_build_object('orderIds', v_order_ids);
end;
$$;
```

Protect it explicitly:

```sql
revoke execute on function public.create_checkout(jsonb,text,jsonb,text,uuid) from public, anon;
grant execute on function public.create_checkout(jsonb,text,jsonb,text,uuid) to authenticated;
```

Implement `advance_order_status` with the same security settings:

```sql
create or replace function public.advance_order_status(target_order_id bigint)
returns public.orders
language plpgsql
security definer set search_path = ''
as $$
declare
  v_order public.orders;
  v_next text;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_order from public.orders where id = target_order_id for update;
  if v_order.id is null then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.producer_id <> auth.uid() then raise exception 'FORBIDDEN'; end if;
  v_next := case v_order.status
    when 'RECEIVED' then 'PREPARING'
    when 'PREPARING' then 'READY_OR_SHIPPED'
    when 'READY_OR_SHIPPED' then 'COMPLETED'
    else null
  end;
  if v_next is null then raise exception 'ORDER_ALREADY_COMPLETED'; end if;
  update public.orders set status = v_next, updated_at = now()
    where id = target_order_id returning * into v_order;
  return v_order;
end;
$$;

revoke execute on function public.advance_order_status(bigint) from public, anon;
grant execute on function public.advance_order_status(bigint) to authenticated;
```

- [ ] **Step 6: Keep the reproducible schema in sync**

Copy the finalized table, index, trigger, policy, grant and function definitions into `supabase/schema.sql`. Replace existing `auth.role()` storage checks with policies scoped `to authenticated` and ownership based on the first path segment:

```sql
using (bucket_id = 'post-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
```

- [ ] **Step 7: Apply and verify**

Apply the migration to the linked project with the command reported by `npx supabase db push --help`; do not guess flags. If the project is not linked, run the migration SQL once in the Supabase SQL Editor.

Run: `npx supabase test db` and `npx supabase db advisors` if supported by the installed CLI.  
Expected: pgTAP passes, no exposed-table/RLS warnings, and both RPCs are callable only by `authenticated`.

- [ ] **Step 8: Commit**

```powershell
git add supabase/migrations supabase/tests supabase/schema.sql
git commit -m "feat: adiciona pedidos e checkout seguro"
```

---

### Task 3: Cart Domain and Persistence

**Files:**
- Create: `frontend/src/context/cartReducer.js`
- Create: `frontend/src/context/CartContext.jsx`
- Test: `frontend/src/context/cartReducer.test.js`
- Modify: `frontend/src/main.jsx`

**Interfaces:**
- Consumes product shape: `{id,title,price,image,stock,authorId,author}`.
- Produces hook: `useCart()` returning `{items,itemCount,subtotal,addItem,setQuantity,removeItem,clearCart}`.

- [ ] **Step 1: Write reducer tests**

```js
it("merges the same product without exceeding stock", () => {
  const product = { id: 7, price: 4, stock: 3 };
  const once = cartReducer([], { type: "ADD", product, quantity: 2 });
  const twice = cartReducer(once, { type: "ADD", product, quantity: 2 });
  expect(twice).toEqual([{ ...product, quantity: 3 }]);
});

it("removes zero quantities", () => {
  expect(cartReducer([{ id: 7, quantity: 1 }], {
    type: "SET_QUANTITY", id: 7, quantity: 0,
  })).toEqual([]);
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/context/cartReducer.test.js`  
Expected: FAIL because the reducer is missing.

- [ ] **Step 3: Implement pure cart rules**

Export `cartReducer`, `cartItemCount(items)` and `cartSubtotal(items)`. Clamp quantity between zero and the current product stock and normalize IDs with `String(id)` when comparing.

- [ ] **Step 4: Implement `CartProvider`**

Use storage key `mark-fruit:cart:v1`. Parse in a guarded initializer, discard malformed arrays and write after each state change. Memoize totals and commands. Do not store auth/session information.

- [ ] **Step 5: Install the provider**

Wrap `<App />` with `<CartProvider>` inside `<AuthProvider>` in `frontend/src/main.jsx`.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/context/cartReducer.test.js && npm run build`  
Expected: PASS.

```powershell
git add frontend/src/context frontend/src/main.jsx
git commit -m "feat: adiciona carrinho persistente"
```

---

### Task 4: Orders Client Service

**Files:**
- Create: `frontend/src/services/orders.js`
- Test: `frontend/src/services/orders.test.js`

**Interfaces:**
- Consumes RPC names from Task 2.
- Produces `createCheckout({items,fulfillmentMethod,address,paymentMethod,submissionToken}): Promise<number[]>`.
- Produces `listBuyerOrders(userId): Promise<Order[]>`.
- Produces `listProducerOrders(userId): Promise<Order[]>`.
- Produces `getOrder(id): Promise<Order>` and `advanceOrderStatus(id): Promise<Order>`.

- [ ] **Step 1: Write mocked Supabase tests**

Cover payload conversion and error propagation:

```js
it("sends only post id and quantity to checkout", async () => {
  rpc.mockResolvedValue({ data: { orderIds: [12] }, error: null });
  await createCheckout({
    items: [{ id: 9, title: "Ignored", price: 1, quantity: 2 }],
    fulfillmentMethod: "PICKUP", address: {}, paymentMethod: "SIMULATED_PIX",
    submissionToken: "00000000-0000-4000-8000-000000000001",
  });
  expect(rpc).toHaveBeenCalledWith("create_checkout", expect.objectContaining({
    checkout_items: [{ post_id: 9, quantity: 2 }],
    submission_token: "00000000-0000-4000-8000-000000000001",
  }));
});
```

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/services/orders.test.js`  
Expected: FAIL because the service does not exist.

- [ ] **Step 3: Implement queries and a single mapper**

Select orders with `items:order_items(*)`, `buyer:profiles!orders_buyer_id_fkey(...)` and `producer:profiles!orders_producer_id_fkey(...)`. Map snake_case once in `mapOrder(row)`; all exported functions return camelCase values.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- src/services/orders.test.js`  
Expected: PASS.

```powershell
git add frontend/src/services/orders.js frontend/src/services/orders.test.js
git commit -m "feat: adiciona servico de pedidos"
```

---

### Task 5: Routes, Tablet Navigation and Cart Entry Points

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/components/Navbar.jsx`
- Test: `frontend/src/components/Navbar.test.jsx`

**Interfaces:**
- Consumes `useCart().itemCount` and `useAuth().user.role`.
- Produces routes `/carrinho`, `/checkout`, `/pedido-confirmado`, `/pedidos`, `/pedidos/:id`, `/pedidos-recebidos`.

- [ ] **Step 1: Write navigation tests**

Test at tablet width that the cart link remains visible, exposes `aria-label="Carrinho com 2 itens"`, and a producer sees “Pedidos recebidos” while a consumer sees “Meus pedidos”.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/components/Navbar.test.jsx`  
Expected: FAIL because the actions and routes do not exist.

- [ ] **Step 3: Register lazy routes with route guards**

Use `React.lazy` for page-level code splitting and a simple accessible loading fallback. Protect checkout/order pages with `PrivateRoute`; protect received orders with `producerOnly`.

- [ ] **Step 4: Refactor navigation for touch**

Keep search visible at `md`, expose cart as an icon plus badge, and replace the hover-only profile dropdown with a click-controlled button using `aria-expanded`. Add a compact bottom action row below `md` for Home, Search, Cart, Orders and Profile.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/components/Navbar.test.jsx && npm run build`  
Expected: PASS and a smaller initial bundle than the current 576.71 kB asset.

```powershell
git add frontend/src/App.jsx frontend/src/components/Navbar.jsx frontend/src/components/Navbar.test.jsx
git commit -m "feat: adapta navegacao para compras e tablet"
```

---

### Task 6: Product Detail Purchase Actions and Honest Commerce Copy

**Files:**
- Modify: `frontend/src/pages/PostDetail.jsx`
- Modify: `frontend/src/components/PostCard.jsx`
- Modify: `frontend/src/pages/Home.jsx`
- Test: `frontend/src/pages/PostDetail.test.jsx`

**Interfaces:**
- Consumes `useCart().addItem(product, quantity)`.
- Produces working “Adicionar ao carrinho” and “Comprar agora” actions.

- [ ] **Step 1: Write interaction tests**

Test that “Adicionar ao carrinho” adds the selected quantity and announces success, while “Comprar agora” adds the item and navigates to `/checkout`. Test that stock zero disables both buttons.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/pages/PostDetail.test.jsx`  
Expected: FAIL because `handleBuy` still shows placeholder copy.

- [ ] **Step 3: Replace placeholders with cart actions**

Remove `buyMsg` timers. Add a persistent, accessible success message with `role="status"`. If unauthenticated, preserve the intended URL in router state and go to `/login` before checkout.

- [ ] **Step 4: Remove unsupported commercial claims**

Delete pseudo-random discounts, installment claims, purchase protection, automatic free shipping, seven-day return and “sem agrotóxico” unless backed by actual fields. Present price, available quantity, producer and pickup/delivery choice without invented guarantees.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/pages/PostDetail.test.jsx && npm run build`  
Expected: PASS; no source match for `em desenvolvimento|showFakeDiscount|sem agrotóxico`.

```powershell
git add frontend/src/pages/PostDetail.jsx frontend/src/components/PostCard.jsx frontend/src/pages/Home.jsx frontend/src/pages/PostDetail.test.jsx
git commit -m "feat: conecta produtos ao carrinho"
```

---

### Task 7: Cart Screen

**Files:**
- Create: `frontend/src/pages/Cart.jsx`
- Test: `frontend/src/pages/Cart.test.jsx`

**Interfaces:**
- Consumes all `useCart()` commands and `formatCurrency`.
- Produces a review screen leading to `/checkout`.

- [ ] **Step 1: Write empty and populated cart tests**

Assert that the empty state links to `/`, quantity buttons update totals, remove deletes an item, and checkout is disabled for an empty cart.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/pages/Cart.test.jsx`  
Expected: FAIL because the page is missing.

- [ ] **Step 3: Implement the cart page**

Group line items visually by producer. Use a two-column tablet landscape layout with items on the left and sticky summary on the right; collapse to one column in portrait. Buttons must be at least 44 px tall and have explicit accessible names.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- src/pages/Cart.test.jsx && npm run build`  
Expected: PASS.

```powershell
git add frontend/src/pages/Cart.jsx frontend/src/pages/Cart.test.jsx
git commit -m "feat: cria tela do carrinho"
```

---

### Task 8: Simulated Checkout and Confirmation

**Files:**
- Create: `frontend/src/pages/Checkout.jsx`
- Create: `frontend/src/pages/OrderConfirmation.jsx`
- Test: `frontend/src/pages/Checkout.test.jsx`

**Interfaces:**
- Consumes `createCheckout`, `useCart`, `useAuth`.
- Navigates to `/pedido-confirmado` with `{orderIds}` only after RPC success.

- [ ] **Step 1: Write checkout tests**

Cover required address fields for `DELIVERY`, no address requirement for `PICKUP`, visible “Pagamento simulado para fins acadêmicos” copy, disabled submit during request, retained cart after failure and cleared cart after success.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/pages/Checkout.test.jsx`  
Expected: FAIL because the pages are missing.

- [ ] **Step 3: Implement a short two-step checkout**

Step 1 captures fulfillment. Step 2 shows grouped orders, final totals and the simulated payment choice (`SIMULATED_PIX` or `SIMULATED_CARD`). Do not collect actual card number, CVV or document data.

- [ ] **Step 4: Implement robust submission**

Generate a client submission token with `crypto.randomUUID()` and disable repeat submission. On Supabase error, show the translated message with `role="alert"` and preserve all fields/items. On success, clear the cart once and navigate with `replace: true`.

- [ ] **Step 5: Implement confirmation**

Show every returned order number, simulated-payment status, links to `/pedidos/:id` and a primary link to `/pedidos`. If route state is absent, show a recoverable state linking to order history.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/pages/Checkout.test.jsx && npm run build`  
Expected: PASS.

```powershell
git add frontend/src/pages/Checkout.jsx frontend/src/pages/OrderConfirmation.jsx frontend/src/pages/Checkout.test.jsx
git commit -m "feat: adiciona checkout simulado"
```

---

### Task 9: Consumer Order History and Details

**Files:**
- Create: `frontend/src/components/OrderStatus.jsx`
- Create: `frontend/src/components/OrderCard.jsx`
- Create: `frontend/src/pages/Orders.jsx`
- Create: `frontend/src/pages/OrderDetail.jsx`
- Test: `frontend/src/pages/Orders.test.jsx`

**Interfaces:**
- Consumes `listBuyerOrders`, `getOrder`, `ORDER_STATUS`.
- Produces consumer order list and detail timeline.

- [ ] **Step 1: Write list-state tests**

Cover loading skeleton, retryable error, empty state linking to catalog and a populated order showing producer, total, date and status.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/pages/Orders.test.jsx`  
Expected: FAIL because components are missing.

- [ ] **Step 3: Implement reusable order presentation**

`OrderStatus` maps status to text plus icon, never color alone. `OrderCard` links to `/pedidos/:id` and does not assume consumer or producer context.

- [ ] **Step 4: Implement history and detail**

The detail page shows item snapshots, quantities, totals, fulfillment data, simulated payment label and a four-step timeline. Hide full delivery address from producer-facing reusable components unless the authenticated producer owns the order.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/pages/Orders.test.jsx && npm run build`  
Expected: PASS.

```powershell
git add frontend/src/components/OrderStatus.jsx frontend/src/components/OrderCard.jsx frontend/src/pages/Orders.jsx frontend/src/pages/OrderDetail.jsx frontend/src/pages/Orders.test.jsx
git commit -m "feat: adiciona historico de pedidos"
```

---

### Task 10: Producer Received Orders and Status Updates

**Files:**
- Create: `frontend/src/pages/ReceivedOrders.jsx`
- Test: `frontend/src/pages/ReceivedOrders.test.jsx`

**Interfaces:**
- Consumes `listProducerOrders`, `advanceOrderStatus`, `ORDER_STATUS`.
- Produces producer-only order queue.

- [ ] **Step 1: Write producer workflow tests**

Assert that orders group by active/completed status, the button label names the next status, a pending update disables only that order and a completed order has no advance button.

- [ ] **Step 2: Run and confirm failure**

Run: `npm test -- src/pages/ReceivedOrders.test.jsx`  
Expected: FAIL because the page is missing.

- [ ] **Step 3: Implement the producer queue**

Use order cards with buyer name, fulfillment method, items, total and current status. After a successful RPC, replace that order in local state; on failure retain the old state and expose a retryable alert.

- [ ] **Step 4: Verify with both roles and commit**

Run: `npm test -- src/pages/ReceivedOrders.test.jsx && npm run build`  
Expected: PASS. Manually confirm a consumer is redirected away by `PrivateRoute producerOnly`.

```powershell
git add frontend/src/pages/ReceivedOrders.jsx frontend/src/pages/ReceivedOrders.test.jsx
git commit -m "feat: adiciona gestao de pedidos do produtor"
```

---

### Task 11: Distinctive Visual System and Tablet Pass

**Files:**
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/pages/Home.jsx`
- Modify: `frontend/src/components/PostCard.jsx`
- Modify: `frontend/src/components/Shelf.jsx`
- Modify: `frontend/src/pages/Login.jsx`
- Modify: `frontend/src/pages/Register.jsx`
- Modify: `frontend/src/pages/Profile.jsx`
- Modify: `frontend/src/pages/NewPost.jsx`
- Modify: `frontend/src/pages/ComoPlantar.jsx`
- Modify: `frontend/src/pages/Conversations.jsx`
- Modify: `frontend/src/pages/Chat.jsx`

**Interfaces:**
- Consumes the palette and visual principles from the spec.
- Produces a consistent “feira local contemporânea” UI across every route.

- [ ] **Step 1: Encode design tokens**

Map the approved colors to semantic Tailwind names (`leaf`, `forest`, `fruit`, `guava`, `paper`, `ink`). Define one expressive local/fallback heading stack and one readable UI stack; do not add a network-only font that could disappear during the presentation.

- [ ] **Step 2: Add accessible global primitives**

Implement visible `:focus-visible`, 44 px touch targets, `prefers-reduced-motion`, consistent input error styles and a content width suited to 768–1366 px tablet viewports.

- [ ] **Step 3: Recompose the home page**

Replace the generic gradient hero with a left-aligned market-stall composition using an existing real product image or a checked-in project asset. Make one strong visual moment; remove decorative sparkles and redundant benefit badges. Keep shelves flatter and let photography, type and spacing establish hierarchy.

- [ ] **Step 4: Normalize all route layouts**

For each listed page, verify heading hierarchy, form labels, action names, empty/error/loading states, portrait stacking and landscape use of space. Replace nested generic cards and pills unless they encode a real grouping or status.

- [ ] **Step 5: Run responsive visual review**

Review at 768×1024, 820×1180, 1024×768, 1180×820 and 1366×1024. Record every overflow, clipped label, hover-only control and undersized target, then fix the list before continuing.

- [ ] **Step 6: Self-critique against both requested design skills**

Confirm: the main action is obvious; visual choices come from local produce/producer context; photography has a job; no invented claims remain; borders/cards/badges are not excessive; keyboard focus and reduced motion work.

- [ ] **Step 7: Verify and commit**

Run: `npm test && npm run build`  
Expected: PASS with no horizontal overflow at target widths.

```powershell
git add frontend/tailwind.config.js frontend/src
git commit -m "feat: finaliza design responsivo para tablet"
```

---

### Task 12: Demo Data and Complete Screenshot Set

**Files:**
- Modify: `supabase/seed.mjs`
- Create: `docs/tcc/checklist-prints.md`
- Create: `docs/tcc/prints/*.png`

**Interfaces:**
- Consumes all completed routes.
- Produces stable data and evidence for the activity due in four days.

- [ ] **Step 1: Add deterministic demo orders to the seed**

Create at least one order in each status using the existing test consumer and producer IDs resolved by email. Use product prices from the database and label any demonstrative content as such. Make the seed idempotent by deleting only rows tied to the known demo accounts before reinserting them.

- [ ] **Step 2: Run seed and verify both accounts**

Run the documented seed command. Log in as `ana@markfruit.com` and `joaquim@markfruit.com`; confirm the same demo order is visible on both appropriate sides and invisible to an unrelated account.

- [ ] **Step 3: Create the screenshot checklist**

Use checkboxes for: home, search, login, cadastro, both profiles, new post, product detail, Como Plantar, conversations, chat, empty cart, filled cart, checkout step 1, checkout step 2, confirmation, consumer orders, order detail, received orders and 404.

- [ ] **Step 4: Capture at a consistent tablet viewport**

Use 1024×768 for the primary set and 768×1024 for portrait evidence. Name files `01-home.png` through `20-not-found.png`; crop only browser chrome, never interface content.

- [ ] **Step 5: Inspect every image**

Reject and recapture any image containing loading spinners, browser permission prompts, personal data, clipped content, inconsistent demo data or development errors.

- [ ] **Step 6: Commit**

```powershell
git add supabase/seed.mjs docs/tcc/checklist-prints.md docs/tcc/prints
git commit -m "docs: adiciona telas e dados da demonstracao"
```

---

### Task 13: End-to-End Stability and Presentation Runbook

**Files:**
- Create: `docs/tcc/roteiro-demonstracao.md`
- Modify: affected source files discovered by verification only.

**Interfaces:**
- Produces a repeatable 6–8 minute presentation flow and a recovery path.

- [ ] **Step 1: Run the complete automated suite**

Run: `cd frontend; npm test; npm run build`  
Expected: all tests and build pass.

- [ ] **Step 2: Run database security checks**

Run: `npx supabase test db` and the advisor command supported by `npx supabase db advisors --help`.  
Expected: RLS allow/deny assertions pass and no critical security advisor finding remains.

- [ ] **Step 3: Rehearse the consumer flow**

From a clean browser session: login → search → product → cart → checkout → confirmation → order history → chat. Record duration and every hesitation or failure.

- [ ] **Step 4: Rehearse the producer flow**

In a second account: login → received orders → advance status → chat → create announcement. Confirm the consumer sees the updated order afterward.

- [ ] **Step 5: Write the runbook**

Document exact demo accounts, opening URL, expected initial data, narration per screen, who operates the tablet, and recovery actions for expired login or lost network. Do not place passwords or secret keys in Git; keep the shared demo password outside the committed document.

- [ ] **Step 6: Perform a production-preview rehearsal**

Run: `npm run build && npm run preview` and repeat both flows on the actual tablet over the same network planned for the presentation.

- [ ] **Step 7: Final commit**

```powershell
git add frontend/src docs/tcc/roteiro-demonstracao.md
git commit -m "docs: prepara roteiro da apresentacao do TCC"
```

---

## Milestones

- **End of Day 1:** Tasks 1–5 complete; schema, cart and navigation work.
- **End of Day 2:** Tasks 6–8 complete; purchase and checkout work end to end.
- **End of Day 3:** Tasks 9–10 complete; both order views and statuses work.
- **End of Day 4:** Tasks 11–12 complete; tablet design and every screenshot are ready.
- **Days 5–20:** Task 13, defect fixes, repeated rehearsals and contingency margin.

## Definition of Done

- All automated frontend and database tests pass.
- Production build succeeds.
- Checkout creates authoritative, atomic, producer-separated orders.
- RLS prevents cross-user and cross-producer access.
- All required routes work in portrait and landscape tablet sizes.
- No required action says “em desenvolvimento”.
- No invented discount, certification, shipping or protection claim remains.
- Complete screenshot set is reviewed and stored.
- The presentation flow is rehearsed on the actual tablet.
