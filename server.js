const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuración de base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'produccion'
});

// Probar conexión
db.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

// Servir la página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para obtener estadísticas
app.get('/api/stats', (req, res) => {
    const queries = {
        total_laminaciones: 'SELECT COUNT(*) as count FROM laminaciones',
        total_empresas: 'SELECT COUNT(DISTINCT empresa) as count FROM laminaciones'
    };
    
    let results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, result) => {
            if (err) {
                console.error(`Error en query ${key}:`, err);
                results[key] = 0;
            } else {
                results[key] = result[0].count;
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json({
                    total_laminaciones: results.total_laminaciones,
                    total_empresas: results.total_empresas
                });
            }
        });
    });
});

// Endpoint para obtener lista de empresas
app.get('/api/empresas', (req, res) => {
    const query = 'SELECT DISTINCT empresa FROM laminaciones ORDER BY empresa';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error obteniendo empresas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json(results);
    });
});

// Endpoint para obtener laminaciones con filtros y paginación
app.get('/api/laminaciones', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtros
    const empresa = req.query.empresa;
    const numeroParte = req.query.numero_parte;
    const laminacionVcl = req.query.laminacion_vcl;
    const troquel = req.query.troquel;
    const prensa = req.query.prensa;
    const acero = req.query.acero;
    const pesoMin = req.query.peso_min;
    const pesoMax = req.query.peso_max;
    const espesorMin = req.query.espesor_min;
    const espesorMax = req.query.espesor_max;
    const tipoAlambre = req.query.tipo_alambre;
    const textoLibre = req.query.texto_libre;
    
    let query = 'SELECT * FROM laminaciones';
    let countQuery = 'SELECT COUNT(*) as total FROM laminaciones';
    let conditions = [];
    let params = [];
    
    // Filtros específicos
    if (empresa) {
        conditions.push('empresa = ?');
        params.push(empresa);
    }
    
    if (numeroParte) {
        conditions.push('numero LIKE ?');
        params.push(`%${numeroParte}%`);
    }
    
    if (laminacionVcl) {
        conditions.push('laminacion_vcl LIKE ?');
        params.push(`%${laminacionVcl}%`);
    }
    
    if (troquel) {
        conditions.push('troquel LIKE ?');
        params.push(`%${troquel}%`);
    }
    
    if (prensa) {
        conditions.push('(prensa_1 LIKE ? OR prensa_2 LIKE ? OR prensa_3 LIKE ? OR prensa_4 LIKE ?)');
        params.push(`%${prensa}%`, `%${prensa}%`, `%${prensa}%`, `%${prensa}%`);
    }
    
    if (acero) {
        conditions.push('(acero_1 LIKE ? OR acero_2 LIKE ? OR acero_3 LIKE ?)');
        params.push(`%${acero}%`, `%${acero}%`, `%${acero}%`);
    }
    
    if (pesoMin) {
        conditions.push('peso_pieza_kg >= ?');
        params.push(parseFloat(pesoMin));
    }
    
    if (pesoMax) {
        conditions.push('peso_pieza_kg <= ?');
        params.push(parseFloat(pesoMax));
    }
    
    if (espesorMin) {
        conditions.push('espesor_pulg >= ?');
        params.push(parseFloat(espesorMin));
    }
    
    if (espesorMax) {
        conditions.push('espesor_pulg <= ?');
        params.push(parseFloat(espesorMax));
    }
    
    if (tipoAlambre) {
        conditions.push('tipo_alambre LIKE ?');
        params.push(`%${tipoAlambre}%`);
    }
    
    // Búsqueda por texto libre en múltiples campos
    if (textoLibre) {
        conditions.push(`(
            empresa LIKE ? OR 
            numero LIKE ? OR 
            laminacion_vcl LIKE ? OR 
            troquel LIKE ? OR 
            prensa_1 LIKE ? OR 
            prensa_2 LIKE ? OR 
            prensa_3 LIKE ? OR 
            prensa_4 LIKE ? OR 
            acero_1 LIKE ? OR 
            acero_2 LIKE ? OR 
            acero_3 LIKE ? OR 
            tipo_alambre LIKE ? OR 
            caracteristica_especial LIKE ?
        )`);
        const textoPattern = `%${textoLibre}%`;
        for (let i = 0; i < 13; i++) {
            params.push(textoPattern);
        }
    }
    
    if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
    }
    
    query += ' ORDER BY empresa, numero LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Obtener total de registros
    db.query(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) {
            console.error('Error contando registros:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        // Obtener registros paginados
        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error obteniendo laminaciones:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            
            res.json({
                data: results,
                pagination: {
                    currentPage: page,
                    limit,
                    totalItems: total,
                    totalPages,
                    startItem: offset + 1,
                    endItem: Math.min(offset + limit, total)
                }
            });
        });
    });
});

