# Aurora School System - Database Setup

## Visão Geral

Este diretório contém os scripts SQL para inicializar e gerenciar o banco de dados do Sistema Aurora de Escolas.

## Estrutura de Arquivos

- **supabase_schema.sql** - Schema PostgreSQL usado pelo Aurora

## Produção com Supabase

1. Crie um projeto em supabase.com e abra o SQL Editor.
2. Execute [supabase_schema.sql](supabase_schema.sql) inteiro.
3. Em Project Settings, copie a conexão **Transaction Pooler** (porta `6543`).
4. Configure no backend `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET` usando [backend/.env.example](../backend/.env.example).
5. Mantenha `spring.jpa.hibernate.ddl-auto=validate`; alterações futuras devem ser SQL versionado, nunca DDL automático.
6. Crie o primeiro Super Admin diretamente no banco com uma senha BCrypt gerada pela aplicação. O site não cadastra Super Admin.

O backend usa uma conexão privada com o banco e aplica o `organization_key` em todas as consultas de domínio. Não exponha a senha do banco, `service_role` ou `JWT_SECRET` no Vercel/frontend.

## Requisitos locais

- PostgreSQL 16+
- Permissões de root ou sudo para criar banco de dados

## Instalação local

### 1. Criar Banco de Dados

Para desenvolvimento local, use o PostgreSQL do Docker Compose. Para produção,
execute `supabase_schema.sql` no SQL Editor do Supabase:

```powershell
docker compose up -d aurora-postgres backend
docker compose ps
```

Depois configure as variáveis e inicie o backend com:

```powershell
$env:DB_USERNAME = "aurora_user"
$env:DB_PASSWORD = "senha_forte_aqui"
mvn spring-boot:run
```

### Comandos úteis

```bash
# Backup PostgreSQL local
pg_dump -U aurora aurora_db > backup_$(date +%Y%m%d_%H%M%S).sql