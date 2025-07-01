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
    
    // Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
            hideProductionModal();
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
function showDetails(id) {
    // Implementar detalles específicos si es necesario
    showSuccess('Funcionalidad de detalles próximamente');
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
        alambres: elements.productionAlambres.value ? parseInt(elements.productionAlambres.value) : null,
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
