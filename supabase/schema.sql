-- ============================================================
-- HD IMOBILIÁRIA — Schema Supabase
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)
-- ============================================================

-- 0. Extensões necessárias
-- --------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 1. PROFILES (estende auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  email       TEXT NOT NULL,
  nome        TEXT NOT NULL,
  telefone    TEXT,
  role        TEXT NOT NULL DEFAULT 'corretor'
              CHECK (role IN ('admin', 'gerente', 'corretor')),
  avatar_url  TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON TABLE public.profiles IS 'Perfil de cada usuário (corretor, gerente ou admin)';

-- Trigger: criar profile automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. IMÓVEIS
-- ============================================================
CREATE TABLE public.imoveis (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  tipo          TEXT NOT NULL DEFAULT 'casa'
                CHECK (tipo IN ('casa', 'apartamento', 'terreno', 'comercial')),
  status        TEXT NOT NULL DEFAULT 'disponivel'
                CHECK (status IN ('disponivel', 'reservado', 'vendido')),
  valor         NUMERIC(14,2) NOT NULL DEFAULT 0,
  endereco      TEXT NOT NULL DEFAULT '',
  bairro        TEXT NOT NULL DEFAULT '',
  cidade        TEXT NOT NULL DEFAULT 'Natal',
  uf            TEXT NOT NULL DEFAULT 'RN',
  quartos       SMALLINT,
  banheiros     SMALLINT,
  area_m2       NUMERIC(10,2),
  imagens       TEXT[] DEFAULT '{}',
  corretor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.imoveis IS 'Catálogo de imóveis da carteira';

CREATE INDEX idx_imoveis_status ON public.imoveis(status);
CREATE INDEX idx_imoveis_tipo ON public.imoveis(tipo);
CREATE INDEX idx_imoveis_corretor ON public.imoveis(corretor_id);
CREATE INDEX idx_imoveis_cidade_bairro ON public.imoveis(cidade, bairro);


-- ============================================================
-- 3. LEADS
-- ============================================================
CREATE TABLE public.leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  nome          TEXT NOT NULL,
  telefone      TEXT NOT NULL,
  email         TEXT,
  origem        TEXT NOT NULL DEFAULT 'whatsapp'
                CHECK (origem IN ('site', 'instagram', 'facebook', 'whatsapp', 'indicacao', 'outro')),
  status        TEXT NOT NULL DEFAULT 'novo'
                CHECK (status IN ('novo', 'contato', 'visita', 'proposta', 'negociacao', 'ganho', 'perdido')),
  interesse     TEXT,
  observacoes   TEXT,
  corretor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  imovel_id     UUID REFERENCES public.imoveis(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.leads IS 'Leads/oportunidades do funil de vendas';

CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_corretor ON public.leads(corretor_id);
CREATE INDEX idx_leads_origem ON public.leads(origem);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);


-- ============================================================
-- 4. ATIVIDADES
-- ============================================================
CREATE TABLE public.atividades (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo            TEXT NOT NULL DEFAULT 'outro'
                  CHECK (tipo IN ('ligacao', 'visita', 'proposta', 'mensagem', 'reuniao', 'outro')),
  descricao       TEXT NOT NULL,
  lead_id         UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  imovel_id       UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_agendada   TIMESTAMPTZ,
  concluida       BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE public.atividades IS 'Registro de atividades (ligações, visitas, propostas etc.)';

CREATE INDEX idx_atividades_lead ON public.atividades(lead_id);
CREATE INDEX idx_atividades_user ON public.atividades(user_id);
CREATE INDEX idx_atividades_data ON public.atividades(data_agendada DESC);
CREATE INDEX idx_atividades_pendentes ON public.atividades(user_id, concluida) WHERE concluida = false;


-- ============================================================
-- 5. TRIGGER GENÉRICO: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- 6.1 PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver profiles (para listar equipe)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Cada um edita apenas o próprio profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin pode editar qualquer profile
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6.2 IMÓVEIS
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ver imóveis
CREATE POLICY "imoveis_select_authenticated"
  ON public.imoveis FOR SELECT
  TO authenticated
  USING (true);

-- Admin e gerente podem inserir/editar/deletar
CREATE POLICY "imoveis_insert_admin_gerente"
  ON public.imoveis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

CREATE POLICY "imoveis_update_admin_gerente"
  ON public.imoveis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

CREATE POLICY "imoveis_delete_admin"
  ON public.imoveis FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6.3 LEADS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admin/gerente veem todos; corretor vê apenas os seus
CREATE POLICY "leads_select"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    corretor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

-- Todos autenticados podem criar leads
CREATE POLICY "leads_insert_authenticated"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Corretor edita os próprios; admin/gerente editam qualquer um
CREATE POLICY "leads_update"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    corretor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

-- Só admin deleta lead
CREATE POLICY "leads_delete_admin"
  ON public.leads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6.4 ATIVIDADES
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Admin/gerente veem todas; corretor vê apenas as suas
CREATE POLICY "atividades_select"
  ON public.atividades FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

-- Qualquer autenticado pode criar atividade
CREATE POLICY "atividades_insert"
  ON public.atividades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Só o dono ou admin/gerente edita
CREATE POLICY "atividades_update"
  ON public.atividades FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );

-- Só admin deleta
CREATE POLICY "atividades_delete_admin"
  ON public.atividades FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 7. STORAGE BUCKET (imagens de imóveis)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imoveis-imagens',
  'imoveis-imagens',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Qualquer autenticado pode fazer upload
CREATE POLICY "imoveis_imagens_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'imoveis-imagens');

-- Público pode visualizar (para exibição no catálogo)
CREATE POLICY "imoveis_imagens_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'imoveis-imagens');

-- Só admin/gerente deleta
CREATE POLICY "imoveis_imagens_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'imoveis-imagens'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'gerente')
    )
  );


