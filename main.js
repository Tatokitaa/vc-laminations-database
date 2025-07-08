// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Estado de la aplicación
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let currentFilters = {
    empresa: '',
    numero_parte: '',
    laminacion_vcl: '',
    troquel: '',
    prensa: '',
    acero: '',
    peso_min: '',
    peso_max: '',
    espesor_min: '',
    espesor_max: '',
    tipo_alambre: '',
    texto_libre: ''
};

// Estado de búsquedas guardadas
let savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
let filterOptions = {
    prensas: [],
    aceros: [],
    alambres: []
};

// Elementos del DOM
const elements = {
    // Estadísticas
    totalLaminaciones: document.getElementById('total-laminaciones'),
    totalEmpresas: document.getElementById('total-empresas'),
    
    // Filtros básicos
    empresaFilter: document.getElementById('empresa-filter'),
    numeroParteFilter: document.getElementById('numero-parte-filter'),
    laminacionFilter: document.getElementById('laminacion-filter'),
    troqueFilter: document.getElementById('troquel-filter'),
    
    // Filtros avanzados
    advancedFilters: document.getElementById('advanced-filters'),
    prensaFilter: document.getElementById('prensa-filter'),
    aceroFilter: document.getElementById('acero-filter'),
    pesoMinFilter: document.getElementById('peso-min-filter'),
    pesoMaxFilter: document.getElementById('peso-max-filter'),
    espesorMinFilter: document.getElementById('espesor-min-filter'),
    espesorMaxFilter: document.getElementById('espesor-max-filter'),
    alambreFilter: document.getElementById('alambre-filter'),
    textoLibreFilter: document.getElementById('texto-libre-filter'),
    
    // Controles de filtros
    advancedToggle: document.getElementById('advanced-toggle'),
    searchBtn: document.getElementById('search-btn'),
    clearBtn: document.getElementById('clear-btn'),
    saveSearchBtn: document.getElementById('save-search-btn'),
    loadSearchBtn: document.getElementById('load-search-btn'),
    exportBtn: document.getElementById('export-btn'),
    productionBtn: document.getElementById('production-btn'),
    newLaminationBtn: document.getElementById('new-lamination-btn'),
    
    // Filtros activos
    activeFilters: document.getElementById('active-filters'),
    activeFiltersList: document.getElementById('active-filters-list'),
    clearAllFilters: document.getElementById('clear-all-filters'),
    
    // Paginación
    resultsCounter: document.getElementById('results-count'),
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
    cancelNewLamination: document.getElementById('cancel-new-laminacion'),
    
    // Modales de búsquedas guardadas y exportación
    savedSearchesModal: document.getElementById('saved-searches-modal'),
    closeSavedSearches: document.querySelector('.close-saved-searches'),
    searchName: document.getElementById('search-name'),
    searchDescription: document.getElementById('search-description'),
    saveCurrentSearch: document.getElementById('save-current-search'),
    savedSearchesList: document.getElementById('saved-searches-list'),
    
    exportModal: document.getElementById('export-modal'),
    closeExport: document.querySelector('.close-export'),
    exportExecute: document.getElementById('export-execute'),
    exportCancel: document.getElementById('export-cancel'),
    exportCount: document.getElementById('export-count'),
    exportFilters: document.getElementById('export-filters'),
    
    // Loader
    loader: document.getElementById('loader')
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Registrar Service Worker para PWA
    await registerServiceWorker();
    
    // Inicializar sistemas de tema y notificaciones
    themeManager = new ThemeManager();
    NotificationManager.init();
    
    // Verificar si es una PWA y mostrar botón de instalación
    setupPWAFeatures();
    
    // Inicializar aplicación principal
    await initializeApp();
    setupEventListeners();
    
    // Configurar event listeners adicionales para modales
    setupModalEventListeners();
    
    // Inicializar sistema de autocompletado
    initializeAutocomplete();
    
    // Inicializar manejadores de red
    setupNetworkHandlers();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        NotificationManager.success(
            '¡Bienvenido!',
            'Sistema de laminaciones cargado correctamente',
            3000
        );
    }, 1000);
});

// Configurar event listeners adicionales para modales
function setupModalEventListeners() {
    console.log('Setting up modal event listeners...');
    
    // Mapeo de modales y sus funciones de cierre
    const modals = {
        'detail-modal': hideModal,
        'production-modal': hideProductionModal,
        'new-lamination-modal': hideNewLaminationModal,
        'saved-searches-modal': hideSavedSearchesModal,
        'export-modal': hideExportModal
    };
    
    // Configurar cada modal
    Object.keys(modals).forEach(modalId => {
        const modal = document.getElementById(modalId);
        const closeFn = modals[modalId];
        
        if (modal) {
            console.log(`Setting up modal: ${modalId}`);
            
            // Limpiar listeners previos
            const newModal = modal.cloneNode(true);
            modal.parentNode.replaceChild(newModal, modal);
            
            // Actualizar referencia
            const updatedModal = document.getElementById(modalId);
            
            // Botón de cierre principal (X)
            const closeBtn = updatedModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Closing modal ${modalId} via close button`);
                    closeFn();
                });
            }
            
            // Botones de cierre específicos por clase
            const closeButtons = updatedModal.querySelectorAll('.close, .close-export, .close-saved-searches, .close-production, .close-new-lamination');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Closing modal ${modalId} via specific close button`);
                    closeFn();
                });
            });
            
            // Clic fuera del modal
            updatedModal.addEventListener('click', (e) => {
                if (e.target === updatedModal) {
                    console.log(`Closing modal ${modalId} by clicking outside`);
                    closeFn();
                }
            });
            
            // Botones de cancelar específicos
            const cancelButtons = updatedModal.querySelectorAll('[id*="cancel"]');
            cancelButtons.forEach(cancelBtn => {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Closing modal ${modalId} via cancel button`);
                    closeFn();
                });
            });
        }
    });
    
    // Event listeners adicionales para botones específicos usando IDs directos
    const buttonMappings = [
        { id: 'export-cancel', fn: hideExportModal },
        { id: 'cancel-production', fn: hideProductionModal },
        { id: 'cancel-new-laminacion', fn: hideNewLaminationModal }
    ];
    
    buttonMappings.forEach(mapping => {
        const btn = document.getElementById(mapping.id);
        if (btn) {
            // Remover listeners previos
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Agregar nuevo listener
            const updatedBtn = document.getElementById(mapping.id);
            if (updatedBtn) {
                updatedBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Closing modal via button ${mapping.id}`);
                    mapping.fn();
                });
            }
        }
    });
    
    // Listener global para Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            console.log('Escape key pressed - closing all modals');
            closeAllModals();
        }
    });
    
    console.log('Modal event listeners configured successfully');
}

