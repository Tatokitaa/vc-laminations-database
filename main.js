// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado de la aplicación
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let currentFilters = {
    empresa: '',
    numero_parte: ''
};

// Elementos del DOM
const elements = {
    // Estadísticas
    totalLaminaciones: document.getElementById('total-laminaciones'),
    totalEmpresas: document.getElementById('total-empresas'),
    
    // Filtros
    empresaFilter: document.getElementById('empresa-filter'),
    numeroParteFilter: document.getElementById('numero-parte-filter'),
    searchBtn: document.getElementById('search-btn'),
    clearBtn: document.getElementById('clear-btn'),
    productionBtn: document.getElementById('production-btn'),
    newLaminationBtn: document.getElementById('new-lamination-btn'),
    
    // Paginación
    paginationText: document.getElementById('pagination-text'),
    pageInfo: document.getElementById('page-info'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    
    // Tabla
    tableBody: document.getElementById('laminaciones-tbody'),
    
    // Modal de detalles
    modal: document.getElementById('detail-modal'),
    closeModal: document.querySelector('.close'),
    detailContent: document.getElementById('detail-content'),
    
    // Modal de producción
    productionModal: document.getElementById('production-modal'),
    closeProductionModal: document.querySelector('.close-production'),
    productionForm: document.getElementById('production-form'),
    productionEmpresa: document.getElementById('production-empresa'),
    productionNumeroParte: document.getElementById('production-numero-parte'),
    productionKilos: document.getElementById('production-kilos'),
    productionAlambres: document.getElementById('production-alambres'),
    productionLibras: document.getElementById('production-libras'),
    productionNotas: document.getElementById('production-notas'),
    cancelProduction: document.getElementById('cancel-production'),
    
    // Modal de nueva laminación
    newLaminationModal: document.getElementById('new-lamination-modal'),
    closeNewLamination: document.querySelector('.close-new-lamination'),
    newLaminationForm: document.getElementById('new-lamination-form'),
    cancelNewLamination: document.getElementById('cancel-new-lamination'),
    
    // Loader
    loader: document.getElementById('loader')
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
});

// Inicializar la aplicación
async function initializeApp() {
    try {
        showLoader();
        await Promise.all([
            loadStats(),
            loadCompanies(),
            loadData()
        ]);
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        showError('Error al cargar la aplicación. Por favor, verifica que el servidor esté ejecutándose.');
    } finally {
        hideLoader();
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botones de búsqueda
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.clearBtn.addEventListener('click', handleClear);
    elements.productionBtn.addEventListener('click', showProductionModal);
    elements.newLaminationBtn.addEventListener('click', showNewLaminationModal);
    
    // Enter en campos de búsqueda
    elements.numeroParteFilter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    elements.empresaFilter.addEventListener('change', handleSearch);
    
    // Paginación
    elements.prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    elements.nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Modal de detalles
    elements.closeModal.addEventListener('click', hideModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) hideModal();
    });
    
    // Modal de producción
    elements.closeProductionModal.addEventListener('click', hideProductionModal);
    elements.cancelProduction.addEventListener('click', hideProductionModal);
    elements.productionModal.addEventListener('click', (e) => {
        if (e.target === elements.productionModal) hideProductionModal();
    });
    elements.productionForm.addEventListener('submit', handleProductionSubmit);
    
    // Modal de nueva laminación
    elements.closeNewLamination.addEventListener('click', hideNewLaminationModal);
    elements.cancelNewLamination.addEventListener('click', hideNewLaminationModal);
    elements.newLaminationModal.addEventListener('click', (e) => {
        if (e.target === elements.newLaminationModal) hideNewLaminationModal();
    });
    elements.newLaminationForm.addEventListener('submit', handleNewLaminationSubmit);
    
    // Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
            hideProductionModal();
            hideNewLaminationModal();
        }
    });
}

// Cargar estadísticas
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        
        const stats = await response.json();
        elements.totalLaminaciones.textContent = stats.total_laminaciones?.toLocaleString() || '0';
        elements.totalEmpresas.textContent = stats.total_empresas || '0';
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        elements.totalLaminaciones.textContent = 'Error';
        elements.totalEmpresas.textContent = 'Error';
    }
}

