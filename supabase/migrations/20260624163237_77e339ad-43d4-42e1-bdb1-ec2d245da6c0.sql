
-- Revoke direct execute on security-definer helpers (still used by RLS and triggers)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Tighten visit insert policy: must reference an existing approved business
DROP POLICY IF EXISTS "Anyone can log a visit" ON public.business_visits;
CREATE POLICY "Visits only for approved businesses" ON public.business_visits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id AND b.status = 'approved'
    )
  );