// Función para cerrar todos los modales
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    console.log('All modals closed');
}

// Función universal para cerrar modales
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log(`Modal ${modalId} closed`);
        
        // Limpiar formularios si existen
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Función universal para abrir modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        console.log(`Modal ${modalId} opened`);
    }
}

// Inicializar la aplicación
async function initializeApp() {
    try {
        showLoader();
        
        // Inicializar contador de resultados con valor por defecto
        elements.resultsCounter.innerHTML = '<span>Cargando resultados...</span>';
        
        await Promise.all([
            loadStats(),
            loadCompanies(),
            loadFilterOptions(),
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
    
    // Nuevos controles de filtros
    elements.advancedToggle.addEventListener('click', toggleAdvancedFilters);
    elements.saveSearchBtn.addEventListener('click', showSavedSearchesModal);
    elements.loadSearchBtn.addEventListener('click', showSavedSearchesModal);
    elements.exportBtn.addEventListener('click', showExportModal);
    elements.clearAllFilters.addEventListener('click', clearAllFilters);
    
    // Enter en campos de búsqueda
    const searchFields = [
        elements.numeroParteFilter,
        elements.laminacionFilter,
        elements.troqueFilter,
        elements.pesoMinFilter,
        elements.pesoMaxFilter,
        elements.espesorMinFilter,
        elements.espesorMaxFilter,
        elements.textoLibreFilter
    ];
    
    searchFields.forEach(field => {
        if (field) {
            field.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
        }
    });
    
    // Búsqueda automática en selectores
    elements.empresaFilter.addEventListener('change', handleSearch);
    elements.prensaFilter.addEventListener('change', handleSearch);
    elements.aceroFilter.addEventListener('change', handleSearch);
    elements.alambreFilter.addEventListener('change', handleSearch);
    
    // Paginación
    elements.prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    elements.nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Formularios
    elements.productionForm.addEventListener('submit', handleProductionSubmit);
    elements.newLaminationForm.addEventListener('submit', handleNewLaminationSubmit);
    elements.saveCurrentSearch.addEventListener('click', handleSaveSearch);
    elements.exportExecute.addEventListener('click', handleExport);
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

// Cargar opciones para filtros
async function loadFilterOptions() {
    try {
        const response = await fetch(`${API_BASE_URL}/filter-options`);
        if (!response.ok) throw new Error('Error al cargar opciones de filtros');
        
        const options = await response.json();
        filterOptions = options;
        
        // Cargar opciones de prensas
        elements.prensaFilter.innerHTML = '<option value="">Todas las prensas</option>';
        options.prensas.forEach(prensa => {
            const option = document.createElement('option');
            option.value = prensa;
            option.textContent = prensa;
            elements.prensaFilter.appendChild(option);
        });
        
        // Cargar opciones de aceros
        elements.aceroFilter.innerHTML = '<option value="">Todos los materiales</option>';
        options.aceros.forEach(acero => {
            const option = document.createElement('option');
            option.value = acero;
            option.textContent = acero;
            elements.aceroFilter.appendChild(option);
        });
        
        // Cargar opciones de tipos de alambre
        elements.alambreFilter.innerHTML = '<option value="">Todos los tipos</option>';
        options.alambres.forEach(alambre => {
            const option = document.createElement('option');
            option.value = alambre;
            option.textContent = alambre;
            elements.alambreFilter.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error cargando opciones de filtros:', error);
        // Si falla, mantener opciones vacías
    }
}

// Toggle filtros avanzados
function toggleAdvancedFilters() {
    const isExpanded = elements.advancedFilters.classList.contains('expanded');
    
    if (isExpanded) {
        elements.advancedFilters.classList.remove('expanded');
        elements.advancedToggle.classList.remove('active');
        elements.advancedToggle.querySelector('.toggle-text').textContent = 'Mostrar Filtros Avanzados';
    } else {
        elements.advancedFilters.classList.add('expanded');
        elements.advancedToggle.classList.add('active');
        elements.advancedToggle.querySelector('.toggle-text').textContent = 'Ocultar Filtros Avanzados';
    }
}

// Recopilar todos los filtros actuales
function gatherFilters() {
    return {
        empresa: elements.empresaFilter.value,
        numero_parte: elements.numeroParteFilter.value,
        laminacion_vcl: elements.laminacionFilter.value,
        troquel: elements.troqueFilter.value,
        prensa: elements.prensaFilter.value,
        acero: elements.aceroFilter.value,
        peso_min: elements.pesoMinFilter.value,
        peso_max: elements.pesoMaxFilter.value,
        espesor_min: elements.espesorMinFilter.value,
        espesor_max: elements.espesorMaxFilter.value,
        tipo_alambre: elements.alambreFilter.value,
        texto_libre: elements.textoLibreFilter.value
    };
}

// Actualizar filtros activos
function updateActiveFilters() {
    const filters = gatherFilters();
    const activeFilters = [];
    
    // Mapear nombres amigables
    const filterNames = {
        empresa: 'Empresa',
        numero_parte: 'Número de Parte',
        laminacion_vcl: 'Laminación VC',
        troquel: 'Troquel',
        prensa: 'Prensa',
        acero: 'Material',
        peso_min: 'Peso Mínimo',
        peso_max: 'Peso Máximo',
        espesor_min: 'Espesor Mínimo',
        espesor_max: 'Espesor Máximo',
        tipo_alambre: 'Tipo de Alambre',
        texto_libre: 'Búsqueda Libre'
    };
    
    // Construir lista de filtros activos
    Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
            activeFilters.push({
                key,
                name: filterNames[key],
                value: value.trim()
            });
        }
    });
    
    // Mostrar/ocultar panel de filtros activos
    if (activeFilters.length > 0) {
        elements.activeFilters.classList.add('visible');
        elements.activeFiltersList.innerHTML = activeFilters.map(filter => `
            <div class="filter-tag">
                <span>${filter.name}: ${filter.value}</span>
                <button class="remove-filter" onclick="removeFilter('${filter.key}')">×</button>
            </div>
        `).join('');
    } else {
        elements.activeFilters.classList.remove('visible');
    }
}

// Remover filtro específico
function removeFilter(filterKey) {
    const filterElements = {
        empresa: elements.empresaFilter,
        numero_parte: elements.numeroParteFilter,
        laminacion_vcl: elements.laminacionFilter,
        troquel: elements.troqueFilter,
        prensa: elements.prensaFilter,
        acero: elements.aceroFilter,
        peso_min: elements.pesoMinFilter,
        peso_max: elements.pesoMaxFilter,
        espesor_min: elements.espesorMinFilter,
        espesor_max: elements.espesorMaxFilter,
        tipo_alambre: elements.alambreFilter,
        texto_libre: elements.textoLibreFilter
    };
    
    const element = filterElements[filterKey];
    if (element) {
        element.value = '';
        handleSearch();
    }
}

// Limpiar todos los filtros
function clearAllFilters() {
    elements.empresaFilter.value = '';
    elements.numeroParteFilter.value = '';
    elements.laminacionFilter.value = '';
    elements.troqueFilter.value = '';
    elements.prensaFilter.value = '';
    elements.aceroFilter.value = '';
    elements.pesoMinFilter.value = '';
    elements.pesoMaxFilter.value = '';
    elements.espesorMinFilter.value = '';
    elements.espesorMaxFilter.value = '';
    elements.alambreFilter.value = '';
    elements.textoLibreFilter.value = '';
    
    handleSearch();
}

// Mostrar modal de búsquedas guardadas
function showSavedSearchesModal() {
    loadSavedSearches();
    elements.savedSearchesModal.style.display = 'block';
}

// Ocultar modal de búsquedas guardadas
function hideSavedSearchesModal() {
    elements.savedSearchesModal.style.display = 'none';
}

// Cargar búsquedas guardadas
function loadSavedSearches() {
    if (savedSearches.length === 0) {
        elements.savedSearchesList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No hay búsquedas guardadas</p>';
        return;
    }
    
    elements.savedSearchesList.innerHTML = savedSearches.map(search => `
        <div class="saved-search-item">
            <div class="saved-search-info">
                <h4>${search.name}</h4>
                <p>${search.description || 'Sin descripción'}</p>
                <small>Guardado: ${new Date(search.created).toLocaleDateString()}</small>
            </div>
            <div class="saved-search-actions">
                <button class="load-search-btn" onclick="loadSavedSearch('${search.id}')">Cargar</button>
                <button class="delete-search-btn" onclick="deleteSavedSearch('${search.id}')">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Guardar búsqueda actual
function handleSaveSearch() {
    const name = elements.searchName.value.trim();
    if (!name) {
        NotificationManager.warning('Campo requerido', 'Por favor, ingresa un nombre para la búsqueda');
        return;
    }
    
    const filters = gatherFilters();
    const hasFilters = Object.values(filters).some(value => value && value.trim());
    
    if (!hasFilters) {
        NotificationManager.warning('Sin filtros', 'No hay filtros aplicados para guardar');
        return;
    }
    
    const search = {
        id: Date.now().toString(),
        name,
        description: elements.searchDescription.value.trim(),
        filters,
        created: new Date().toISOString()
    };
    
    savedSearches.push(search);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    
    NotificationManager.success('Búsqueda guardada', `"${name}" se guardó correctamente`);
    
    // Limpiar formulario
    elements.searchName.value = '';
    elements.searchDescription.value = '';
    
    // Recargar lista
    loadSavedSearches();
}

// Cargar búsqueda guardada
function loadSavedSearch(searchId) {
    const search = savedSearches.find(s => s.id === searchId);
    if (!search) return;
    
    // Aplicar filtros
    const filterElements = {
        empresa: elements.empresaFilter,
        numero_parte: elements.numeroParteFilter,
        laminacion_vcl: elements.laminacionFilter,
        troquel: elements.troqueFilter,
        prensa: elements.prensaFilter,
        acero: elements.aceroFilter,
        peso_min: elements.pesoMinFilter,
        peso_max: elements.pesoMaxFilter,
        espesor_min: elements.espesorMinFilter,
        espesor_max: elements.espesorMaxFilter,
        tipo_alambre: elements.alambreFilter,
        texto_libre: elements.textoLibreFilter
    };
    
    Object.entries(search.filters).forEach(([key, value]) => {
        const element = filterElements[key];
        if (element) {
            element.value = value || '';
        }
    });
    
    // Mostrar filtros avanzados si es necesario
    const advancedFiltersUsed = ['prensa', 'acero', 'peso_min', 'peso_max', 'espesor_min', 'espesor_max', 'tipo_alambre', 'texto_libre'];
    const needsAdvanced = advancedFiltersUsed.some(key => search.filters[key]);
    
    if (needsAdvanced && !elements.advancedFilters.classList.contains('expanded')) {
        toggleAdvancedFilters();
    }
    
    // Ejecutar búsqueda
    handleSearch();
    
    // Cerrar modal
    hideSavedSearchesModal();
    
    NotificationManager.success('Búsqueda cargada', `"${search.name}" se aplicó correctamente`);
}

// Eliminar búsqueda guardada
function deleteSavedSearch(searchId) {
    const searchIndex = savedSearches.findIndex(s => s.id === searchId);
    if (searchIndex === -1) return;
    
    const search = savedSearches[searchIndex];
    
    if (confirm(`¿Estás seguro de que quieres eliminar la búsqueda "${search.name}"?`)) {
        savedSearches.splice(searchIndex, 1);
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        loadSavedSearches();
        NotificationManager.info('Búsqueda eliminada', `"${search.name}" fue eliminada`);
    }
}

// Mostrar modal de exportación
function showExportModal() {
    updateExportPreview();
    if (elements.exportModal) {
        elements.exportModal.style.display = 'block';
        console.log('Export modal shown');
    }
}

// Ocultar modal de exportación
function hideExportModal() {
    if (elements.exportModal) {
        elements.exportModal.style.display = 'none';
        console.log('Export modal hidden');
    }
}

// Actualizar vista previa de exportación
function updateExportPreview() {
    const filters = gatherFilters();
    const activeFilters = Object.entries(filters).filter(([key, value]) => value && value.trim());
    
    // Simular conteo (en implementación real, esto vendría del servidor)
    elements.exportCount.textContent = 'Calculando...';
    elements.exportFilters.textContent = activeFilters.length > 0 ? 
        activeFilters.map(([key, value]) => `${key}: ${value}`).join(', ') : 'Ninguno';
    
    // Obtener conteo real del servidor
    fetch(`${API_BASE_URL}/laminaciones/count?${new URLSearchParams(filters)}`)
        .then(response => response.json())
        .then(data => {
            elements.exportCount.textContent = data.count?.toLocaleString() || '0';
        })
        .catch(error => {
            console.error('Error obteniendo conteo:', error);
            elements.exportCount.textContent = 'Error';
        });
}

// Manejar exportación
function handleExport() {
    const format = document.querySelector('input[name="export-format"]:checked').value;
    const includeHeaders = document.getElementById('include-headers').checked;
    const includeAllFields = document.getElementById('include-all-fields').checked;
    const includeFiltersInfo = document.getElementById('include-filters-info').checked;
    
    const filters = gatherFilters();
    const exportParams = {
        format,
        includeHeaders,
        includeAllFields,
        includeFiltersInfo,
        ...filters
    };
    
    // Crear enlace de descarga
    const queryParams = new URLSearchParams(exportParams);
    const downloadUrl = `${API_BASE_URL}/laminaciones/export?${queryParams}`;
    
    // Crear enlace temporal y hacer clic
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `laminaciones_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    NotificationManager.success('Exportación iniciada', 'La descarga comenzará en breve');
    hideExportModal();
}

// Cargar datos de laminaciones
async function loadData() {
    try {
        showLoader();
        
        const filters = gatherFilters();
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            ...filters
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
        updateActiveFilters();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError('Error al cargar los datos de laminaciones');
    } finally {
        hideLoader();
    }
}

// Manejar búsqueda
function handleSearch() {
    currentPage = 1;
    currentFilters = gatherFilters();
    loadData();
}

// Manejar limpiar filtros
function handleClear() {
    clearAllFilters();
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
            <td>${item.numero_parte || '-'}</td>
            <td class="hide-mobile">${item.laminacion_vcl || '-'}</td>
            <td class="hide-mobile">${item.troquel || '-'}</td>
            <td class="hide-mobile">${item.prensa_1 || '-'}</td>
            <td class="hide-small">${item.peso_pieza_kg ? parseFloat(item.peso_pieza_kg).toFixed(6) : '-'}</td>
            <td>
                <button class="btn-details" onclick="showDetails('${item.id}')">
                    Ver Detalles
                </button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
}

// Actualizar contador de resultados
function updateResultsCounter(totalItems) {
    if (totalItems === 0) {
        elements.resultsCounter.innerHTML = '<span>No se encontraron resultados</span>';
    } else if (totalItems === 1) {
        elements.resultsCounter.innerHTML = '<span><span class="highlight">1</span> resultado encontrado</span>';
    } else {
        elements.resultsCounter.innerHTML = `<span><span class="highlight">${totalItems}</span> resultados encontrados</span>`;
    }
}

// Actualizar paginación
function updatePagination(pagination) {
    totalPages = pagination.totalPages;
    currentPage = pagination.currentPage;
    
    // Actualizar contador de resultados
    updateResultsCounter(pagination.totalItems);
    
    elements.paginationText.textContent = 
        `Mostrando ${pagination.startItem} - ${pagination.endItem} de ${pagination.totalItems}`;
    
    elements.pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    
    elements.prevBtn.disabled = currentPage <= 1;
    elements.nextBtn.disabled = currentPage >= totalPages;
}

// Cambiar página
function changePage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadData();
    }
}

// Mostrar detalles
async function showDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/laminaciones/${id}`);
        if (!response.ok) throw new Error('Error al cargar detalles');
        
        const data = await response.json();
        
        // Crear HTML con todos los detalles
        const detailsHTML = `
            <div class="detail-grid">
                <div class="detail-section">
                    <h3>Información Básica</h3>
                    <p><strong>Empresa:</strong> ${data.empresa || '-'}</p>
                    <p><strong>Número de Parte:</strong> ${data.numero_parte || '-'}</p>
                    <p><strong>Descripción del Cliente:</strong> ${data.descripcion_cliente || '-'}</p>
                    <p><strong>Nivel de Revisión:</strong> ${data.nivel_revision || '-'}</p>
                    <p><strong>Laminación VCL:</strong> ${data.laminacion_vcl || '-'}</p>
                    <p><strong>Referencia:</strong> ${data.referencia || '-'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Información de Troquel</h3>
                    <p><strong>Troquel:</strong> ${data.troquel || '-'}</p>
                    <p><strong>Paso Troquel:</strong> ${data.paso_troquel_mm ? data.paso_troquel_mm + ' mm' : '-'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Configuración de Prensas</h3>
                    <p><strong>Prensa 1:</strong> ${data.prensa_1 || '-'}</p>
                    <p><strong>Prensa 2:</strong> ${data.prensa_2 || '-'}</p>
                    <p><strong>Prensa 3:</strong> ${data.prensa_3 || '-'}</p>
                    <p><strong>Prensa 4:</strong> ${data.prensa_4 || '-'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Especificaciones de Material</h3>
                    <p><strong>Acero 1:</strong> ${data.acero_1 || '-'}</p>
                    <p><strong>Acero 2:</strong> ${data.acero_2 || '-'}</p>
                    <p><strong>Acero 3:</strong> ${data.acero_3 || '-'}</p>
                    <p><strong>Horneado:</strong> ${data.horneado || '-'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Dimensiones y Pesos</h3>
                    <p><strong>Espesor:</strong> ${data.espesor_pulg ? parseFloat(data.espesor_pulg).toFixed(6) + ' pulg.' : '-'}</p>
                    <p><strong>Ancho Cinta:</strong> ${data.ancho_cinta_pulg ? parseFloat(data.ancho_cinta_pulg).toFixed(3) + ' pulg.' : '-'}</p>
                    <p><strong>Peso por Pieza:</strong> ${data.peso_pieza_kg ? parseFloat(data.peso_pieza_kg).toFixed(6) + ' kg' : '-'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Configuración de Alambre</h3>
                    <p><strong>Tipo de Alambre:</strong> ${data.tipo_alambre || '-'}</p>
                    <p><strong>Calibre de Alambre:</strong> ${data.cal_alambre || '-'}</p>
                    <p><strong>Longitud Corte:</strong> ${data.long_corte_alambre || '-'}</p>
                    <p><strong>Peso de Alambre:</strong> ${data.peso_alambre_kg ? parseFloat(data.peso_alambre_kg).toFixed(6) + ' kg' : '-'}</p>
                    <p><strong>Piezas por Alambre:</strong> ${data.piezas_por_alambre || '-'}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Características Especiales</h3>
                    <p>${data.caracteristica_especial || 'Ninguna'}</p>
                </div>
            </div>
        `;
        
        elements.detailContent.innerHTML = detailsHTML;
        elements.modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error cargando detalles:', error);
        showError('Error al cargar los detalles de la laminación');
    }
}

// Ocultar modal
function hideModal() {
    elements.modal.style.display = 'none';
}

// Mostrar modal de producción
function showProductionModal() {
    loadCompaniesForProduction();
    elements.productionModal.style.display = 'block';
}

// Ocultar modal de producción
function hideProductionModal() {
    elements.productionModal.style.display = 'none';
    elements.productionForm.reset();
}

// Cargar empresas para producción
async function loadCompaniesForProduction() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (!response.ok) throw new Error('Error al cargar empresas');
        
        const companies = await response.json();
        
        elements.productionEmpresa.innerHTML = '<option value="">Seleccionar empresa</option>';
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa;
            option.textContent = company.empresa;
            elements.productionEmpresa.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando empresas para producción:', error);
    }
}

// Manejar envío de producción
async function handleProductionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        empresa: elements.productionEmpresa.value,
        numero_parte: elements.productionNumeroParte.value,
        kilos_producidos: parseFloat(elements.productionKilos.value),
        cantidad_alambres: parseInt(elements.productionAlambres.value) || null,
        libras: parseFloat(elements.productionLibras.value) || null,
        notas: elements.productionNotas.value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/produccion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Error al registrar producción');
        
        showSuccess('Producción registrada correctamente');
        hideProductionModal();
        
        // Recargar estadísticas
        loadStats();
        
    } catch (error) {
        console.error('Error registrando producción:', error);
        showError('Error al registrar la producción');
    }
}

// Mostrar modal de nueva laminación
function showNewLaminationModal() {
    loadCompaniesForNewLamination();
    elements.newLaminationModal.style.display = 'block';
}

// Ocultar modal de nueva laminación
function hideNewLaminationModal() {
    elements.newLaminationModal.style.display = 'none';
    elements.newLaminationForm.reset();
}

// Cargar empresas para nueva laminación
async function loadCompaniesForNewLamination() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (!response.ok) throw new Error('Error al cargar empresas');
        
        const companies = await response.json();
        
        const newEmpresaSelect = document.getElementById('new-empresa');
        newEmpresaSelect.innerHTML = '<option value="">Seleccionar empresa</option>';
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.empresa;
            option.textContent = company.empresa;
            newEmpresaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando empresas para nueva laminación:', error);
    }
}

// Manejar envío de nueva laminación
async function handleNewLaminationSubmit(e) {
    e.preventDefault();
    
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
        prensa_2: document.getElementById('new-prensa-2').value,
        prensa_3: document.getElementById('new-prensa-3').value,
        prensa_4: document.getElementById('new-prensa-4').value,
        acero_1: document.getElementById('new-acero-1').value,
        acero_2: document.getElementById('new-acero-2').value,
        acero_3: document.getElementById('new-acero-3').value,
        horneado: document.getElementById('new-horneado').value,
        espesor_pulg: parseFloat(document.getElementById('new-espesor-pulg').value) || null,
        peso_pieza_kg: parseFloat(document.getElementById('new-peso-pieza').value) || null
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/laminaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Error al crear laminación');
        
        NotificationManager.success('Laminación creada', 'La nueva laminación se creó correctamente');
        hideNewLaminationModal();
        
        // Recargar datos y estadísticas
        loadStats();
        loadData();
        
    } catch (error) {
        console.error('Error creando laminación:', error);
        NotificationManager.error('Error', 'No se pudo crear la laminación');
    }
}

// Mostrar/ocultar loader
function showLoader() {
    elements.loader.style.display = 'flex';
}

function hideLoader() {
    elements.loader.style.display = 'none';
}

// ========================================
// DARK MODE & THEME SYSTEM
// ========================================

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Actualizar meta theme-color para móviles
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1a1a2e' : '#667eea';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Notificación del cambio de tema
        NotificationManager.show(
            `Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`,
            'success',
            `Tema cambiado a modo ${newTheme === 'dark' ? 'oscuro' : 'claro'}`,
            2000
        );
    }

    setupToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

class NotificationManager {
    static container = null;
    static notifications = new Map();
    static nextId = 1;

    static init() {
        this.container = document.getElementById('notifications-container');
        if (!this.container) {
            console.warn('Notifications container not found');
        }
    }

    static show(title, type = 'info', message = '', duration = 5000) {
        if (!this.container) {
            console.warn('Notifications not initialized');
            return null;
        }

        const id = this.nextId++;
        const notification = this.createNotification(id, title, type, message, duration);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }

        return id;
    }

    static createNotification(id, title, type, message, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.dataset.id = id;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                ${message ? `<div class="notification-message">${message}</div>` : ''}
            </div>
            <button class="notification-close" onclick="NotificationManager.remove(${id})">&times;</button>
        `;

        // Agregar barra de progreso si tiene duración
        if (duration > 0) {
            const progressBar = document.createElement('div');
            progressBar.className = 'notification-progress';
            progressBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: var(--notification-color, var(--accent-primary));
                width: 100%;
                animation: progress ${duration}ms linear forwards;
            `;
            notification.appendChild(progressBar);

            // Agregar animación CSS dinámicamente
            if (!document.getElementById('notification-progress-style')) {
                const style = document.createElement('style');
                style.id = 'notification-progress-style';
                style.textContent = `
                    @keyframes progress {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        return notification;
    }

    static remove(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.classList.add('removing');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    static clear() {
        this.notifications.forEach((notification, id) => {
            this.remove(id);
        });
    }

    static success(title, message = '', duration = 4000) {
        return this.show(title, 'success', message, duration);
    }

    static error(title, message = '', duration = 6000) {
        return this.show(title, 'error', message, duration);
    }

    static warning(title, message = '', duration = 5000) {
        return this.show(title, 'warning', message, duration);
    }

    static info(title, message = '', duration = 4000) {
        return this.show(title, 'info', message, duration);
    }
}

// Instanciar managers globales
let themeManager;

// Reemplazar función showError existente con el nuevo sistema
function showError(message, title = 'Error') {
    NotificationManager.error(title, message);
}

function showSuccess(message, title = 'Éxito') {
    NotificationManager.success(title, message);
}

function showWarning(message, title = 'Advertencia') {
    NotificationManager.warning(title, message);
}

// ========================================
// PWA FUNCTIONALITY
// ========================================

// Registrar Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('[PWA] Service Worker registrado exitosamente:', registration);
            
            // Verificar actualizaciones
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Hay una nueva versión disponible
                        NotificationManager.info(
                            'Actualización disponible',
                            'Hay una nueva versión de la aplicación. Recarga la página para actualizar.',
                            8000
                        );
                    }
                });
            });
            
            return registration;
        } catch (error) {
            console.error('[PWA] Error registrando Service Worker:', error);
            NotificationManager.warning(
                'PWA no disponible',
                'La funcionalidad offline no está disponible en este navegador.'
            );
        }
    } else {
        console.log('[PWA] Service Worker no soportado en este navegador');
    }
}

