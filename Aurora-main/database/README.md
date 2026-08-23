# 📊 Aurora School System - Database Setup

## Visão Geral

Este diretório contém os scripts SQL para inicializar e gerenciar o banco de dados do Sistema Aurora de Escolas.

## Estrutura de Arquivos

- **schema.sql** - Criação das tabelas, índices e constraints
- **init.sql** - Dados iniciais para testes e demo

## Requisitos

- MySQL 8.0+
- MariaDB 10.5+
- Permissões de root ou sudo para criar banco de dados

## Instalação no Windows

### 1. Criar Banco de Dados

No MySQL Workbench, abra `schema.sql`, execute o script inteiro e depois execute
`init.sql`. Se o cliente de linha de comando estiver instalado, use PowerShell:

```powershell
mysql.exe -u root -p < schema.sql
mysql.exe -u root -p aurora_db < init.sql
mysql.exe -u root -p -e "USE aurora_db; SHOW TABLES;"
```

O serviço precisa estar iniciado. No Windows, verifique em `services.msc` ou
com `Get-Service MySQL*`.

### Usuário da aplicação

```sql
CREATE USER 'aurora_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON aurora_db.* TO 'aurora_user'@'localhost';
FLUSH PRIVILEGES;
```

Depois inicie o backend com:

```powershell
$env:DB_USERNAME = "aurora_user"
$env:DB_PASSWORD = "senha_forte_aqui"
mvn spring-boot:run
```

### Comandos úteis

```bash
# Opção 1: Via MySQL CLI
mysql -u root -p < schema.sql

# Opção 2: Manualmente
mysql -u root -p
mysql> source schema.sql;

# Opção 1: Via MySQL CLI
mysql -u root -p aurora_db < init.sql

# Opção 2: Manualmente
mysql -u root -p
mysql> use aurora_db;
mysql> source init.sql;

# Verificar instalação
mysql -u root -p -e "USE aurora_db; SHOW TABLES;"

# Credênciais demo
Tipo	   | Email	                    | Senha
------------------------------------------------------
SuperAdmin | superadmin@escola.com	    | Super@Admin1
Admin	   | helena.costa@escola.com	| admin123
Teacher    | carlos.oliveira@escola.com | Sprof123
Student    | maria.silva@escola.com	    | aluno123

# Backup completo
mysqldump -u root -p aurora_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas da estrutura
mysqldump -u root -p --no-data aurora_db > structure_backup.sql

# Backup apenas dos dados
mysqldump -u root -p --no-create-info aurora_db > data_backup.sql

# Restaurar backup completo
mysql -u root -p aurora_db < backup_20240101_120000.sql

# Restaurar apenas estrutura
mysql -u root -p aurora_db < structure_backup.sql

# Otimizar tabelas
mysql -u root -p aurora_db -e "OPTIMIZE TABLE users; OPTIMIZE TABLE students; OPTIMIZE TABLE grades;"

# Verificar Integridade
mysql -u root -p aurora_db -e "CHECK TABLE users; CHECK TABLE students; CHECK TABLE grades;"

# Ver tamanho do banco
mysql -u root -p -e "SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.TABLES WHERE table_schema = 'aurora_db';"

# Alterar senha do root
mysql -u root -p
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha_forte';
mysql> FLUSH PRIVILEGES;

# Criar usuário de aplicação
mysql -u root -p
mysql> CREATE USER 'aurora_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
mysql> GRANT ALL PRIVILEGES ON aurora_db.* TO 'aurora_user'@'localhost';
mysql> FLUSH PRIVILEGES;

# Verificar conexão
mysql -h localhost -u root -p

# Reset de senha (MySQL 8.0)
sudo /usr/sbin/mysqld --skip-grant-tables
mysql -u root
mysql> FLUSH PRIVILEGES;
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';

# Verificar se o serviço está rodando
sudo systemctl status mysql

# Reiniciar serviço
sudo systemctl restart mysql