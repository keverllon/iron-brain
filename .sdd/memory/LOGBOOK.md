# 📖 LOGBOOK - IRON BRAIN PROJECT

## Registro de Decisões Técnicas

### 06/04/2026 - Sessão de Autenticação e Admin

#### Decisão: Usar JWT manual com jose em vez de NextAuth

**Motivo:** NextAuth v5 ainda está em beta e requer configuração mais complexa. JWT com jose é mais simples e atende às necessidades do projeto.

#### Decisão: Type assertion para campos do Prisma

**Motivo:** O banco de dados não estava disponível para executar `db push`. Usamos type assertion (`as UserWithAuth`) para contornar os erros de TypeScript até que o banco seja atualizado.

#### Decisão: Middleware para proteção de rotas admin

**Motivo:** Proteger o painel admin de acesso não autorizado. O middleware verifica o cookie `auth-token` e o role do usuário antes de permitir acesso.

#### Decisão: API de admin separada (`/api/admin/users`)

**Motivo:** Separar a lógica de administração de usuários da API principal mantém o código organizado e facilita a adição de proteção por role no futuro.

#### Decisão: Dados mockados no admin como fallback

**Motivo:** Enquanto o banco não está disponível, o painel admin usa dados mockados para demonstração visual.

### 06/04/2026 - Sessão de Build e Deploy

#### Decisão: Criar vercel.json

**Motivo:** Configurar o deploy automático na Vercel com as configurações corretas de build e output.

#### Decisão: Criar .env.example

**Motivo:** Documentar todas as variáveis de ambiente necessárias para que outros desenvolvedores possam configurar o projeto facilmente.

### 06/04/2026 - Sessão de Testes

#### Decisão: Playwright para E2E

**Motivo:** Playwright é a ferramenta mais moderna e confiável para testes E2E, com suporte nativo a múltiplos browsers e boa integração com Next.js.

#### Decisão: Vitest para testes unitários

**Motivo:** Vitest é mais rápido que Jest e tem melhor integração com Next.js via Turbopack.

### 06/04/2026 - Sessão de Correção de Registro e Login

#### Decisão: Corrigir porta do PostgreSQL no .env

**Motivo:** O `.env` estava configurado com a porta `51214` (porta do Prisma Postgres) mas o PostgreSQL local estava rodando na porta padrão `5432`. Isso causava falha no registro de clientes.

#### Decisão: Adicionar verificação de autenticação no dashboard

**Motivo:** A página principal (`page.tsx`) não verificava o estado de autenticação do usuário. Após o login, o usuário era redirecionado mas o dashboard continuava mostrando "Entrar" em vez do nome do usuário. Adicionei `useEffect` para ler o `localStorage` e mostrar o nome do usuário + botão de logout.