// Configurar funcionalidades PWA
function setupPWAFeatures() {
    // Detectar si ya está instalada como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] Aplicación ejecutándose como PWA');
        document.body.classList.add('pwa-installed');
        return;
    }
    
    // Manejar evento de instalación
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (event) => {
        console.log('[PWA] Evento beforeinstallprompt disparado');
        event.preventDefault();
        deferredPrompt = event;
        showInstallButton();
    });
    
    // Función para mostrar botón de instalación
    function showInstallButton() {
        // Crear botón de instalación si no existe
        if (!document.getElementById('install-btn')) {
            const installButton = document.createElement('button');
            installButton.id = 'install-btn';
            installButton.innerHTML = '📱 Instalar App';
            installButton.className = 'install-btn';
            installButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
                transition: all 0.3s ease;
                z-index: 9999;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            installButton.addEventListener('click', installApp);
            document.body.appendChild(installButton);
            
            // Animación de entrada
            setTimeout(() => {
                installButton.style.transform = 'translateY(0)';
                installButton.style.opacity = '1';
            }, 100);
        }
    }
    
    // Función para instalar la aplicación
    async function installApp() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('[PWA] Usuario aceptó la instalación');
                NotificationManager.success(
                    '¡Instalación exitosa!',
                    'La aplicación se ha instalado correctamente'
                );
                
                // Ocultar botón de instalación
                const installBtn = document.getElementById('install-btn');
                if (installBtn) {
                    installBtn.remove();
                }
            } else {
                console.log('[PWA] Usuario rechazó la instalación');
            }
            
            deferredPrompt = null;
        }
    }
    
    // Detectar cuando se instala la PWA
    window.addEventListener('appinstalled', (event) => {
        console.log('[PWA] Aplicación instalada exitosamente');
        NotificationManager.success(
            '¡App instalada!',
            'Ya puedes usar VC Laminations desde tu pantalla de inicio'
        );
        
        // Ocultar botón de instalación
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    });
}

