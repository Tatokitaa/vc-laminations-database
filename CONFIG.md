# ⚙️ CONFIGURACIÓN DEL PROYECTO
## VC Laminations Database - Settings y Variables

---

## 🔧 CONFIGURACIÓN ACTUAL

### 📊 Base de Datos
```
Host: localhost
Puerto: 3306
Database: produccion
Usuario: root
Password: admin (configurable via ENV)
```

### 🌐 Servidor
```
Puerto: 3000
CORS: Habilitado
Static Files: Servidos desde raíz
API Base: /api/
```

### 📱 PWA
```
App Name: VC Laminations Database
Short Name: VC Laminaciones
Theme Color: #667eea
Background: #667eea
Display: standalone
Start URL: /
```

---

## 🔄 VARIABLES DE ENTORNO

### Configuración Opcional (.env)
```env
# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=produccion

# Servidor
PORT=3000
NODE_ENV=production

# PWA
APP_NAME=VC Laminations Database
THEME_COLOR=#667eea

# Cache
CACHE_VERSION=v1.0.0
CACHE_DURATION=86400
```

### Variables por Defecto
- DB_HOST: localhost
- DB_USER: root
- DB_PASSWORD: admin
- DB_NAME: produccion
- PORT: 3000

---

## 📂 ESTRUCTURA DE ARCHIVOS

### Archivos Core
```
├── index.html          # Página principal
├── main.js            # Lógica del frontend
├── styles.css         # Estilos CSS
├── server.js          # Servidor Express
├── manifest.json      # Configuración PWA
├── service-worker.js  # Cache offline
├── offline.html       # Página sin conexión
└── package.json       # Dependencias
```

### Archivos de Datos
```
csv/
├── ejemplo.csv
├── prueba base de datos - ALTRAN.csv
├── prueba base de datos - AMETEK PITTMAN.csv
├── ...                # 21 archivos CSV total
```

### Documentación
```
├── README.md          # Guía principal
├── ROADMAP.md         # Plan de desarrollo
├── TODO-SEMANA.md     # Tareas inmediatas
├── CHANGELOG.md       # Historial de cambios
├── CONFIG.md          # Este archivo
└── TERMINOLOGIA.md    # Glosario técnico
```

---

## 🚀 CONFIGURACIÓN DE DESARROLLO

### Dependencias Instaladas
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "csv-parser": "^3.2.0",
    "express": "^4.18.2",
    "iconv-lite": "^0.6.3",
    "mysql2": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Scripts NPM
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "import-data": "node import-csv.js"
}
```

### Próximas Dependencias (DÍA 3)
```bash
npm install jspdf html2canvas
```

---

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### Service Worker
```javascript
// Cache scope limitado
const CACHE_NAME = 'vc-laminations-v1.0.0';
// Solo archivos específicos en cache
const CRITICAL_FILES = [...];
```

### CORS
```javascript
// Habilitado para desarrollo
app.use(cors());
// TODO: Configurar origins específicos en producción
```

### Headers de Seguridad (Futuro)
```javascript
// Content Security Policy
// X-Frame-Options
// X-Content-Type-Options
```

---

## 📱 CONFIGURACIÓN PWA

### Manifest.json
```json
{
  "name": "VC Laminations Database",
  "short_name": "VC Laminaciones",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#667eea",
  "theme_color": "#667eea"
}
```

### Service Worker Cache
```javascript
// Estrategias de cache
API: Network First con fallback
Static: Cache First
Critical: Cache First
```

---

## 🎨 CONFIGURACIÓN DE TEMA

### Variables CSS
```css
:root {
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --text-primary: #2c3e50;
  --accent-primary: #3498db;
  --glassmorphism-bg: rgba(255, 255, 255, 0.9);
}

[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --text-primary: #ffffff;
  --glassmorphism-bg: rgba(22, 33, 62, 0.9);
}
```

### Breakpoints Responsive
```css
/* Tablets */
@media (max-width: 1024px)

/* Mobile */
@media (max-width: 768px)

/* Small Mobile */
@media (max-width: 480px)

/* Tiny Mobile */
@media (max-width: 320px)
```

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### Tablas Principales
```sql
-- Tabla de laminaciones
CREATE TABLE laminaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  empresa VARCHAR(255),
  numero_parte VARCHAR(255),
  od DECIMAL(10,3),
  id_inner DECIMAL(10,3),
  stack_height DECIMAL(10,3),
  -- ... más campos
);

-- Tabla de producción
CREATE TABLE produccion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  laminacion_id INT,
  empresa VARCHAR(255),
  numero_parte VARCHAR(255),
  kilos DECIMAL(10,2),
  alambres INT,
  libras DECIMAL(10,2),
  notas TEXT,
  fecha_produccion TIMESTAMP,
  FOREIGN KEY (laminacion_id) REFERENCES laminaciones(id)
);
```

### Índices Recomendados
```sql
-- Para búsquedas rápidas
CREATE INDEX idx_empresa ON laminaciones(empresa);
CREATE INDEX idx_numero_parte ON laminaciones(numero_parte);
CREATE INDEX idx_empresa_parte ON laminaciones(empresa, numero_parte);

-- Para producción
CREATE INDEX idx_fecha_produccion ON produccion(fecha_produccion);
```

---

## 🔧 CONFIGURACIÓN DE DESARROLLO

### Git Hooks (Futuro)
```bash
# Pre-commit
- Linting CSS/JS
- Testing básico
- Verificación de archivos

# Pre-push
- Testing completo
- Build verification
```

### Testing
```javascript
// Manual testing en navegadores
- Chrome (PWA testing)
- Firefox (Responsive)
- Edge (Compatibility)
- Safari Mobile (iOS)

// Herramientas
- Lighthouse (Performance)
- DevTools (Debugging)
- Network throttling (Offline)
```

---

## 📈 CONFIGURACIÓN DE MONITOREO

### Métricas a Trackear (Futuro)
```javascript
// Performance
- Page load time
- API response time
- Service Worker hit rate
- Cache efficiency

// Usage
- PWA installs
- Offline usage
- Most searched companies
- Popular features

// Errors
- Console errors
- Network failures
- Service Worker errors
```

### Logging
```javascript
// Console levels
console.log('[PWA]', message);
console.error('[ERROR]', error);
console.warn('[WARNING]', warning);
```

---

## 🚀 CONFIGURACIÓN DE PRODUCCIÓN

### Optimizaciones Futuras
```javascript
// Minificación
- CSS compression
- JS minification
- Image optimization

// CDN
- Static assets
- Logo/images
- CSS/JS files

// Database
- Connection pooling
- Query optimization
- Indexing strategy
```

### Environment Variables
```bash
# Producción
NODE_ENV=production
DB_HOST=production-server
DB_PASSWORD=secure-password
CACHE_DURATION=604800

# Desarrollo
NODE_ENV=development
DEBUG=true
HOT_RELOAD=true
```

---

## 📋 CHECKLIST DE CONFIGURACIÓN

### Desarrollo Local
- [x] Node.js instalado
- [x] MySQL configurado
- [x] Dependencias instaladas
- [x] Base de datos creada
- [x] Datos importados
- [x] PWA funcionando

### Próximos Pasos
- [ ] Variables de entorno configuradas
- [ ] jsPDF instalado (DÍA 3)
- [ ] Testing automatizado
- [ ] CI/CD pipeline
- [ ] Monitoreo de errores
- [ ] Backup automático

---

**Última actualización**: 7 de Julio, 2025
**Configuración actual**: v1.1.0 (PWA Básica)
**Próxima configuración**: v1.2.0 (Búsqueda Avanzada)
