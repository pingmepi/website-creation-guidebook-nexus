-- Auto-generated migration: 07_policies.sql
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;


--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;


--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;


--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;


--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;


--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;


--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;


--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;


--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;


--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;


--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;


--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;


--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;


--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;


--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;


--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;


--
-- Name: design_questions Allow everyone to view questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow everyone to view questions" ON public.design_questions FOR SELECT USING (true);



--
-- Name: themes Allow everyone to view themes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow everyone to view themes" ON public.themes FOR SELECT USING (true);



--
-- Name: designs Allow users to delete their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete their own designs" ON public.designs FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: designs Allow users to insert their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert their own designs" ON public.designs FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: design_responses Allow users to insert their own responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert their own responses" ON public.design_responses FOR INSERT WITH CHECK ((auth.uid() = ( SELECT designs.user_id
   FROM public.designs
  WHERE (designs.id = design_responses.design_id))));



--
-- Name: designs Allow users to update their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own designs" ON public.designs FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: profiles Allow users to update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));



--
-- Name: profiles Allow users to view all profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view all profiles" ON public.profiles FOR SELECT USING (true);



--
-- Name: designs Allow users to view their own designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view their own designs" ON public.designs FOR SELECT USING (((auth.uid() = user_id) OR (is_public = true)));



--
-- Name: design_responses Allow users to view their own responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view their own responses" ON public.design_responses FOR SELECT USING ((auth.uid() = ( SELECT designs.user_id
   FROM public.designs
  WHERE (designs.id = design_responses.design_id))));



--
-- Name: product_categories Categories are publicly readable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Categories are publicly readable" ON public.product_categories FOR SELECT USING ((is_active = true));



--
-- Name: product_variants Product variants are publicly readable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING ((is_active = true));



--
-- Name: products Products are publicly readable; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING ((is_active = true));



--
-- Name: ai_generated_designs Users can create their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own AI designs" ON public.ai_generated_designs FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: cart_items Users can create their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own cart items" ON public.cart_items FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: custom_designs Users can create their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own custom designs" ON public.custom_designs FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: order_items Users can create their own order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



--
-- Name: orders Users can create their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: ai_generated_designs Users can delete their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own AI designs" ON public.ai_generated_designs FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: addresses Users can delete their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own addresses" ON public.addresses FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: cart_items Users can delete their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own cart items" ON public.cart_items FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: custom_designs Users can delete their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can delete their own custom designs" ON public.custom_designs FOR DELETE USING ((auth.uid() = user_id));



--
-- Name: addresses Users can insert their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own addresses" ON public.addresses FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: cart_items Users can insert their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own cart items" ON public.cart_items FOR INSERT WITH CHECK ((auth.uid() = user_id));



--
-- Name: ai_generated_designs Users can update their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own AI designs" ON public.ai_generated_designs FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: addresses Users can update their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own addresses" ON public.addresses FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: cart_items Users can update their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own cart items" ON public.cart_items FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: custom_designs Users can update their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own custom designs" ON public.custom_designs FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: orders Users can update their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING ((auth.uid() = user_id));



--
-- Name: ai_generated_designs Users can view their own AI designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own AI designs" ON public.ai_generated_designs FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: addresses Users can view their own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own addresses" ON public.addresses FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: cart_items Users can view their own cart items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own cart items" ON public.cart_items FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: custom_designs Users can view their own custom designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own custom designs" ON public.custom_designs FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: order_items Users can view their own order items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (orders.user_id = auth.uid())))));



--
-- Name: orders Users can view their own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));



--
-- Name: payment_transactions Users can view their own payment transactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions FOR SELECT USING ((auth.uid() = ( SELECT orders.user_id
   FROM public.orders
  WHERE (orders.id = payment_transactions.order_id))));



--
-- Name: addresses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;


--
-- Name: ai_generated_designs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ai_generated_designs ENABLE ROW LEVEL SECURITY;


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;


--
-- Name: custom_designs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;


--
-- Name: design_questions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.design_questions ENABLE ROW LEVEL SECURITY;


--
-- Name: design_responses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.design_responses ENABLE ROW LEVEL SECURITY;


--
-- Name: designs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;


--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;


--
-- Name: payment_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;


--
-- Name: product_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;


--
-- Name: product_variants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;


--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


--
-- Name: themes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;


--
-- Name: objects Allow authenticated users to upload design assets; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow authenticated users to upload design assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'design-assets'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



--
-- Name: objects Allow public read access to design assets; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow public read access to design assets" ON storage.objects FOR SELECT USING ((bucket_id = 'design-assets'::text));



--
-- Name: objects Allow users to delete their own design assets; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow users to delete their own design assets" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'design-assets'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



--
-- Name: objects Allow users to update their own design assets; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow users to update their own design assets" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'design-assets'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;


--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;


--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;


--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;