// Manejar estado de conexión
function setupNetworkHandlers() {
    // Estado inicial
    updateNetworkStatus();
    
    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
        console.log('[PWA] Conexión restaurada');
        updateNetworkStatus();
        NotificationManager.success(
            'Conexión restaurada',
            'Ya puedes acceder a todas las funciones'
        );
        
        // Recargar datos si es necesario
        if (typeof loadData === 'function') {
            loadData();
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('[PWA] Conexión perdida');
        updateNetworkStatus();
        NotificationManager.warning(
            'Sin conexión',
            'Modo offline activado. Algunas funciones pueden estar limitadas.'
        );
    });
}

// Actualizar indicador de estado de red
function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline', !isOnline);
    
    // Actualizar tema color para PWA
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.content = isOnline ? '#667eea' : '#95a5a6';
    }
}

// Función para limpiar cache (útil para desarrollo)
async function clearPWACache() {
    if ('serviceWorker' in navigator && 'caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('[PWA] Cache limpiado');
            NotificationManager.success(
                'Cache limpiado',
                'La aplicación se ha actualizado correctamente'
            );
        } catch (error) {
            console.error('[PWA] Error limpiando cache:', error);
        }
    }
}

// Función para forzar actualización
function forceUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.update();
            });
        });
    }
    window.location.reload();
}