// Cargar lista de empresas
async function loadCompanies() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (!response.ok) throw new Error('Error al cargar empresas');
        
        const companies = await response.json();
        
        // Limpiar opciones existentes (excepto la primera)
        elements.empresaFilter.innerHTML = '<option value="">Todas las empresas</option>';
        
        // Agregar empresas
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa;
            option.textContent = company.empresa;
            elements.empresaFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando empresas:', error);
    }
}

// Cargar datos de laminaciones
async function loadData() {
    try {
        showLoader();
        
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            ...currentFilters
        });
        
        // Remover parámetros vacíos
        for (const [key, value] of queryParams.entries()) {
            if (!value) queryParams.delete(key);
        }
        
        const response = await fetch(`${API_BASE_URL}/laminaciones?${queryParams}`);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();
        
        renderTable(data.data);
        updatePagination(data.pagination);
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error al cargar los datos de laminaciones');
    } finally {
        hideLoader();
    }
}

// Renderizar tabla
function renderTable(data) {
    elements.tableBody.innerHTML = '';
    
    if (data.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    No se encontraron resultados
                </td>
            </tr>
        `;
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.empresa || '-'}</td>
            <td>${item.numero || '-'}</td>
            <td>${item.laminacion_vcl || '-'}</td>
            <td>${item.troquel || '-'}</td>
            <td>${item.prensa_1 || '-'}</td>
            <td>${item.peso_pieza_kg || '-'}</td>
            <td>
                <button class="action-btn" onclick="showDetails(${item.id})">
                    Ver Detalles
                </button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}

// Actualizar información de paginación
function updatePagination(pagination) {
    if (!pagination) return;
    
    currentPage = pagination.page || 1;
    totalPages = pagination.totalPages || 1;
    
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, pagination.total || 0);
    
    elements.paginationText.textContent = `Mostrando ${startItem} - ${endItem} de ${pagination.total || 0}`;
    elements.pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    
    elements.prevBtn.disabled = currentPage <= 1;
    elements.nextBtn.disabled = currentPage >= totalPages;
}

// Manejar búsqueda
function handleSearch() {
    currentFilters.empresa = elements.empresaFilter.value;
    currentFilters.numero_parte = elements.numeroParteFilter.value;
    currentPage = 1;
    loadData();
}

// Limpiar filtros
function handleClear() {
    elements.empresaFilter.value = '';
    elements.numeroParteFilter.value = '';
    currentFilters = { empresa: '', numero_parte: '' };
    currentPage = 1;
    loadData();
}

// Cambiar página
function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadData();
    }
}

// Mostrar detalles
async function showDetails(id) {
    try {
        showLoader();
        const response = await fetch(`${API_BASE_URL}/laminaciones/${id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar los detalles de la laminación');
        }
        
        const laminacion = await response.json();
        renderDetailModal(laminacion);
        
    } catch (error) {
        console.error('Error cargando detalles:', error);
        showError('Error al cargar los detalles de la laminación');
    } finally {
        hideLoader();
    }
}