// Endpoint para obtener detalles de una laminación específica
app.get('/api/laminaciones/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (!id) {
        return res.status(400).json({ error: 'ID de laminación requerido' });
    }
    
    const query = 'SELECT * FROM laminaciones WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error obteniendo detalles de laminación:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Laminación no encontrada' });
        }
        
        res.json(results[0]);
    });
});

// Endpoint para registrar producción
app.post('/api/produccion', (req, res) => {
    const { empresa, numero_parte, kilos, alambres, libras, notas, fecha } = req.body;
    
    // Validar datos obligatorios
    if (!empresa || !numero_parte || !kilos) {
        return res.status(400).json({ 
            error: 'Faltan datos obligatorios',
            message: 'Empresa, número de parte y kilos son obligatorios'
        });
    }
    
    // Verificar si la tabla de producción existe, si no, crearla
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS produccion (
            id INT AUTO_INCREMENT PRIMARY KEY,
            empresa VARCHAR(255) NOT NULL,
            numero_parte VARCHAR(255) NOT NULL,
            kilos DECIMAL(10,2) NOT NULL,
            alambres INT,
            libras DECIMAL(10,2),
            notas TEXT,
            fecha_registro DATE NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creando tabla de producción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        // Insertar registro de producción
        const insertQuery = `
            INSERT INTO produccion (empresa, numero_parte, kilos, alambres, libras, notas, fecha_registro)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [empresa, numero_parte, kilos, alambres, libras, notas, fecha], (err, result) => {
            if (err) {
                console.error('Error insertando producción:', err);
                return res.status(500).json({ error: 'Error al registrar producción' });
            }
            
            res.status(201).json({
                message: 'Producción registrada exitosamente',
                id: result.insertId
            });
        });
    });
});

// Endpoint para obtener registros de producción
app.get('/api/produccion', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const query = `
        SELECT * FROM produccion 
        ORDER BY fecha_creacion DESC 
        LIMIT ? OFFSET ?
    `;
    
    const countQuery = 'SELECT COUNT(*) as total FROM produccion';
    
    // Obtener total de registros
    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error('Error contando producción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const total = countResult[0].total;
        
        // Obtener registros paginados
        db.query(query, [limit, offset], (err, results) => {
            if (err) {
                console.error('Error obteniendo producción:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            
            res.json({
                data: results,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        });
    });
});

// Endpoint para crear nueva laminación
app.post('/api/laminaciones', (req, res) => {
    const {
        empresa,
        numero_parte,
        descripcion_cliente,
        nivel_revision,
        laminacion_vcl,
        referencia,
        troquel,
        paso_troquel_mm,
        prensa_1,
        placas_paralelas,
        stackers,
        bandas,
        prensa_2,
        placas_paralelas_2,
        stackers_2,
        bandas_2,
        prensa_3,
        placas_paralelas_3,
        stackers_3,
        bandas_3,
        prensa_4,
        placas_paralelas_4,
        stackers_4,
        bandas_4,
        long_corte_alambre,
        cal_alambre,
        tipo_alambre,
        lubricante,
        horneado,
        acero_1,
        acero_2,
        acero_3,
        espesor_pulg,
        ancho_cinta_pulg,
        peso_pieza_kg,
        long_alambre_stack_final_pulg,
        piezas_por_alambre,
        peso_alambre_kg,
        tamano_caja,
        alambres_stacks_por_caja,
        tamano_tarima,
        tipo_tarima,
        caracteristica_especial
    } = req.body;

    // Validaciones básicas
    if (!empresa || !numero_parte) {
        return res.status(400).json({ 
            error: 'Empresa y número de parte son campos requeridos' 
        });
    }

    // Obtener el siguiente número secuencial para la empresa
    const getNextNumeroQuery = 'SELECT COALESCE(MAX(numero), 0) + 1 as next_numero FROM laminaciones WHERE empresa = ?';
    
    db.query(getNextNumeroQuery, [empresa], (err, result) => {
        if (err) {
            console.error('Error obteniendo siguiente número:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const nextNumero = result[0].next_numero;

        const insertQuery = `
            INSERT INTO laminaciones (
                empresa, numero, numero_parte, descripcion_cliente, nivel_revision,
                laminacion_vcl, referencia, troquel, paso_troquel_mm,
                prensa_1, placas_paralelas, stackers, bandas,
                prensa_2, placas_paralelas_2, stackers_2, bandas_2,
                prensa_3, placas_paralelas_3, stackers_3, bandas_3,
                prensa_4, placas_paralelas_4, stackers_4, bandas_4,
                long_corte_alambre, cal_alambre, tipo_alambre, lubricante, horneado,
                acero_1, acero_2, acero_3,
                espesor_pulg, ancho_cinta_pulg, peso_pieza_kg,
                long_alambre_stack_final_pulg, piezas_por_alambre, peso_alambre_kg,
                tamano_caja, alambres_stacks_por_caja, tamano_tarima, tipo_tarima,
                caracteristica_especial, fecha_creacion, creado_por, activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Sistema Web', 'S')
        `;

        const values = [
            empresa, nextNumero, numero_parte, descripcion_cliente, nivel_revision,
            laminacion_vcl, referencia, troquel, paso_troquel_mm,
            prensa_1, placas_paralelas, stackers, bandas,
            prensa_2, placas_paralelas_2, stackers_2, bandas_2,
            prensa_3, placas_paralelas_3, stackers_3, bandas_3,
            prensa_4, placas_paralelas_4, stackers_4, bandas_4,
            long_corte_alambre, cal_alambre, tipo_alambre, lubricante, horneado,
            acero_1, acero_2, acero_3,
            espesor_pulg, ancho_cinta_pulg, peso_pieza_kg,
            long_alambre_stack_final_pulg, piezas_por_alambre, peso_alambre_kg,
            tamano_caja, alambres_stacks_por_caja, tamano_tarima, tipo_tarima,
            caracteristica_especial
        ];

        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error insertando laminación:', err);
                return res.status(500).json({ error: 'Error al crear laminación' });
            }

            res.status(201).json({
                message: 'Laminación creada exitosamente',
                id: result.insertId,
                numero: nextNumero,
                empresa: empresa
            });
        });
    });
});

// Endpoint para obtener opciones de filtros
app.get('/api/filter-options', (req, res) => {
    const queries = {
        prensas: `
            SELECT DISTINCT prensa_1 as prensa FROM laminaciones WHERE prensa_1 IS NOT NULL AND prensa_1 != ''
            UNION
            SELECT DISTINCT prensa_2 as prensa FROM laminaciones WHERE prensa_2 IS NOT NULL AND prensa_2 != ''
            UNION
            SELECT DISTINCT prensa_3 as prensa FROM laminaciones WHERE prensa_3 IS NOT NULL AND prensa_3 != ''
            UNION
            SELECT DISTINCT prensa_4 as prensa FROM laminaciones WHERE prensa_4 IS NOT NULL AND prensa_4 != ''
            ORDER BY prensa
        `,
        aceros: `
            SELECT DISTINCT acero_1 as acero FROM laminaciones WHERE acero_1 IS NOT NULL AND acero_1 != ''
            UNION
            SELECT DISTINCT acero_2 as acero FROM laminaciones WHERE acero_2 IS NOT NULL AND acero_2 != ''
            UNION
            SELECT DISTINCT acero_3 as acero FROM laminaciones WHERE acero_3 IS NOT NULL AND acero_3 != ''
            ORDER BY acero
        `,
        alambres: `
            SELECT DISTINCT tipo_alambre as alambre FROM laminaciones 
            WHERE tipo_alambre IS NOT NULL AND tipo_alambre != ''
            ORDER BY alambre
        `
    };
    
    let results = {};
    let completed = 0;
    
    Object.keys(queries).forEach(key => {
        db.query(queries[key], (err, result) => {
            if (err) {
                console.error(`Error en query ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = result.map(row => row[key.slice(0, -1)]);
            }
            
            completed++;
            if (completed === Object.keys(queries).length) {
                res.json(results);
            }
        });
    });
});