// Hacer funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
    window.PWA = {
        clearCache: clearPWACache,
        forceUpdate: forceUpdate,
        checkInstallability: setupPWAFeatures
    };
}

// ========================================
// SISTEMA DE AUTOCOMPLETADO
// ========================================

// Estado del autocompletado
let autocompleteState = {
    isOpen: false,
    currentField: null,
    suggestions: [],
    selectedIndex: -1,
    debounceTimer: null,
    currentRequest: null
};

// Elementos del DOM para autocompletado
const autocompleteElements = {
    container: document.getElementById('autocomplete-suggestions'),
    // Campos que tendrán autocompletado
    fields: {
        'numero-parte-filter': 'numeros-parte',
        'laminacion-filter': 'laminaciones',
        'troquel-filter': 'troqueles',
        'texto-libre-filter': 'busqueda-libre'
    }
};

// Función para inicializar el autocompletado
function initializeAutocomplete() {
    console.log('Inicializando sistema de autocompletado...');
    
    // Configurar cada campo con autocompletado
    Object.keys(autocompleteElements.fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            console.log(`Configurando autocompletado para: ${fieldId}`);
            setupFieldAutocomplete(field, fieldId);
        }
    });
    
    // Listener global para cerrar autocompletado
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container') && 
            !e.target.closest('.search-field')) {
            hideAutocomplete();
        }
    });
    
    // Listener para Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && autocompleteState.isOpen) {
            hideAutocomplete();
        }
    });
}

