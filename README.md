# Aurora

## Testar localmente

Com Docker instalado:

```bash
docker compose up --build
```

Abra `http://localhost:5173`. A API local fica em
`http://localhost:8080/api`.

Para desligar:

```bash
docker compose down
```

O banco local é apenas para desenvolvimento. Em produção, use o Supabase.

## Publicar sem deixar o notebook ligado

O Supabase mantém o banco online. O frontend pode ficar na Vercel, mas o
backend Spring Boot também precisa ser publicado em um serviço como Render,
Railway, Fly.io ou servidor próprio.

### 1. Publicar o backend

No serviço escolhido, crie um serviço Docker apontando para este repositório e
configure:

```text
DB_URL=jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require
DB_USERNAME=postgres.hcdvfxhgwtrjiypmzzgm
DB_PASSWORD=senha-do-banco-do-Supabase
JWT_SECRET=uma-chave-aleatoria-grande
CORS_ALLOWED_ORIGINS=https://seu-projeto.vercel.app
```

O serviço deve expor a porta `8080`. Teste a URL pública com:

```bash
curl https://seu-backend.example.com/api/actuator/health
```

O resultado esperado é `{"status":"UP"}`.

### 2. Publicar o frontend na Vercel

1. Entre em `vercel.com` e faça login com GitHub.
2. Clique em **Add New Project**.
3. Importe o repositório `Aurora`.
4. Em **Root Directory**, escolha `frontend`.
5. Framework: Vite.
6. Build command: `npm run build`.
7. Output directory: `dist`.
8. Em **Environment Variables**, adicione:

```text
VITE_API_BASE_URL=https://seu-backend.example.com/api
```

9. Clique em **Deploy**.

Depois copie o domínio gerado pela Vercel e atualize `CORS_ALLOWED_ORIGINS` no
backend. Faça um novo deploy do backend após essa alteração.

Depois disso, o notebook pode ser desligado. A apresentação usará o endereço
da Vercel, o backend hospedado e o banco Supabase.

Não publique `DB_PASSWORD`, `JWT_SECRET` ou `service_role` no frontend, no
GitHub ou em arquivos versionados.
# Aurora

### Feito Por:
- Daniel Ferriani de Chico
- Bruno Romano Kimura
- João Pedro Braga
- Caíque Carneiro
---
## Como ligar o sistema

### Com Docker (recomendado)

Instale o Docker Desktop, abra um terminal na pasta `Aurora` e execute:

```powershell
docker compose up --build
```

Depois abra `http://localhost:5173`. A API estará em
`http://localhost:8080/api`.

Para parar os serviços:

```powershell
docker compose down
```

Para apagar também os dados persistidos do banco e inicializá-lo novamente:

```powershell
docker compose down -v
```

O banco executa `database/schema.sql` e `database/init.sql` automaticamente na
primeira criação do volume. Para trocar a senha padrão, crie um arquivo `.env`
na raiz com `MYSQL_ROOT_PASSWORD=uma_senha` antes de executar o Compose.

### Execução manual

1. Inicie o serviço MySQL e execute `database/schema.sql` seguido de
	`database/init.sql`.
2. Em um terminal, entre em `backend` e execute `mvn spring-boot:run`.
3. Em outro terminal, entre em `frontend`, execute `npm install` e depois
	`npm run dev`.
4. Abra `http://localhost:5173`. O frontend chama a API em
	`http://localhost:8080/api`.

Para outra URL de API, crie `frontend/.env.local` com:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Contas de demonstração e detalhes do banco estão em
[database/README.md](database/README.md).