// Endpoint para contar registros con filtros
app.get('/api/laminaciones/count', (req, res) => {
    // Filtros
    const empresa = req.query.empresa;
    const numeroParte = req.query.numero_parte;
    const laminacionVcl = req.query.laminacion_vcl;
    const troquel = req.query.troquel;
    const prensa = req.query.prensa;
    const acero = req.query.acero;
    const pesoMin = req.query.peso_min;
    const pesoMax = req.query.peso_max;
    const espesorMin = req.query.espesor_min;
    const espesorMax = req.query.espesor_max;
    const tipoAlambre = req.query.tipo_alambre;
    const textoLibre = req.query.texto_libre;
    
    let countQuery = 'SELECT COUNT(*) as total FROM laminaciones';
    let conditions = [];
    let params = [];
    
    // Aplicar los mismos filtros que en el endpoint principal
    if (empresa) {
        conditions.push('empresa = ?');
        params.push(empresa);
    }
    
    if (numeroParte) {
        conditions.push('numero LIKE ?');
        params.push(`%${numeroParte}%`);
    }
    
    if (laminacionVcl) {
        conditions.push('laminacion_vcl LIKE ?');
        params.push(`%${laminacionVcl}%`);
    }
    
    if (troquel) {
        conditions.push('troquel LIKE ?');
        params.push(`%${troquel}%`);
    }
    
    if (prensa) {
        conditions.push('(prensa_1 LIKE ? OR prensa_2 LIKE ? OR prensa_3 LIKE ? OR prensa_4 LIKE ?)');
        params.push(`%${prensa}%`, `%${prensa}%`, `%${prensa}%`, `%${prensa}%`);
    }
    
    if (acero) {
        conditions.push('(acero_1 LIKE ? OR acero_2 LIKE ? OR acero_3 LIKE ?)');
        params.push(`%${acero}%`, `%${acero}%`, `%${acero}%`);
    }
    
    if (pesoMin) {
        conditions.push('peso_pieza_kg >= ?');
        params.push(parseFloat(pesoMin));
    }
    
    if (pesoMax) {
        conditions.push('peso_pieza_kg <= ?');
        params.push(parseFloat(pesoMax));
    }
    
    if (espesorMin) {
        conditions.push('espesor_pulg >= ?');
        params.push(parseFloat(espesorMin));
    }
    
    if (espesorMax) {
        conditions.push('espesor_pulg <= ?');
        params.push(parseFloat(espesorMax));
    }
    
    if (tipoAlambre) {
        conditions.push('tipo_alambre LIKE ?');
        params.push(`%${tipoAlambre}%`);
    }
    
    if (textoLibre) {
        conditions.push(`(
            empresa LIKE ? OR 
            numero LIKE ? OR 
            laminacion_vcl LIKE ? OR 
            troquel LIKE ? OR 
            prensa_1 LIKE ? OR 
            prensa_2 LIKE ? OR 
            prensa_3 LIKE ? OR 
            prensa_4 LIKE ? OR 
            acero_1 LIKE ? OR 
            acero_2 LIKE ? OR 
            acero_3 LIKE ? OR 
            tipo_alambre LIKE ? OR 
            caracteristica_especial LIKE ?
        )`);
        const textoPattern = `%${textoLibre}%`;
        for (let i = 0; i < 13; i++) {
            params.push(textoPattern);
        }
    }
    
    if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    db.query(countQuery, params, (err, results) => {
        if (err) {
            console.error('Error contando registros:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json({
            count: results[0].total
        });
    });
});

