# Aurora Backend

## Requisitos

- Java 21
- Maven 3.9+
- MySQL 8 ou MariaDB 10.5+

## Executar

1. Crie o banco seguindo [../database/README.md](../database/README.md).
2. Se a senha do banco não for `root`, defina `DB_PASSWORD` no terminal.
3. Compile e teste:

```powershell
mvn clean test
```

4. Inicie a API:

```powershell
mvn spring-boot:run
```

A API fica em `http://localhost:8080/api`. O prefixo `/api` vem de
`server.servlet.context-path`.

Variáveis aceitas: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `JWT_SECRET`.

Exemplo no PowerShell:

```powershell
$env:DB_PASSWORD = "sua senha"
$env:DB_USERNAME = "aurora_user"
mvn spring-boot:run
```