// Renderizar modal de detalles
function renderDetailModal(laminacion) {
    const detailContent = elements.detailContent;
    
    detailContent.innerHTML = `
        <div class="detail-sections">
            <!-- Información Básica -->
            <div class="detail-section">
                <h3>Información Básica</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Empresa:</label>
                        <span>${laminacion.empresa || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Número:</label>
                        <span>${laminacion.numero || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Número de Parte:</label>
                        <span>${laminacion.numero_parte || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Descripción del Cliente:</label>
                        <span>${laminacion.descripcion_cliente || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Nivel de Revisión:</label>
                        <span>${laminacion.nivel_revision || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Laminación VCL:</label>
                        <span>${laminacion.laminacion_vcl || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Referencia:</label>
                        <span>${laminacion.referencia || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Información de Troquel -->
            <div class="detail-section">
                <h3>Información de Troquel</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Troquel:</label>
                        <span>${laminacion.troquel || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Paso Troquel (mm):</label>
                        <span>${laminacion.paso_troquel_mm || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Configuración de Prensas -->
            <div class="detail-section">
                <h3>Configuración de Prensas</h3>
                <div class="detail-grid">
                    <!-- Prensa 1 -->
                    <div class="detail-item">
                        <label>Prensa 1:</label>
                        <span>${laminacion.prensa_1 || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Placas/Paralelas:</label>
                        <span>${laminacion.placas_paralelas || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Stackers:</label>
                        <span>${laminacion.stackers || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Bandas:</label>
                        <span>${laminacion.bandas || '-'}</span>
                    </div>
                    ${renderPrenseAdditional(laminacion, 2)}
                    ${renderPrenseAdditional(laminacion, 3)}
                    ${renderPrenseAdditional(laminacion, 4)}
                </div>
            </div>

            <!-- Especificaciones de Material -->
            <div class="detail-section">
                <h3>Especificaciones de Material</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Acero 1:</label>
                        <span>${laminacion.acero_1 || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Acero 2:</label>
                        <span>${laminacion.acero_2 || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Acero 3:</label>
                        <span>${laminacion.acero_3 || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Horneado:</label>
                        <span>${laminacion.horneado || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Dimensiones y Pesos -->
            <div class="detail-section">
                <h3>Dimensiones y Pesos</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Espesor (pulg.):</label>
                        <span>${laminacion.espesor_pulg || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Ancho Cinta (pulg.):</label>
                        <span>${laminacion.ancho_cinta_pulg || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Peso por Pieza (kg):</label>
                        <span>${laminacion.peso_pieza_kg || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Configuración de Alambre (Unidad de Agrupación) -->
            <div class="detail-section">
                <h3>Configuración de Alambre (Unidad de Agrupación)</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Long. Corte de Alambre:</label>
                        <span>${laminacion.long_corte_alambre || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Calibre de Alambre:</label>
                        <span>${laminacion.cal_alambre || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tipo de Alambre:</label>
                        <span>${laminacion.tipo_alambre || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Lubricante:</label>
                        <span>${laminacion.lubricante || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Long. Alambre/Stack Final (pulg.):</label>
                        <span>${laminacion.long_alambre_stack_final_pulg || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Piezas por Alambre (unidad):</label>
                        <span>${laminacion.piezas_por_alambre || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Peso de un Alambre (kg):</label>
                        <span>${laminacion.peso_alambre_kg || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Alambres por Caja:</label>
                        <span>${laminacion.alambres_stacks_por_caja || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Información de Empaque y Distribución -->
            <div class="detail-section">
                <h3>Información de Empaque y Distribución</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Tamaño de Caja:</label>
                        <span>${laminacion.tamano_caja || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tamaño de Tarima:</label>
                        <span>${laminacion.tamano_tarima || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tipo de Tarima:</label>
                        <span>${laminacion.tipo_tarima || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Características Especiales -->
            ${laminacion.caracteristica_especial ? `
                <div class="detail-section">
                    <h3>Características Especiales</h3>
                    <div class="detail-full">
                        <p>${laminacion.caracteristica_especial}</p>
                    </div>
                </div>
            ` : ''}

            <!-- Información de Sistema -->
            <div class="detail-section">
                <h3>Información del Sistema</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>ID:</label>
                        <span>${laminacion.id}</span>
                    </div>
                    <div class="detail-item">
                        <label>Fecha de Importación:</label>
                        <span>${laminacion.fecha_importacion ? new Date(laminacion.fecha_importacion).toLocaleString() : '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Creado por:</label>
                        <span>${laminacion.creado_por || 'Importación'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Estado:</label>
                        <span>${laminacion.activo === 'S' ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar modal
    elements.modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Función auxiliar para renderizar prensas adicionales
function renderPrenseAdditional(laminacion, numero) {
    const prensa = laminacion[`prensa_${numero}`];
    const placas = laminacion[`placas_paralelas_${numero}`];
    const stackers = laminacion[`stackers_${numero}`];
    const bandas = laminacion[`bandas_${numero}`];
    
    // Solo mostrar si hay algún dato
    if (!prensa && !placas && !stackers && !bandas) {
        return '';
    }
    
    return `
        <!-- Prensa ${numero} -->
        <div class="detail-item">
            <label>Prensa ${numero}:</label>
            <span>${prensa || '-'}</span>
        </div>
        <div class="detail-item">
            <label>Placas/Paralelas ${numero}:</label>
            <span>${placas || '-'}</span>
        </div>
        <div class="detail-item">
            <label>Stackers ${numero}:</label>
            <span>${stackers || '-'}</span>
        </div>
        <div class="detail-item">
            <label>Bandas ${numero}:</label>
            <span>${bandas || '-'}</span>
        </div>
    `;
}

// Funciones para modal de detalles
function hideModal() {
    elements.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Funciones para modal de producción
function showProductionModal() {
    loadCompaniesForProduction();
    elements.productionModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideProductionModal() {
    elements.productionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetProductionForm();
}

function resetProductionForm() {
    elements.productionForm.reset();
}

async function loadCompaniesForProduction() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (!response.ok) throw new Error('Error al cargar empresas');
        
        const companies = await response.json();
        
        // Limpiar opciones existentes (excepto la primera)
        elements.productionEmpresa.innerHTML = '<option value="">Seleccionar empresa</option>';
        
        // Agregar empresas
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa;
            option.textContent = company.empresa;
            elements.productionEmpresa.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando empresas para producción:', error);
        showError('Error al cargar empresas');
    }
}

async function handleProductionSubmit(e) {
    e.preventDefault();
    
    const productionData = {
        empresa: elements.productionEmpresa.value,
        numero_parte: elements.productionNumeroParte.value,
        kilos: parseFloat(elements.productionKilos.value),
        alambres: elements.productionAlambres.value ? parseInt(elements.productionAlambres.value) : null, // Alambres como unidades de agrupación
        libras: elements.productionLibras.value ? parseFloat(elements.productionLibras.value) : null,
        notas: elements.productionNotas.value,
        fecha: new Date().toISOString().split('T')[0]
    };

    try {
        showLoader();
        const response = await fetch(`${API_BASE_URL}/produccion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar producción');
        }

        const result = await response.json();
        showSuccess('Producción registrada exitosamente');
        hideProductionModal();
        
        // Recargar estadísticas
        await loadStats();
        
    } catch (error) {
        console.error('Error registrando producción:', error);
        showError(error.message || 'Error al registrar producción');
    } finally {
        hideLoader();
    }
}