// Endpoint para exportar datos
app.get('/api/laminaciones/export', (req, res) => {
    const format = req.query.format || 'csv';
    const includeHeaders = req.query.includeHeaders === 'true';
    const includeAllFields = req.query.includeAllFields === 'true';
    const includeFiltersInfo = req.query.includeFiltersInfo === 'true';
    
    // Aplicar los mismos filtros que en el endpoint principal
    const empresa = req.query.empresa;
    const numeroParte = req.query.numero_parte;
    const laminacionVcl = req.query.laminacion_vcl;
    const troquel = req.query.troquel;
    const prensa = req.query.prensa;
    const acero = req.query.acero;
    const pesoMin = req.query.peso_min;
    const pesoMax = req.query.peso_max;
    const espesorMin = req.query.espesor_min;
    const espesorMax = req.query.espesor_max;
    const tipoAlambre = req.query.tipo_alambre;
    const textoLibre = req.query.texto_libre;
    
    // Construir query
    let query = includeAllFields ? 
        'SELECT * FROM laminaciones' :
        'SELECT empresa, numero, laminacion_vcl, troquel, prensa_1, peso_pieza_kg FROM laminaciones';
    
    let conditions = [];
    let params = [];
    
    // Aplicar filtros
    if (empresa) {
        conditions.push('empresa = ?');
        params.push(empresa);
    }
    
    if (numeroParte) {
        conditions.push('numero LIKE ?');
        params.push(`%${numeroParte}%`);
    }
    
    if (laminacionVcl) {
        conditions.push('laminacion_vcl LIKE ?');
        params.push(`%${laminacionVcl}%`);
    }
    
    if (troquel) {
        conditions.push('troquel LIKE ?');
        params.push(`%${troquel}%`);
    }
    
    if (prensa) {
        conditions.push('(prensa_1 LIKE ? OR prensa_2 LIKE ? OR prensa_3 LIKE ? OR prensa_4 LIKE ?)');
        params.push(`%${prensa}%`, `%${prensa}%`, `%${prensa}%`, `%${prensa}%`);
    }
    
    if (acero) {
        conditions.push('(acero_1 LIKE ? OR acero_2 LIKE ? OR acero_3 LIKE ?)');
        params.push(`%${acero}%`, `%${acero}%`, `%${acero}%`);
    }
    
    if (pesoMin) {
        conditions.push('peso_pieza_kg >= ?');
        params.push(parseFloat(pesoMin));
    }
    
    if (pesoMax) {
        conditions.push('peso_pieza_kg <= ?');
        params.push(parseFloat(pesoMax));
    }
    
    if (espesorMin) {
        conditions.push('espesor_pulg >= ?');
        params.push(parseFloat(espesorMin));
    }
    
    if (espesorMax) {
        conditions.push('espesor_pulg <= ?');
        params.push(parseFloat(espesorMax));
    }
    
    if (tipoAlambre) {
        conditions.push('tipo_alambre LIKE ?');
        params.push(`%${tipoAlambre}%`);
    }
    
    if (textoLibre) {
        conditions.push(`(
            empresa LIKE ? OR 
            numero LIKE ? OR 
            laminacion_vcl LIKE ? OR 
            troquel LIKE ? OR 
            prensa_1 LIKE ? OR 
            prensa_2 LIKE ? OR 
            prensa_3 LIKE ? OR 
            prensa_4 LIKE ? OR 
            acero_1 LIKE ? OR 
            acero_2 LIKE ? OR 
            acero_3 LIKE ? OR 
            tipo_alambre LIKE ? OR 
            caracteristica_especial LIKE ?
        )`);
        const textoPattern = `%${textoLibre}%`;
        for (let i = 0; i < 13; i++) {
            params.push(textoPattern);
        }
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY empresa, numero';
    
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error en exportación:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (format === 'csv') {
            // Generar CSV
            let csvContent = '';
            
            // Información de filtros si se solicita
            if (includeFiltersInfo) {
                csvContent += '# Reporte de Laminaciones - VC Laminations\n';
                csvContent += `# Generado el: ${new Date().toLocaleDateString()}\n`;
                csvContent += `# Total de registros: ${results.length}\n`;
                
                const activeFilters = [];
                if (empresa) activeFilters.push(`Empresa: ${empresa}`);
                if (numeroParte) activeFilters.push(`Número de Parte: ${numeroParte}`);
                if (laminacionVcl) activeFilters.push(`Laminación VC: ${laminacionVcl}`);
                if (troquel) activeFilters.push(`Troquel: ${troquel}`);
                if (prensa) activeFilters.push(`Prensa: ${prensa}`);
                if (acero) activeFilters.push(`Material: ${acero}`);
                if (pesoMin) activeFilters.push(`Peso Mínimo: ${pesoMin} kg`);
                if (pesoMax) activeFilters.push(`Peso Máximo: ${pesoMax} kg`);
                if (espesorMin) activeFilters.push(`Espesor Mínimo: ${espesorMin} pulg`);
                if (espesorMax) activeFilters.push(`Espesor Máximo: ${espesorMax} pulg`);
                if (tipoAlambre) activeFilters.push(`Tipo Alambre: ${tipoAlambre}`);
                if (textoLibre) activeFilters.push(`Búsqueda Libre: ${textoLibre}`);
                
                if (activeFilters.length > 0) {
                    csvContent += `# Filtros aplicados: ${activeFilters.join(', ')}\n`;
                } else {
                    csvContent += '# Sin filtros aplicados\n';
                }
                csvContent += '\n';
            }
            
            // Encabezados
            if (includeHeaders && results.length > 0) {
                csvContent += Object.keys(results[0]).join(',') + '\n';
            }
            
            // Datos
            results.forEach(row => {
                const values = Object.values(row).map(value => {
                    if (value === null || value === undefined) {
                        return '';
                    }
                    // Escapar comillas y envolver en comillas si contiene comas
                    const stringValue = String(value);
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                });
                csvContent += values.join(',') + '\n';
            });
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=laminaciones_${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csvContent);
            
        } else if (format === 'pdf') {
            // Para PDF, retornar JSON con los datos (el frontend manejará la generación del PDF)
            res.json({
                data: results,
                meta: {
                    totalRecords: results.length,
                    generatedAt: new Date().toISOString(),
                    filters: {
                        empresa,
                        numeroParte,
                        laminacionVcl,
                        troquel,
                        prensa,
                        acero,
                        pesoMin,
                        pesoMax,
                        espesorMin,
                        espesorMax,
                        tipoAlambre,
                        textoLibre
                    }
                }
            });
        } else {
            res.status(400).json({ error: 'Formato no soportado' });
        }
    });
});

