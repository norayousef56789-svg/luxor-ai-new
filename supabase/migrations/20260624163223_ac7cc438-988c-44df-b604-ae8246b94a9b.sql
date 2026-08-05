
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'business', 'tourist');
CREATE TYPE public.business_type AS ENUM ('Hotel', 'Restaurant', 'Bazaar', 'Tour Company');
CREATE TYPE public.business_status AS ENUM ('pending', 'approved', 'rejected');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles or admins read all" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ NEW USER TRIGGER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'tourist')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ BUSINESSES ============
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type business_type NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status business_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT ON public.businesses TO anon;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees approved businesses" ON public.businesses
  FOR SELECT USING (status = 'approved' OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners create their business" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners or admins update business" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners or admins delete business" ON public.businesses
  FOR DELETE USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX businesses_owner_idx ON public.businesses(owner_id);
CREATE INDEX businesses_status_type_idx ON public.businesses(status, type);

-- ============ OFFERS ============
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount TEXT NOT NULL,
  valid_until DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT SELECT ON public.offers TO anon;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees active offers" ON public.offers FOR SELECT USING (
  active OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
CREATE POLICY "Owners or admins manage offers" ON public.offers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id
      AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX offers_business_idx ON public.offers(business_id);

-- ============ ATTRACTIONS ============
CREATE TABLE public.attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  era TEXT,
  image_url TEXT,
  tagline TEXT,
  description TEXT,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  hours TEXT,
  ticket TEXT,
  best_time TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.attractions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attractions TO authenticated;
GRANT ALL ON public.attractions TO service_role;
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attractions are public" ON public.attractions FOR SELECT USING (true);
CREATE POLICY "Admins manage attractions" ON public.attractions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_attractions_updated_at BEFORE UPDATE ON public.attractions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EVENTS ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  category TEXT,
  ticket_price TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are public" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BUSINESS VISITS ============
CREATE TABLE public.business_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.business_visits TO anon, authenticated;
GRANT ALL ON public.business_visits TO service_role;
ALTER TABLE public.business_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a visit" ON public.business_visits
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners and admins read visits" ON public.business_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = business_id
        AND (b.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );
CREATE INDEX business_visits_business_created_idx ON public.business_visits(business_id, created_at);

-- ============ SEED ATTRACTIONS ============
INSERT INTO public.attractions (slug, name, bank, era, tagline, description, highlights, hours, ticket, best_time, lat, lng) VALUES
('karnak-temple','Karnak Temple Complex','East Bank','c. 2000 BCE – 30 BCE','The grandest temple complex ever built.','A breathtaking open-air museum of pylons, sanctuaries and obelisks expanded by thirty pharaohs over two millennia. The Great Hypostyle Hall remains one of humanity''s most ambitious architectural achievements.',ARRAY['Great Hypostyle Hall','Sacred Lake','Avenue of Sphinxes','Sound & Light show'],'6:00 – 17:30 daily','EGP 450','Early morning or evening',25.7188,32.6573),
('luxor-temple','Luxor Temple','East Bank','c. 1400 BCE','Where pharaohs were crowned, glowing at night.','Built by Amenhotep III and Ramesses II, Luxor Temple connects to Karnak via the restored 2.7 km Avenue of Sphinxes.',ARRAY['Obelisk of Ramesses II','Court of Amenhotep III','Avenue of Sphinxes'],'6:00 – 21:00 daily','EGP 400','After sunset',25.6995,32.6391),
('valley-of-the-kings','Valley of the Kings','West Bank','c. 1550 – 1070 BCE','The royal burial ground of the New Kingdom.','Sixty-three tombs carved deep into limestone hills sheltered the pharaohs of Egypt''s golden age, including Tutankhamun, Ramesses VI and Seti I.',ARRAY['Tomb of Tutankhamun','Tomb of Seti I','Tomb of Ramesses VI'],'6:00 – 17:00 daily','EGP 600 + extras','Sunrise to beat the heat',25.7402,32.6014),
('hatshepsut-temple','Temple of Hatshepsut','West Bank','c. 1479 BCE','A terraced masterpiece against sheer cliffs.','The mortuary temple of Egypt''s most powerful female pharaoh rises in three colonnaded terraces from the desert floor at Deir el-Bahari.',ARRAY['Three sweeping terraces','Punt Reliefs','Chapel of Anubis'],'6:00 – 17:00 daily','EGP 360','Early morning',25.7382,32.6064),
('nile-felucca','Felucca Sail on the Nile','East Bank','Timeless','Glide between East and West Bank under sail.','Traditional wooden feluccas — the oldest, slowest and most beautiful way to see Luxor. Drift past banana groves and date palms as the sun melts into the western desert.',ARRAY['Sunset sail','Banana Island stop','Onboard mint tea'],'Daily, by arrangement','From EGP 300 / hour','Golden hour',25.6989,32.6418),
('hot-air-balloon','Hot Air Balloon over the West Bank','West Bank','Sunrise experience','Float over temples and tombs at dawn.','Lift off as the sun crests the eastern desert and drift silently above Hatshepsut''s temple, the Colossi of Memnon, and the green ribbon of the Nile.',ARRAY['Sunrise launch','45 minute flight','Hotel pickup'],'Pre-dawn','From USD 90','October – April',25.7239,32.6014),
('medinet-habu','Medinet Habu','West Bank','c. 1186 BCE','The vivid mortuary temple of Ramesses III.','Massive walls of brightly painted reliefs depicting victories over the Sea Peoples. Often quiet — the West Bank''s most underrated giant.',ARRAY['Battle reliefs','Original color pigments','First Pylon'],'6:00 – 17:00','EGP 200','Late afternoon',25.7197,32.6017),
('luxor-museum','Luxor Museum','East Bank','Modern','A small, perfectly curated collection.','One of Egypt''s finest museums — statues from the Karnak cachette, royal mummies, and treasures of Tutankhamun beautifully presented.',ARRAY['Royal mummies room','Akhenaten talatat wall','Statue of Thutmose III'],'9:00 – 14:00, 17:00 – 22:00','EGP 300','Evening',25.7016,32.6394);

-- ============ SEED EVENTS ============
INSERT INTO public.events (title, description, location, starts_at, category, ticket_price) VALUES
('Karnak Sound & Light Show','An evening journey through the temple of Amun-Ra, narrated under the stars with sweeping music.','Karnak Temple, East Bank', now() + interval '3 days','Cultural','EGP 450'),
('Luxor African Film Festival','International African cinema screenings along the Nile Corniche.','Cultural Palace, Luxor', now() + interval '21 days','Festival','Free'),
('Opera Aida at Hatshepsut','Verdi''s Aida performed against the cliffs of Deir el-Bahari.','Temple of Hatshepsut, West Bank', now() + interval '45 days','Music','EGP 1500'),
('Hot Air Balloon Festival','Sunrise mass ascension of 30 balloons over the Theban Necropolis.','West Bank launch fields', now() + interval '60 days','Adventure','From USD 90'),
('Abu al-Haggag Moulid','The festive river procession honoring Luxor''s patron saint, a tradition rooted in ancient Opet festivals.','Luxor Temple area', now() + interval '90 days','Religious','Free');