// Funciones para modal de nueva laminación
function showNewLaminationModal() {
    loadCompaniesForNewLamination();
    elements.newLaminationModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideNewLaminationModal() {
    elements.newLaminationModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    resetNewLaminationForm();
}

function resetNewLaminationForm() {
    elements.newLaminationForm.reset();
}

async function loadCompaniesForNewLamination() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (!response.ok) throw new Error('Error al cargar empresas');
        
        const companies = await response.json();
        
        // Buscar el select de empresa en el modal de nueva laminación
        const empresaSelect = document.getElementById('new-empresa');
        empresaSelect.innerHTML = '<option value="">Seleccionar empresa</option>';
        
        // Agregar empresas
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa;
            option.textContent = company.empresa;
            empresaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando empresas para nueva laminación:', error);
        showError('Error al cargar empresas');
    }
}

async function handleNewLaminationSubmit(e) {
    e.preventDefault();
    
    // Recopilar todos los datos del formulario
    const formData = {
        empresa: document.getElementById('new-empresa').value,
        numero_parte: document.getElementById('new-numero-parte').value,
        descripcion_cliente: document.getElementById('new-descripcion-cliente').value,
        nivel_revision: document.getElementById('new-nivel-revision').value,
        laminacion_vcl: document.getElementById('new-laminacion-vcl').value,
        referencia: document.getElementById('new-referencia').value,
        troquel: document.getElementById('new-troquel').value,
        paso_troquel_mm: parseFloat(document.getElementById('new-paso-troquel').value) || null,
        prensa_1: document.getElementById('new-prensa-1').value,
        placas_paralelas: document.getElementById('new-placas-paralelas').value,
        stackers: document.getElementById('new-stackers').value,
        bandas: document.getElementById('new-bandas').value,
        prensa_2: document.getElementById('new-prensa-2').value || null,
        placas_paralelas_2: document.getElementById('new-placas-paralelas-2').value || null,
        stackers_2: document.getElementById('new-stackers-2').value || null,
        bandas_2: document.getElementById('new-bandas-2').value || null,
        prensa_3: document.getElementById('new-prensa-3').value || null,
        placas_paralelas_3: document.getElementById('new-placas-paralelas-3').value || null,
        stackers_3: document.getElementById('new-stackers-3').value || null,
        bandas_3: document.getElementById('new-bandas-3').value || null,
        prensa_4: document.getElementById('new-prensa-4').value || null,
        placas_paralelas_4: document.getElementById('new-placas-paralelas-4').value || null,
        stackers_4: document.getElementById('new-stackers-4').value || null,
        bandas_4: document.getElementById('new-bandas-4').value || null,
        long_corte_alambre: parseFloat(document.getElementById('new-long-corte-alambre').value) || null,
        cal_alambre: document.getElementById('new-cal-alambre').value,
        tipo_alambre: document.getElementById('new-tipo-alambre').value,
        lubricante: document.getElementById('new-lubricante').value,
        horneado: document.getElementById('new-horneado').value,
        acero_1: document.getElementById('new-acero-1').value,
        acero_2: document.getElementById('new-acero-2').value,
        acero_3: document.getElementById('new-acero-3').value,
        espesor_pulg: parseFloat(document.getElementById('new-espesor-pulg').value) || null,
        ancho_cinta_pulg: parseFloat(document.getElementById('new-ancho-cinta').value) || null,
        peso_pieza_kg: parseFloat(document.getElementById('new-peso-pieza').value) || null,
        long_alambre_stack_final_pulg: parseFloat(document.getElementById('new-long-alambre-stack').value) || null,
        piezas_por_alambre: parseInt(document.getElementById('new-piezas-alambre').value) || null, // Cuántas piezas individuales forman un "alambre" (unidad de agrupación)
        peso_alambre_kg: parseFloat(document.getElementById('new-peso-alambre').value) || null, // Peso total de un "alambre" completo
        tamano_caja: document.getElementById('new-tamano-caja').value,
        alambres_stacks_por_caja: parseInt(document.getElementById('new-alambres-caja').value) || null,
        tamano_tarima: document.getElementById('new-tamano-tarima').value,
        tipo_tarima: document.getElementById('new-tipo-tarima').value,
        caracteristica_especial: document.getElementById('new-caracteristica-especial').value
    };

    // Validaciones básicas
    if (!formData.empresa || !formData.numero_parte) {
        showError('Empresa y Número de Parte son campos requeridos');
        return;
    }

    try {
        showLoader();
        const response = await fetch(`${API_BASE_URL}/laminaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear laminación');
        }

        const result = await response.json();
        showSuccess(`Laminación creada exitosamente. Número asignado: ${result.numero} para ${result.empresa}`);
        hideNewLaminationModal();
        
        // Recargar datos y estadísticas
        await Promise.all([
            loadStats(),
            loadCompanies(),
            loadData()
        ]);
        
    } catch (error) {
        console.error('Error creando laminación:', error);
        showError(error.message || 'Error al crear laminación');
    } finally {
        hideLoader();
    }
}

// Funciones de utilidad
function showLoader() {
    elements.loader.style.display = 'flex';
}

function hideLoader() {
    elements.loader.style.display = 'none';
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    showNotification(message, 'success');
}

// Función para mostrar mensajes de error
function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos base
    const baseStyles = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    `;
    
    // Estilos específicos por tipo
    if (type === 'success') {
        notification.style.cssText = baseStyles + `
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
        `;
    } else {
        notification.style.cssText = baseStyles + `
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
        `;
    }
    
    document.body.appendChild(notification);
    
    // Remover después de unos segundos
    const timeout = type === 'success' ? 3000 : 5000;
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, timeout);
}

// Agregar animaciones CSS dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
