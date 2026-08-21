# Aurora

### Feito Por:
- Daniel Ferriani de Chico
- Bruno Romano Kimura
- João Pedro Braga
- Thomaz Palma
- Caíque Carneiro
---
## Como ligar o sistema

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
