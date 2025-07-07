# 🚀 SCRIPT DE PREPARACIÓN PARA GITHUB - WINDOWS
# Este script prepara el proyecto para subir a GitHub

Write-Host "🚀 Preparando VC Laminations Database para GitHub..." -ForegroundColor Green

# 1. Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directorio correcto encontrado" -ForegroundColor Green

# 2. Limpiar archivos innecesarios
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow

# Remover logs si existen
Remove-Item -Path "*.log", "npm-debug.log*", "yarn-debug.log*", "yarn-error.log*" -Force -ErrorAction SilentlyContinue

# Remover archivos temporales
Remove-Item -Path ".tmp", "temp", "*.tmp", "*.temp" -Recurse -Force -ErrorAction SilentlyContinue

# Remover archivos de sistema
Remove-Item -Path ".DS_Store", "Thumbs.db" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Archivos temporales limpiados" -ForegroundColor Green

# 3. Verificar .gitignore
Write-Host "📁 Verificando .gitignore..." -ForegroundColor Yellow
if (-not (Test-Path ".gitignore")) {
    Write-Host "❌ Error: .gitignore no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar que csv/ esté en .gitignore
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -match "csv/") {
    Write-Host "✅ Carpeta csv/ está correctamente excluida" -ForegroundColor Green
} else {
    Write-Host "⚠️  Advertencia: csv/ no está en .gitignore" -ForegroundColor Yellow
}

# 4. Verificar archivos esenciales
Write-Host "📋 Verificando archivos esenciales..." -ForegroundColor Yellow

$essentialFiles = @(
    "package.json",
    "index.html",
    "main.js",
    "styles.css",
    "server.js",
    "manifest.json",
    "service-worker.js",
    "offline.html",
    "README.md"
)

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NO encontrado" -ForegroundColor Red
    }
}

# 5. Verificar documentación
Write-Host "📚 Verificando documentación..." -ForegroundColor Yellow

$docs = @(
    "ROADMAP.md",
    "CHANGELOG.md",
    "TODO-SEMANA.md",
    "CONFIG.md",
    "TERMINOLOGIA.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✅ $doc encontrado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $doc NO encontrado" -ForegroundColor Yellow
    }
}

# 6. Crear estructura de ejemplo para csv/
Write-Host "📁 Preparando carpeta csv/ de ejemplo..." -ForegroundColor Yellow
if (-not (Test-Path "csv")) {
    New-Item -ItemType Directory -Path "csv" -Force | Out-Null
}

# Verificar que existe README.md en csv/
if (-not (Test-Path "csv/README.md")) {
    Write-Host "⚠️  csv/README.md no encontrado" -ForegroundColor Yellow
}

# 7. Verificar que no hay datos sensibles (búsqueda básica)
Write-Host "🔒 Verificando ausencia de datos sensibles..." -ForegroundColor Yellow

$sensitivePatterns = @("password", "secret", "key", "token")
$sensitiveFound = $false

foreach ($pattern in $sensitivePatterns) {
    $files = Get-ChildItem -Recurse -Include "*.js", "*.html", "*.json" | 
             Where-Object { $_.FullName -notmatch "node_modules|\.git" } |
             Select-String -Pattern $pattern -CaseSensitive:$false
    
    if ($files) {
        Write-Host "⚠️  Posible dato sensible encontrado: $pattern" -ForegroundColor Yellow
        $sensitiveFound = $true
    }
}

if (-not $sensitiveFound) {
    Write-Host "✅ No se encontraron datos sensibles obvios" -ForegroundColor Green
}

# 8. Mostrar resumen
Write-Host ""
Write-Host "📊 RESUMEN DE PREPARACIÓN:" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Contar archivos que se subirán (excluir node_modules, .git, csv/*.csv)
$filesToUpload = Get-ChildItem -Recurse -File | 
                 Where-Object { 
                     $_.FullName -notmatch "node_modules|\.git|csv\\.*\.csv|\.log$|\.DS_Store$|Thumbs\.db$"
                 }

Write-Host "📁 Total de archivos a subir: $($filesToUpload.Count)" -ForegroundColor Cyan

# Calcular tamaño aproximado
$totalSize = ($filesToUpload | Measure-Object -Property Length -Sum).Sum
$sizeInMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "📦 Tamaño aproximado: $sizeInMB MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 COMANDOS PARA SUBIR A GITHUB:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "git init" -ForegroundColor White
Write-Host "git add ." -ForegroundColor White
Write-Host 'git commit -m "🚀 Initial commit: VC Laminations Database v1.1.0 with PWA"' -ForegroundColor White
Write-Host "git branch -M main" -ForegroundColor White
Write-Host "git remote add origin https://github.com/TUUSUARIO/vc-laminations-database.git" -ForegroundColor White
Write-Host "git push -u origin main" -ForegroundColor White

Write-Host ""
Write-Host "✅ Preparación completada. El proyecto está listo para GitHub!" -ForegroundColor Green
Write-Host "⚠️  RECUERDA: Reemplaza TUUSUARIO con tu nombre de usuario de GitHub" -ForegroundColor Yellow

# Pausa para que el usuario pueda leer
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
