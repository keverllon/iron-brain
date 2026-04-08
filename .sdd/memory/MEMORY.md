# 🧠 MEMORY - IRON BRAIN PROJECT

## 📋 Snapshot Atual

**Versão:** 1.1.0
**Data:** 06/04/2026 16:51
**Status:** Produção Ready

## 📊 Métricas do Projeto

| Métrica          | Valor      |
| ---------------- | ---------- |
| Páginas          | 13         |
| APIs             | 10         |
| Rotas Totais     | 21         |
| Testes Unitários | 25 passing |
| Exercícios       | 100        |
| TypeScript       | Zero erros |
| Build            | ✅ Sucesso |

## 🏗️ Arquitetura

### Frontend

- Next.js 15 (App Router)
- TypeScript 5+ (Strict Mode)
- Tailwind CSS
- Framer Motion (animações)
- Recharts (gráficos)
- Lucide Icons

### Backend

- Next.js API Routes
- Prisma ORM v7.6.0
- PostgreSQL
- Zod (validação)
- JWT (jose) para auth
- bcryptjs (hash de senhas)

### Testes

- Vitest (unitários)
- Playwright (E2E)

## 📁 Estrutura de Arquivos

```
projects/iron-brain/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── exercises/page.tsx    # Catálogo
│   │   ├── workouts/page.tsx     # Central
│   │   ├── workouts/log/page.tsx # Registro
│   │   ├── progress/page.tsx     # Gráficos
│   │   ├── auth/login/page.tsx   # Login
│   │   ├── auth/register/page.tsx # Cadastro
│   │   ├── admin/page.tsx        # Painel Admin
│   │   ├── api/
│   │   │   ├── exercises/        # CRUD
│   │   │   ├── workout-plans/    # CRUD + IA
│   │   │   ├── auth/             # Login/Register/Logout
│   │   │   ├── admin/users/      # CRUD Admin
│   │   │   ├── progress/         # Dados
│   │   │   └── calculate/        # 1RM, Volume, Overload
│   │   └── middleware.ts         # Proteção de rotas
│   └── lib/
│       ├── zod-schemas.ts
│       ├── training-utils.ts
│       └── periodization-engine.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── e2e/
│   ├── dashboard.spec.ts
│   ├── exercises.spec.ts
│   └── workouts.spec.ts
├── .env.example
├── vercel.json
└── README.md
```

## 🔧 APIs Implementadas

| Endpoint                       | Métodos             | Descrição           |
| ------------------------------ | ------------------- | ------------------- |
| `/api/exercises`               | GET/POST/PUT/DELETE | CRUD Exercícios     |
| `/api/workout-plans`           | GET/POST            | CRUD + Geração IA   |
| `/api/auth/login`              | POST                | Login JWT           |
| `/api/auth/register`           | POST                | Cadastro            |
| `/api/auth/logout`             | POST                | Logout              |
| `/api/admin/users`             | GET/PUT/DELETE      | CRUD Admin          |
| `/api/progress`                | GET                 | Dados de Progresso  |
| `/api/calculate/one-rm`        | POST                | Calcular 1RM        |
| `/api/calculate/weekly-volume` | POST                | Volume Semanal      |
| `/api/calculate/overload`      | POST                | Progressão de Carga |

## 🚀 Próximos Passos

1. Executar `npx prisma db push` quando banco estiver disponível
2. Configurar Stripe para pagamentos
3. Deploy na Vercel
