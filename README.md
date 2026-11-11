# Aurora — Sistema de Atividades

TCC do curso técnico em Informática do Colégio Técnico Bento Quirino, Campinas/SP, 2026. Orientação de Mateus Amendola Redivo.

Bruno Romano Kimura, Caíque Carneiro Guiraldello, Daniel Ferriani de Chico e João Pedro Braga.

O Aurora centraliza turmas, disciplinas, atividades, entregas, correções, notas e mensagens escolares. O frontend usa React, TypeScript, Vite e Tailwind CSS. A API usa Java 21, Spring Boot, Spring Security, JWT em cookies HttpOnly e PostgreSQL, com suporte ao Supabase.

## Rodar com Docker Compose

1. Copie `.env.example` para `.env` na raiz. Preencha `POSTGRES_PASSWORD` e `JWT_SECRET`. Use uma chave JWT aleatória de pelo menos 32 bytes. No PowerShell, gere uma com:

   ```powershell
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```

   Para reutilizar um volume Docker existente, mantenha a senha que já foi usada para criar seu usuário PostgreSQL.
2. Em um volume novo, execute `docker compose up --build -d`. O PostgreSQL carrega o esquema base e as duas migrations ao inicializar.
3. Se o volume já existia, aplique as migrations antes de iniciar o backend atualizado:

   ```bash
   docker compose up -d aurora-postgres
   docker compose exec aurora-postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /aurora-migrations/V001__chat_aluno_professor.sql -f /aurora-migrations/V002__restringe_objetos_auxiliares.sql'
   docker compose up --build -d
   ```

4. Acesse [localhost:5173](http://localhost:5173). O estado da API está em [localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health).
5. Para encerrar os serviços e preservar o volume, use `docker compose down`.

O esquema inicial não inclui usuários. Em banco novo, o responsável deve gerar um hash BCrypt offline com `htpasswd -nBC 12 aurora`, copiar a parte após `aurora:` e inserir o primeiro `SUPER_ADMIN` em `public.users` com nome, e-mail, `organization_key` e o hash no campo `password`. Em seguida, cadastre uma solicitação de administrador pela tela de registro, aprove no painel do superadministrador e use o administrador para criar turmas, disciplinas, professores e alunos. Bancos existentes continuam usando os mesmos usuários.

## Desenvolvimento sem Docker

Prepare o PostgreSQL 15+ com `database/supabase_schema.sql` se o banco estiver vazio e aplique os arquivos de `database/migrations` em ordem. Exporte `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` no terminal do backend. Spring Boot lê as variáveis do processo.

```bash
mvn -f backend/pom.xml spring-boot:run
```

No outro terminal, com Node.js 22.13+ da linha 22 ou Node.js 24+:

```bash
cd frontend
npm ci
npm run dev
```

O Vite encaminha `/api` à porta 8080 em desenvolvimento. Use `AURORA_DEV_BACKEND` para mudar o destino local.

## Mensagens

Alunos e professores usam o botão **Mensagens Aurora** nos respectivos painéis. Os contatos correspondem aos perfis ativos da mesma organização cujo vínculo de turma consta no cadastro do professor e do aluno. Uma dupla compartilha uma conversa persistente. O backend revalida o vínculo ao listar, abrir e enviar mensagens. Se o vínculo mudar, os registros continuam no banco e o acesso depende do vínculo atual.

O painel do superadministrador continua recebendo atendimentos de suporte. A lista de atendimentos mantém a janela de sete dias pela data de abertura. As conversas diretas ficam fora dessa janela e seus históricos são recuperados em lotes. A aba aberta atualiza a lista e busca novas mensagens a cada quatro segundos após concluir a consulta anterior.

## Testes

```bash
mvn -f backend/pom.xml clean verify
cd frontend
npm ci
npm run typecheck
npm run lint
npm run build
npm audit
```

Os testes do backend usam H2 por padrão. Para repetir os testes dos fluxos escolares sobre PostgreSQL, aplique o esquema e as migrations em um banco **isolado**, defina `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` e `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` para esse banco e execute `mvn -f backend/pom.xml -Dtest=SchoolFlowsTest test`. A suíte cria registros de teste.

## Publicação

O documento acadêmico está em [docs/Documentação.pdf](docs/Documenta%C3%A7%C3%A3o.pdf).

## Direitos autorais

© 2026 Bruno Romano Kimura, Caíque Carneiro Guiraldello, Daniel Ferriani de Chico e João Pedro Braga. Consulte [LICENSE](LICENSE) para os termos do projeto.
