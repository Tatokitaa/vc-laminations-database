# Terminología de Laminaciones - VC Laminations Database

## Conceptos Clave

### Alambre
En la industria de laminaciones, un **"alambre"** es una unidad de agrupación estándar para las piezas. 

- **NO es** el material físico alambre
- **ES** una unidad de medida/agrupación como "docena" o "ciento"
- Se venden las laminaciones por "alambres"
- Cada alambre contiene un número específico de piezas individuales

### Ejemplos:
- "Este producto se vende en alambres de 50 piezas"
- "El pedido es de 10 alambres" (= 500 piezas si cada alambre tiene 50 piezas)
- "Un alambre pesa 2.5 kg" (peso total de todas las piezas en esa unidad)

### Campos Relacionados:
- **piezas_por_alambre**: Cuántas piezas individuales forman un alambre
- **peso_alambre_kg**: Peso total de todas las piezas que forman un alambre
- **alambres_stacks_por_caja**: Cuántos alambres caben en una caja
- **cantidad_alambres**: En producción, cuántos alambres se produjeron

### Cálculos Típicos:
- Total de piezas = alambres × piezas_por_alambre
- Peso total = alambres × peso_alambre_kg
- Piezas por caja = alambres_por_caja × piezas_por_alambre

## Nota para Desarrolladores
Siempre referirse a "alambre" como unidad de agrupación, no como material. 
Las etiquetas en la interfaz deben ser claras: "Alambres (unidades)" o "Piezas por Alambre (unidad)".