// ========================================
// ENDPOINTS DE AUTOCOMPLETADO
// ========================================

// Endpoint para autocompletado de empresas
app.get('/api/autocomplete/empresas', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    
    const searchQuery = `
        SELECT DISTINCT empresa 
        FROM laminaciones 
        WHERE empresa LIKE ? 
        ORDER BY empresa 
        LIMIT 10
    `;
    
    db.query(searchQuery, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error en autocompletado de empresas:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const suggestions = results.map(row => ({
            text: row.empresa,
            type: 'empresa'
        }));
        
        res.json(suggestions);
    });
});

// Endpoint para autocompletado de números de parte
app.get('/api/autocomplete/numeros-parte', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    
    const searchQuery = `
        SELECT DISTINCT numero_parte, empresa 
        FROM laminaciones 
        WHERE numero_parte LIKE ? 
        ORDER BY numero_parte 
        LIMIT 10
    `;
    
    db.query(searchQuery, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error en autocompletado de números de parte:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const suggestions = results.map(row => ({
            text: row.numero_parte,
            type: 'numero_parte',
            empresa: row.empresa
        }));
        
        res.json(suggestions);
    });
});

// Endpoint para autocompletado de laminaciones VCL
app.get('/api/autocomplete/laminaciones', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    
    const searchQuery = `
        SELECT DISTINCT laminacion_vcl, empresa 
        FROM laminaciones 
        WHERE laminacion_vcl LIKE ? 
        ORDER BY laminacion_vcl 
        LIMIT 10
    `;
    
    db.query(searchQuery, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error en autocompletado de laminaciones:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const suggestions = results.map(row => ({
            text: row.laminacion_vcl,
            type: 'laminacion',
            empresa: row.empresa
        }));
        
        res.json(suggestions);
    });
});

