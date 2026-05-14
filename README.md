# 🏠 HD Imobiliária — Sistema de Gestão

Sistema de gestão imobiliária completo para a **HD Imobiliária** (Zona Norte/RN — CRECI 6547-J).

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Estilização:** Tailwind CSS 3
- **Backend:** Supabase (Auth + Database + Storage)
- **Ícones:** Lucide React
- **Roteamento:** React Router v7
- **Deploy:** Vercel

## Estrutura

```
src/
├── assets/          # Imagens, logos
├── components/
│   ├── auth/        # ProtectedRoute, guards
│   ├── dashboard/   # Widgets do dashboard
│   ├── equipe/      # Componentes de equipe
│   ├── imoveis/     # Componentes de imóveis
│   ├── layout/      # AppLayout, Sidebar, TopBar
│   ├── leads/       # Componentes de leads (Kanban)
│   └── ui/          # Componentes reutilizáveis
├── hooks/           # useAuth e hooks customizados
├── lib/             # supabase client, utils
├── pages/           # Páginas da aplicação
├── styles/          # globals.css (Tailwind)
└── types/           # TypeScript types (database)
```

## Configuração

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
```

## Módulos Planejados

| Módulo | Status |
|--------|--------|
| Login / Auth | ✅ Implementado |
| Dashboard | 🔨 Scaffold |
| CRM Leads (Kanban) | 📋 Planejado |
| Catálogo Imóveis | 📋 Planejado |
| Gestão de Equipe | 📋 Planejado |
| Atividades / Agenda | 📋 Planejado |
| Mensagens / WhatsApp | 📋 Planejado |
| Relatórios | 📋 Planejado |

## Licença

Proprietário — HD Imobiliária / Grupo Conexão
