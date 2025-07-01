<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# VC Laminations Database - Copilot Instructions

Este es un proyecto de base de datos web para VC Laminations que gestiona especificaciones técnicas de laminaciones industriales.

## Tecnologías del Proyecto

- **Backend**: Node.js con Express.js
- **Base de datos**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Estilo**: Glassmorphism design con gradientes modernos

## Contexto del Negocio

- Sistema para consultar especificaciones de laminaciones para transformadores y motores eléctricos
- Funcionalidad de registro de producción para naves industriales
- Manejo de datos de empresas, números de parte, pesos, dimensiones, etc.

## Convenciones de Código

- Usar async/await para operaciones asíncronas
- Manejar errores apropiadamente con try/catch
- Usar nombres descriptivos en español para variables de negocio
- Mantener separación clara entre frontend y backend
- Seguir principios RESTful para endpoints de API

## Estructura de Base de Datos

- Tabla principal: `laminaciones` con campos como empresa, numero, laminacion_vcl, troquel, etc.
- Tabla de producción: `produccion` para registros de manufactura
- Usar transacciones MySQL cuando sea necesario

## Estilo y UX

- Diseño responsivo con mobile-first approach
- Colores corporativos: azules (#3498db) y gradientes
- Animaciones suaves y transiciones
- Notificaciones toast para feedback del usuario