// Endpoint para autocompletado de troqueles
app.get('/api/autocomplete/troqueles', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    
    const searchQuery = `
        SELECT DISTINCT troquel, empresa 
        FROM laminaciones 
        WHERE troquel LIKE ? AND troquel IS NOT NULL AND troquel != ''
        ORDER BY troquel 
        LIMIT 10
    `;
    
    db.query(searchQuery, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Error en autocompletado de troqueles:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        const suggestions = results.map(row => ({
            text: row.troquel,
            type: 'troquel',
            empresa: row.empresa
        }));
        
        res.json(suggestions);
    });
});

// Endpoint para autocompletado de búsqueda libre (múltiples campos)
app.get('/api/autocomplete/busqueda-libre', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.json([]);
    }
    
    const searchQuery = `
        (SELECT DISTINCT empresa as text, 'empresa' as type, empresa FROM laminaciones WHERE empresa LIKE ? LIMIT 3)
        UNION
        (SELECT DISTINCT numero_parte as text, 'numero_parte' as type, empresa FROM laminaciones WHERE numero_parte LIKE ? LIMIT 3)
        UNION
        (SELECT DISTINCT laminacion_vcl as text, 'laminacion' as type, empresa FROM laminaciones WHERE laminacion_vcl LIKE ? LIMIT 3)
        UNION
        (SELECT DISTINCT troquel as text, 'troquel' as type, empresa FROM laminaciones WHERE troquel LIKE ? AND troquel IS NOT NULL AND troquel != '' LIMIT 3)
        ORDER BY text
        LIMIT 10
    `;
    
    const searchTerm = `%${query}%`;
    db.query(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Error en autocompletado de búsqueda libre:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor VC Laminations corriendo en http://localhost:${PORT}`);
});
