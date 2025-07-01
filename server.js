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
    const empresa = req.query.empresa;
    const numeroParte = req.query.numero_parte;
    
    let query = 'SELECT * FROM laminaciones';
    let countQuery = 'SELECT COUNT(*) as total FROM laminaciones';
    let conditions = [];
    let params = [];
    
    if (empresa) {
        conditions.push('empresa = ?');
        params.push(empresa);
    }
    
    if (numeroParte) {
        conditions.push('numero LIKE ?');
        params.push(`%${numeroParte}%`);
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
        
        // Obtener registros paginados
        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Error obteniendo laminaciones:', err);
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

app.listen(PORT, () => {
    console.log(`Servidor VC Laminations corriendo en http://localhost:${PORT}`);
});