// Configurar autocompletado para un campo específico
function setupFieldAutocomplete(field, fieldId) {
    const endpoint = autocompleteElements.fields[fieldId];
    
    field.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        handleAutocompleteInput(field, endpoint, query);
    });
    
    field.addEventListener('keydown', (e) => {
        handleAutocompleteKeydown(e, field);
    });
    
    field.addEventListener('focus', (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            handleAutocompleteInput(field, endpoint, query);
        }
    });
    
    field.addEventListener('blur', (e) => {
        // Delay para permitir clic en sugerencia
        setTimeout(() => {
            hideAutocomplete();
        }, 200);
    });
}

// Manejar entrada de texto en campo de autocompletado
function handleAutocompleteInput(field, endpoint, query) {
    // Limpiar timer anterior
    if (autocompleteState.debounceTimer) {
        clearTimeout(autocompleteState.debounceTimer);
    }
    
    // Cancelar request anterior
    if (autocompleteState.currentRequest) {
        autocompleteState.currentRequest.abort();
    }
    
    if (query.length < 2) {
        hideAutocomplete();
        return;
    }
    
    // Debounce de 300ms
    autocompleteState.debounceTimer = setTimeout(() => {
        fetchSuggestions(field, endpoint, query);
    }, 300);
}

// Buscar sugerencias en el servidor
async function fetchSuggestions(field, endpoint, query) {
    try {
        showAutocompleteLoading(field);
        
        const controller = new AbortController();
        autocompleteState.currentRequest = controller;
        
        const response = await fetch(`${API_BASE_URL}/autocomplete/${endpoint}?q=${encodeURIComponent(query)}`, {
            signal: controller.signal
        });
        
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }
        
        const suggestions = await response.json();
        autocompleteState.currentRequest = null;
        
        showAutocompleteSuggestions(field, suggestions, query);
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error obteniendo sugerencias:', error);
            hideAutocomplete();
        }
    }
}

