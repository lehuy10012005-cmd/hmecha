-- HMECHA - BƯỚC 2: CHỈ chạy sau khi code mới đã được deploy/test.
-- Script này khóa đọc/ghi đơn hàng từ browser; COD/VNPAY/Admin mới dùng server API.
-- Nếu chạy trước khi thay code public, checkout cũ có thể ngừng tạo đơn.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Xóa toàn bộ policy cũ của orders/order_items để không còn policy rộng làm lộ đơn hàng.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='orders'
  loop execute format('drop policy if exists %I on public.orders', p.policyname); end loop;
  for p in select policyname from pg_policies where schemaname='public' and tablename='order_items'
  loop execute format('drop policy if exists %I on public.order_items', p.policyname); end loop;
end $$;

create policy "orders_customer_select_own"
  on public.orders for select to authenticated
  using ((select auth.uid()) = customer_id);

create policy "order_items_customer_select_own"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where public.orders.id = public.order_items.order_id
        and public.orders.customer_id = (select auth.uid())
    )
  );
