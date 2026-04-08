# 📚 KNOWLEDGE BASE - IRON BRAIN PROJECT

## 🟢 Acertos

### Setup Inicial

- [ACERTO] Next.js 15 criado com sucesso usando `create-next-app@latest`
- [ACERTO] Dependências instaladas sem conflitos de versão
- [ACERTO] Prisma inicializado corretamente com `npx prisma init`
- [ACERTO] Estrutura de pastas `.sdd/` criada conforme protocolo

## 🔴 Erros e Causas

### [ERRO] Prisma 7 - Datasource URL no schema

- **[ERRO]** `The datasource property url is no longer supported in schema files`
- **[CAUSA]** Prisma 7 moveu a configuração `url` do `schema.prisma` para `prisma.config.ts`
- **[SOLUÇÃO]** Remover `url = env("DATABASE_URL")` do `datasource db` no schema.prisma

### [ERRO] Prisma 7 - PrismaClient requer adapter

- **[ERRO]** `PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`
- **[CAUSA]** Prisma 7 requer explicitamente `adapter` ou `accelerateUrl` no construtor
- **[SOLUÇÃO]** Instalar `@prisma/adapter-pg` e `pg`, criar adapter com `new PrismaPg(pool)`

### [ERRO] Registro de clientes falhando - Porta errada do PostgreSQL

- **[ERRO]** `Can't reach database server at localhost:51214` - Registro de clientes falhava
- **[CAUSA]** O `.env` estava configurado com a porta `51214` mas o PostgreSQL estava rodando na porta padrão `5432`
- **[SOLUÇÃO]** Corrigir `DATABASE_URL` no `.env` para usar `localhost:5432` e criar os bancos `ironbrain` e `ironbrain_shadow`

### [ERRO] Dashboard não mostrava usuário logado

- **[ERRO]** Após login, o dashboard continuava mostrando botão "Entrar" em vez do nome do usuário
- **[CAUSA]** A página `page.tsx` não verificava o estado de autenticação no localStorage
- **[SOLUÇÃO]** Adicionar `useEffect` para ler `localStorage.getItem("user")` e mostrar nome do usuário + botão de logout

### [ERRO] Geração de treinos com IA falhava

- **[ERRO]** "Erro ao gerar plano de treino via IA" - userId fixo inválido
- **[CAUSA]** O frontend enviava `userId: "00000000-0000-0000-0000-000000000000"` que não existe no banco
- **[SOLUÇÃO]** Obter userId do localStorage (usuário logado) e criar interface completa de acompanhamento de treinos

### [ACERTO] Interface de acompanhamento de treinos semanais

- **[ACERTO]** Criada interface completa com lista de treinos organizados por dia da semana
- **[ACERTO]** Sistema de confirmação de treino concluído com registro de reps, peso e RPE
- **[ACERTO]** Barra de progresso visual mostrando % de treinos completados
- **[ACERTO]** API `/api/workout-plans/[sessionId]/complete` para marcar treino como concluído

### [ACERTO] Seleção de nível de treino e pesos progressivos

- **[ACERTO]** Adicionados 4 níveis: Iniciante, Intermediário, Avançado, Profissional
- **[ACERTO]** Slider para selecionar treinos por semana (2-6)
- **[ACERTO]** Configuração opcional de pesos iniciais para cada exercício
- **[ACERTO]** Progressão automática de 2.5% nos pesos a cada novo treino gerado
- **[ACERTO]** Busca de pesos anteriores do banco para progressão automática

### [ACERTO] Exclusão de treinos

- **[ACERTO]** API DELETE `/api/workout-plans/[id]` para excluir treinos
- **[ACERTO]** Botão de excluir com confirmação no header do card de treino
- **[ACERTO]** Ícone de lixeira com estado de loading durante exclusão
- **[ACERTO]** Exclusão em cascata: sets -> sessions -> plan via transaction

### [ERRO] Next.js 16 - params é Promise

- **[ERRO]** `params.id` retornava undefined na rota DELETE
- **[CAUSA]** No Next.js 16, `params` é um Promise e deve ser desembrulhado com `await`
- **[SOLUÇÃO]** Alterar tipo para `Promise<{ id: string }>` e usar `const { id } = await params`

### [ERRO] Restrição de chave estrangeira na exclusão

- **[ERRO]** `violates RESTRICT setting of foreign key constraint` ao deletar WorkoutPlan
- **[CAUSA]** Sessões e sets referenciam o plano, impedindo exclusão direta
- **[SOLUÇÃO]** Usar transação para deletar em cascata: sets -> sessions -> plan

### [ERRO] Exercícios não apareciam nos treinos gerados

- **[ERRO]** `exerciseId` ficava vazio ao salvar treino gerado pela IA
- **[CAUSA]** Busca por nome exato falhava quando havia diferenças de case
- **[SOLUÇÃO]** Criar mapa de exercícios com busca case-insensitive

### [ERRO] Pesos não eram salvos nos treinos

- **[ERRO]** `weightLifted` ficava null nos treinos gerados
- **[CAUSA]** `estimatedWeight` era undefined quando não havia histórico de pesos nem 1RM
- **[SOLUÇÃO]** Adicionar função `getDefaultWeight()` que retorna pesos padrão baseados no grupo muscular, tipo de exercício e fase

### [ACERTO] 4 Modelos de Periodização

- **[ACERTO]** Adicionados 4 modelos: Linear, Ondulatória, Blocos, Linear Reversa
- **[ACERTO]** Cada modelo tem 4 semanas de configuração com reps, sets, intensidade e descanso
- **[ACERTO]** Interface com cards visuais para seleção do modelo
- **[ACERTO]** API atualizada para receber e usar `periodizationModel`
- **[ACERTO]** Schema Zod atualizado com validação do modelo

## � Lições Aprendidas

1. **PowerShell Only:** Usar sempre `mkdir -Force` ao invés de `mkdir -p` no Windows
2. **Import Alias:** Next.js 15 usa `@/*` como padrão para import alias
3. **Prisma Config:** Prisma 6+ usa `prisma.config.ts` por padrão

## �🔗 Referências Técnicas

- [Fórmula Brzycki para 1RM](https://en.wikipedia.org/wiki/One-repetition_maximum#Brzycki)
- [Fórmula Epley para 1RM](https://en.wikipedia.org/wiki/One-repetition_maximum#Epley)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Zod](https://zod.dev/)