// Mostrar indicador de carga
function showAutocompleteLoading(field) {
    autocompleteState.currentField = field;
    autocompleteState.isOpen = true;
    
    positionAutocomplete(field);
    
    autocompleteElements.container.innerHTML = `
        <div class="autocomplete-loading">
            Buscando sugerencias...
        </div>
    `;
    
    autocompleteElements.container.classList.add('show');
}

// Mostrar sugerencias
function showAutocompleteSuggestions(field, suggestions, query) {
    autocompleteState.currentField = field;
    autocompleteState.suggestions = suggestions;
    autocompleteState.selectedIndex = -1;
    autocompleteState.isOpen = true;
    
    positionAutocomplete(field);
    
    if (suggestions.length === 0) {
        autocompleteElements.container.innerHTML = `
            <div class="autocomplete-no-results">
                No se encontraron resultados para "${query}"
            </div>
        `;
    } else {
        autocompleteElements.container.innerHTML = suggestions.map((suggestion, index) => {
            const highlightedText = highlightMatch(suggestion.text, query);
            const typeLabel = getTypeLabel(suggestion.type);
            
            return `
                <div class="autocomplete-item" data-index="${index}">
                    <div class="autocomplete-text">${highlightedText}</div>
                    <div class="autocomplete-type">${typeLabel}</div>
                </div>
            `;
        }).join('');
        
        // Agregar event listeners a los items
        autocompleteElements.container.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(item.dataset.index);
                selectSuggestion(index);
            });
        });
    }
    
    autocompleteElements.container.classList.add('show');
}

