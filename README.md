# 🏋️ Iron Brain - Sistema de Treinos com IA

Sistema de treinos inteligente para academia, utilizando Next.js 15, Prisma, Zod e periodização inteligente.

## 🚀 Funcionalidades

- **Dashboard** - Visão geral do treino e estatísticas
- **Catálogo de Exercícios** - 100+ exercícios com filtros por músculo e equipamento
- **Central de Treinos** - Gerar treinos via IA, calcular 1RM, registrar treinos
- **Progresso** - Gráficos de evolução de carga, volume semanal e RPE
- **Autenticação** - Login, cadastro, sistema de roles (ADMIN/USER)
- **Painel Admin** - Gerenciamento de clientes, assinaturas e configurações de pagamento
- **APIs REST** - CRUD completo para exercícios, treinos e cálculos

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## 🛠️ Instalação

```bash
# Clonar o repositório
cd projects/iron-brain

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Gerar Prisma Client
npx prisma generate

# Aplicar migrations ao banco
npx prisma db push

# Popular base de exercícios
npm run seed

# Iniciar servidor de desenvolvimento
npm run dev
```

## 🌐 Deploy em Produção

### Vercel + Neon PostgreSQL

1. **Criar banco Neon PostgreSQL**
   - Acesse [neon.tech](https://neon.tech)
   - Crie um novo projeto
   - Copie a connection string

2. **Deploy na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o repositório
   - Configure as variáveis de ambiente:
     - `DATABASE_URL`
     - `JWT_SECRET` (gere com `openssl rand -base64 32`)
     - `NEXTAUTH_SECRET`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY`

3. **Executar migrations**
   ```bash
   npx prisma db push
   npm run seed
   ```

## 📁 Estrutura do Projeto

```
projects/iron-brain/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── exercises/page.tsx    # Catálogo de Exercícios
│   │   ├── workouts/page.tsx     # Central de Treinos
│   │   ├── workouts/log/page.tsx # Registrar Treino
│   │   ├── progress/page.tsx     # Progresso (Gráficos)
│   │   ├── auth/
│   │   │   ├── login/page.tsx    # Login
│   │   │   └── register/page.tsx # Cadastro
│   │   ├── admin/page.tsx        # Painel Admin
│   │   └── api/
│   │       ├── exercises/        # CRUD Exercícios
│   │       ├── workout-plans/    # CRUD + Geração IA
│   │       ├── auth/             # Login/Register
│   │       ├── progress/         # Dados de Progresso
│   │       └── calculate/        # 1RM, Volume, Overload
│   └── lib/
│       ├── zod-schemas.ts        # Validações
│       ├── training-utils.ts     # Cálculos
│       └── periodization-engine.ts # Motor de IA
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed de exercícios
└── e2e/                          # Testes E2E (Playwright)
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e
```

## 📊 Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript 5+ (Strict Mode)
- **ORM:** Prisma v7.6.0
- **Database:** PostgreSQL
- **Validação:** Zod
- **UI:** Tailwind CSS + Lucide Icons
- **Animações:** Framer Motion
- **Gráficos:** Recharts
- **Testes:** Vitest + Playwright

## 📝 Licença

MIT