-- ============================================================
-- 8. VIEWS ÚTEIS
-- ============================================================

-- Contagem de leads por status (para dashboard)
CREATE OR REPLACE VIEW public.vw_leads_por_status AS
SELECT
  status,
  COUNT(*) AS total
FROM public.leads
GROUP BY status
ORDER BY
  CASE status
    WHEN 'novo'        THEN 1
    WHEN 'contato'     THEN 2
    WHEN 'visita'      THEN 3
    WHEN 'proposta'    THEN 4
    WHEN 'negociacao'  THEN 5
    WHEN 'ganho'       THEN 6
    WHEN 'perdido'     THEN 7
  END;

-- Contagem de imóveis por status
CREATE OR REPLACE VIEW public.vw_imoveis_por_status AS
SELECT
  status,
  COUNT(*) AS total,
  COALESCE(SUM(valor), 0) AS valor_total
FROM public.imoveis
GROUP BY status;

-- Performance por corretor (leads ganhos vs total)
CREATE OR REPLACE VIEW public.vw_performance_corretor AS
SELECT
  p.id,
  p.nome,
  p.avatar_url,
  COUNT(l.id) AS total_leads,
  COUNT(l.id) FILTER (WHERE l.status = 'ganho') AS leads_ganhos,
  COUNT(l.id) FILTER (WHERE l.status = 'perdido') AS leads_perdidos,
  COUNT(l.id) FILTER (WHERE l.status NOT IN ('ganho', 'perdido')) AS leads_ativos
FROM public.profiles p
LEFT JOIN public.leads l ON l.corretor_id = p.id
WHERE p.role = 'corretor' AND p.ativo = true
GROUP BY p.id, p.nome, p.avatar_url;


-- ============================================================
-- PRONTO! Agora crie seu primeiro usuário admin:
--
-- 1. Vá em Authentication > Users > Add User
--    Email: seu-email@exemplo.com
--    Senha: sua-senha
--
-- 2. Depois rode este UPDATE para torná-lo admin:
--    UPDATE public.profiles
--    SET role = 'admin', nome = 'Gabriel'
--    WHERE email = 'seu-email@exemplo.com';
-- ============================================================