// Posicionar el dropdown de autocompletado
function positionAutocomplete(field) {
    const fieldRect = field.getBoundingClientRect();
    const container = autocompleteElements.container;
    
    container.style.position = 'fixed';
    container.style.top = `${fieldRect.bottom + 4}px`;
    container.style.left = `${fieldRect.left}px`;
    container.style.width = `${fieldRect.width}px`;
    container.style.zIndex = '1001';
}

// Resaltar texto coincidente
function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="match">$1</span>');
}

// Obtener etiqueta del tipo de sugerencia
function getTypeLabel(type) {
    const labels = {
        'empresa': 'EMPRESA',
        'numero_parte': 'NÚMERO',
        'laminacion': 'LAMINACIÓN',
        'troquel': 'TROQUEL'
    };
    return labels[type] || type.toUpperCase();
}

// Manejar navegación con teclado
function handleAutocompleteKeydown(e, field) {
    if (!autocompleteState.isOpen || autocompleteState.suggestions.length === 0) {
        return;
    }
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            autocompleteState.selectedIndex = Math.min(
                autocompleteState.selectedIndex + 1,
                autocompleteState.suggestions.length - 1
            );
            updateSelectedItem();
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            autocompleteState.selectedIndex = Math.max(
                autocompleteState.selectedIndex - 1,
                -1
            );
            updateSelectedItem();
            break;
            
        case 'Enter':
            e.preventDefault();
            if (autocompleteState.selectedIndex >= 0) {
                selectSuggestion(autocompleteState.selectedIndex);
            }
            break;
            
        case 'Tab':
            if (autocompleteState.selectedIndex >= 0) {
                e.preventDefault();
                selectSuggestion(autocompleteState.selectedIndex);
            } else {
                hideAutocomplete();
            }
            break;
    }
}

// Actualizar item seleccionado visualmente
function updateSelectedItem() {
    const items = autocompleteElements.container.querySelectorAll('.autocomplete-item');
    
    items.forEach((item, index) => {
        item.classList.toggle('highlighted', index === autocompleteState.selectedIndex);
    });
    
    // Scroll al item seleccionado
    if (autocompleteState.selectedIndex >= 0) {
        const selectedItem = items[autocompleteState.selectedIndex];
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest' });
        }
    }
}

// Seleccionar una sugerencia
function selectSuggestion(index) {
    const suggestion = autocompleteState.suggestions[index];
    if (!suggestion || !autocompleteState.currentField) return;
    
    autocompleteState.currentField.value = suggestion.text;
    hideAutocomplete();
    
    // Trigger search si está configurado
    if (autocompleteState.currentField.id !== 'texto-libre-filter') {
        // Delay para permitir que el valor se actualice
        setTimeout(() => {
            handleSearch();
        }, 100);
    }
    
    // Notificación de selección
    NotificationManager.success(
        'Sugerencia seleccionada',
        `${getTypeLabel(suggestion.type)}: ${suggestion.text}`,
        2000
    );
}

// Ocultar autocompletado
function hideAutocomplete() {
    autocompleteState.isOpen = false;
    autocompleteState.currentField = null;
    autocompleteState.suggestions = [];
    autocompleteState.selectedIndex = -1;
    
    autocompleteElements.container.classList.remove('show');
    
    // Limpiar timer si existe
    if (autocompleteState.debounceTimer) {
        clearTimeout(autocompleteState.debounceTimer);
        autocompleteState.debounceTimer = null;
    }
    
    // Cancelar request si existe
    if (autocompleteState.currentRequest) {
        autocompleteState.currentRequest.abort();
        autocompleteState.currentRequest = null;
    }
}
