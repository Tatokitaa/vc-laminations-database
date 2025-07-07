#!/bin/bash

# 🚀 SCRIPT DE PREPARACIÓN PARA GITHUB
# Este script prepara el proyecto para subir a GitHub

echo "🚀 Preparando VC Laminations Database para GitHub..."

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

echo "✅ Directorio correcto encontrado"

# 2. Limpiar archivos innecesarios
echo "🧹 Limpiando archivos temporales..."

# Remover logs si existen
rm -f *.log npm-debug.log* yarn-debug.log* yarn-error.log*

# Remover archivos temporales
rm -rf .tmp/ temp/ *.tmp *.temp

# Remover archivos de sistema
rm -f .DS_Store Thumbs.db

echo "✅ Archivos temporales limpiados"

# 3. Verificar .gitignore
echo "📁 Verificando .gitignore..."
if [ ! -f ".gitignore" ]; then
    echo "❌ Error: .gitignore no encontrado"
    exit 1
fi

# Verificar que csv/ esté en .gitignore
if grep -q "csv/" .gitignore; then
    echo "✅ Carpeta csv/ está correctamente excluida"
else
    echo "⚠️  Advertencia: csv/ no está en .gitignore"
fi

# 4. Verificar archivos esenciales
echo "📋 Verificando archivos esenciales..."

essential_files=(
    "package.json"
    "index.html"
    "main.js"
    "styles.css"
    "server.js"
    "manifest.json"
    "service-worker.js"
    "offline.html"
    "README.md"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file NO encontrado"
    fi
done

# 5. Verificar documentación
echo "📚 Verificando documentación..."

docs=(
    "ROADMAP.md"
    "CHANGELOG.md"
    "TODO-SEMANA.md"
    "CONFIG.md"
    "TERMINOLOGIA.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ $doc encontrado"
    else
        echo "⚠️  $doc NO encontrado"
    fi
done

# 6. Crear estructura de ejemplo para csv/
echo "📁 Preparando carpeta csv/ de ejemplo..."
if [ ! -d "csv" ]; then
    mkdir csv
fi

# Verificar que existe README.md en csv/
if [ ! -f "csv/README.md" ]; then
    echo "⚠️  csv/README.md no encontrado"
fi

# 7. Verificar que no hay datos sensibles
echo "🔒 Verificando ausencia de datos sensibles..."

sensitive_patterns=(
    "password"
    "secret"
    "key"
    "token"
)

for pattern in "${sensitive_patterns[@]}"; do
    if grep -r -i "$pattern" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" .; then
        echo "⚠️  Posible dato sensible encontrado: $pattern"
    fi
done

# 8. Mostrar resumen
echo ""
echo "📊 RESUMEN DE PREPARACIÓN:"
echo "=========================="

# Contar archivos que se subirán
total_files=$(find . -type f \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./csv/*.csv" \
    ! -name "*.log" \
    ! -name ".DS_Store" \
    ! -name "Thumbs.db" \
    | wc -l)

echo "📁 Total de archivos a subir: $total_files"

# Mostrar tamaño aproximado (sin node_modules y csv)
size=$(du -sh --exclude=node_modules --exclude="csv/*.csv" . | cut -f1)
echo "📦 Tamaño aproximado: $size"

echo ""
echo "🚀 COMANDOS PARA SUBIR A GITHUB:"
echo "================================"
echo "git init"
echo "git add ."
echo "git commit -m \"🚀 Initial commit: VC Laminations Database v1.1.0 with PWA\""
echo "git branch -M main"
echo "git remote add origin https://github.com/TUUSUARIO/vc-laminations-database.git"
echo "git push -u origin main"

echo ""
echo "✅ Preparación completada. El proyecto está listo para GitHub!"
echo "⚠️  RECUERDA: Reemplaza TUUSUARIO con tu nombre de usuario de GitHub"
