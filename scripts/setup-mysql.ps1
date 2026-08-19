<#
Setup MySQL for Aurora project (Windows PowerShell)

Options:
- Docker: create container `aurora-mysql` and optionally import SQL on first run (mounts ./database)
- Local: import using local `mysql` client

Usage: run this script in PowerShell from the project root (where the `database` folder is).
       .\scripts\setup-mysql.ps1
#>

function Write-Header($text){
    Write-Host "`n=== $text ===`n" -ForegroundColor Cyan
}

function Check-Command($cmd){
    try{ Get-Command $cmd -ErrorAction Stop | Out-Null; return $true }
    catch{ return $false }
}

function Run-DockerSetup([switch]$ResetVolume){
    Write-Header "Docker MySQL setup"

    if (-not (Check-Command docker)){
        Write-Error "Docker não encontrado. Instale o Docker Desktop ou escolha a opção Local."; return
    }

    $pwdPath = (Resolve-Path .).Path
    $dbPath = Join-Path $pwdPath 'database'
    if (-not (Test-Path $dbPath)){
        Write-Error "Pasta 'database' não encontrada em: $pwdPath"; return
    }

    if ($ResetVolume){
        Write-Host "Removendo container e volume (perigoso: apaga dados)..." -ForegroundColor Yellow
        docker rm -f aurora-mysql 2>$null | Out-Null
        docker volume rm aurora_mysql_data 2>$null | Out-Null
    }
    else {
        # remove container if exists (keeps volume)
        docker rm -f aurora-mysql 2>$null | Out-Null
    }

    # Run container and mount the project's database folder into entrypoint init dir
    $mount = "$dbPath:/docker-entrypoint-initdb.d:ro"
    $cmd = @(
        'docker','run', '--name','aurora-mysql', '-e','MYSQL_ROOT_PASSWORD=root', '-e','MYSQL_DATABASE=aurora_db', '-p','3306:3306', '-v', $mount, '-v', 'aurora_mysql_data:/var/lib/mysql', '-d', 'mysql:8.0'
    )

    Write-Host "Executando: docker run (isso inicializa o MySQL e executa os scripts em /docker-entrypoint-initdb.d se o volume for novo)..."
    & docker run --name aurora-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=aurora_db -p 3306:3306 -v "$dbPath:/docker-entrypoint-initdb.d:ro" -v aurora_mysql_data:/var/lib/mysql -d mysql:8.0

    Write-Host "Aguardando container subir..." -ForegroundColor Green
    Start-Sleep -Seconds 6
    docker logs -n 200 aurora-mysql | Select-String 'ready for connections' -Quiet | Out-Null
    Write-Host "Verificando bancos e tabelas:"
    docker exec -it aurora-mysql mysql -u root -proot -e "SHOW DATABASES; USE aurora_db; SHOW TABLES;"
}

function Run-DockerManualImport(){
    Write-Header "Importar SQL para container existente"
    if (-not (Check-Command docker)){
        Write-Error "Docker não encontrado."; return
    }
    if (-not (Get-Process -Name docker -ErrorAction SilentlyContinue)){
        # not strictly necessary; docker CLI may work even if UI not running
        Write-Host "Certifique-se que o Docker está rodando." -ForegroundColor Yellow
    }

    $pwdPath = (Resolve-Path .).Path
    $schema = Join-Path $pwdPath 'database\schema.sql'
    $init = Join-Path $pwdPath 'database\init.sql'
    if (-not (Test-Path $schema) -or -not (Test-Path $init)){
        Write-Error "Arquivos schema.sql ou init.sql não encontrados em $pwdPath\database"; return
    }

    Write-Host "Copiando e importando arquivos para container..."
    docker cp $schema aurora-mysql:/tmp/schema.sql
    docker cp $init aurora-mysql:/tmp/init.sql

    # Import using cat-like behavior
    Get-Content $schema -Raw | docker exec -i aurora-mysql mysql -u root -proot
    Get-Content $init -Raw | docker exec -i aurora-mysql mysql -u root -proot

    Write-Host "Import concluído. Verificando tabelas:"
    docker exec -it aurora-mysql mysql -u root -proot -e "USE aurora_db; SHOW TABLES;"
}

function Run-LocalImport(){
    Write-Header "Importar SQL local (MySQL instalado no Windows)"
    if (-not (Check-Command mysql)){
        Write-Error "Cliente 'mysql' não encontrado no PATH. Instale MySQL ou adicione o bin ao PATH."; return
    }

    $pwdPath = (Resolve-Path .).Path
    $schema = Join-Path $pwdPath 'database\schema.sql'
    $init = Join-Path $pwdPath 'database\init.sql'
    if (-not (Test-Path $schema) -or -not (Test-Path $init)){
        Write-Error "Arquivos schema.sql ou init.sql não encontrados em $pwdPath\database"; return
    }

    Write-Host "Importando schema.sql..."
    & mysql -u root -proot < $schema
    Write-Host "Importando init.sql..."
    & mysql -u root -proot < $init

    Write-Host "Verificando tabelas..."
    & mysql -u root -proot -e "SHOW DATABASES; USE aurora_db; SHOW TABLES;"
}

function Show-Menu(){
    Write-Header "Setup MySQL - Aurora"
    Write-Host "Escolha uma opção:"`n
    Write-Host "1) Instalar/rodar MySQL com Docker (monta ./database para execução inicial)"
    Write-Host "2) Importar manualmente para container Docker existente"
    Write-Host "3) Importar localmente (MySQL instalado no Windows)"
    Write-Host "4) Verificar status do container (docker)"
    Write-Host "5) Sair"

    $opt = Read-Host "Opção"
    switch ($opt){
        '1' { Run-DockerSetup }
        '2' { Run-DockerManualImport }
        '3' { Run-LocalImport }
        '4' {
            if (Check-Command docker){ docker ps -a --filter "name=aurora-mysql" }
            else { Write-Error "Docker não instalado." }
        }
        default { Write-Host "Saindo..." }
    }
}

# Run menu
Show-Menu
