# Base de Datos de Laminaciones - VC Laminations

Sistema web para consulta de especificaciones técnicas de laminaciones industriales.

## 🏭 Descripción

Esta aplicación web permite consultar y gestionar una base de datos de laminaciones utilizadas en la fabricación de transformadores y motores eléctricos para VC Laminations.

## ✨ Características

- **Consulta de laminaciones**: Búsqueda avanzada por empresa y número de parte
- **Interfaz moderna**: Diseño responsivo con glassmorphism
- **Registro de producción**: Sistema para que las naves industriales registren producción
- **Paginación eficiente**: Navegación optimizada de grandes volúmenes de datos
- **API RESTful**: Endpoints bien documentados para integración

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Base de Datos**: MySQL
- **Otras**: CORS, CSV Parser

## 📁 Estructura del Proyecto

```
vc-laminations-database/
├── .github/
│   └── copilot-instructions.md    # Instrucciones para Copilot
├── csv/                           # Archivos CSV con datos (opcional)
├── index.html                     # Página principal
├── main.js                        # Lógica del frontend
├── server.js                      # Servidor Express
├── styles.css                     # Estilos CSS
├── package.json                   # Dependencias del proyecto
├── .gitignore                     # Archivos a ignorar en Git
└── README.md                      # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- MySQL Server
- Git

### Pasos de Instalación

1. **Clona el repositorio**:
```bash
git clone https://github.com/tu-usuario/vc-laminations-database.git
cd vc-laminations-database
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Configura la base de datos MySQL**:
```sql
CREATE DATABASE produccion;
USE produccion;

-- Crear tabla de laminaciones (ajustar según tus datos)
CREATE TABLE laminaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa VARCHAR(255),
    numero VARCHAR(255),
    laminacion_vcl VARCHAR(255),
    troquel VARCHAR(255),
    prensa_1 VARCHAR(255),
    peso_pieza_kg DECIMAL(10,3)
);
```

4. **Configura las variables de entorno** (opcional):
```bash
# Crear archivo .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=produccion
PORT=3000
```

5. **Inicia el servidor**:
```bash
npm start
```

6. **Abre tu navegador** en `http://localhost:3000`

## 📊 Uso del Sistema

### Consulta de Laminaciones
1. Utiliza los filtros de empresa y número de parte
2. Haz clic en "Buscar" para aplicar filtros
3. Navega por los resultados usando la paginación
4. Haz clic en "Ver Detalles" para información completa

### Registro de Producción
1. Haz clic en "Registrar Producción"
2. Completa el formulario con:
   - Empresa
   - Número de parte
   - Kilos producidos (obligatorio)
   - Cantidad de alambres (opcional)
   - Libras (opcional)
   - Notas adicionales (opcional)
3. Haz clic en "Registrar Producción"

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm start          # Inicia el servidor en producción
npm run dev        # Inicia el servidor con nodemon (desarrollo)
npm run import-data # Importa datos desde archivos CSV
```

### API Endpoints

- `GET /api/stats` - Obtiene estadísticas generales
- `GET /api/empresas` - Lista de empresas
- `GET /api/laminaciones` - Consulta de laminaciones con filtros
- `POST /api/produccion` - Registra nueva producción
- `GET /api/produccion` - Consulta registros de producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es propiedad de VC Laminations. Todos los derechos reservados.

## 📞 Contacto

- **Empresa**: VC Laminations
- **Desarrollador**: Patricio Simon
- **Email**: psimon@vclaminations.com

---

© 2025 VC Laminations. Todos los derechos reservados.
