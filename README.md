# Aurora

### Feito Por:
- Daniel Ferriani de Chico
- Bruno Romano Kimura
- João Pedro Braga
- Thomaz Palma
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
