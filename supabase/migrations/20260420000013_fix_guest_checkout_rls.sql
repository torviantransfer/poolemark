-- Fix guest checkout RLS for orders and order_items

-- ORDERS INSERT POLICIES
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Authenticated users can create own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guests can create guest orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

-- ORDER_ITEMS INSERT POLICIES
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Authenticated users can create own order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can create guest order items" ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id IS NULL
        AND orders.guest_email IS NOT NULL
    )
  );
