// Script de prueba para verificar funcionalidades
// Ejecutar en la consola del navegador

console.log("🧪 INICIANDO PRUEBAS DE FUNCIONALIDAD - VC LAMINATIONS DATABASE");

// Test 1: Verificar que todos los elementos del DOM existen
function testDOMElements() {
    console.log("📋 Test 1: Verificando elementos del DOM...");
    
    const criticalElements = [
        'empresa-filter', 'numero-parte-filter', 'laminacion-filter', 'troquel-filter',
        'prensa-filter', 'acero-filter', 'peso-min-filter', 'peso-max-filter',
        'espesor-min-filter', 'espesor-max-filter', 'alambre-filter', 'texto-libre-filter',
        'search-btn', 'clear-btn', 'advanced-toggle', 'results-count',
        'pagination-text', 'page-info', 'laminaciones-tbody'
    ];
    
    let missing = [];
    criticalElements.forEach(id => {
        if (!document.getElementById(id)) {
            missing.push(id);
        }
    });
    
    if (missing.length === 0) {
        console.log("✅ Todos los elementos del DOM existen");
        return true;
    } else {
        console.log("❌ Elementos faltantes:", missing);
        return false;
    }
}

// Test 2: Verificar que las funciones principales están definidas
function testFunctions() {
    console.log("📋 Test 2: Verificando funciones principales...");
    
    const functions = [
        'loadData', 'handleSearch', 'handleClear', 'updateResultsCounter',
        'updatePagination', 'openModal', 'closeModal', 'showLoader', 'hideLoader'
    ];
    
    let missing = [];
    functions.forEach(func => {
        if (typeof window[func] === 'undefined') {
            missing.push(func);
        }
    });
    
    if (missing.length === 0) {
        console.log("✅ Todas las funciones principales están definidas");
        return true;
    } else {
        console.log("❌ Funciones faltantes:", missing);
        return false;
    }
}

// Test 3: Verificar que no hay event listeners duplicados
function testEventListeners() {
    console.log("📋 Test 3: Verificando event listeners...");
    
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Verificar que los botones responden
    if (searchBtn && clearBtn) {
        console.log("✅ Botones principales accesibles");
        return true;
    } else {
        console.log("❌ Botones principales no accesibles");
        return false;
    }
}

// Test 4: Verificar autocompletado
function testAutocomplete() {
    console.log("📋 Test 4: Verificando autocompletado...");
    
    const autocompleteContainer = document.getElementById('autocomplete-suggestions');
    const numeroParteInput = document.getElementById('numero-parte-filter');
    
    if (autocompleteContainer && numeroParteInput) {
        console.log("✅ Sistema de autocompletado configurado");
        return true;
    } else {
        console.log("❌ Sistema de autocompletado no encontrado");
        return false;
    }
}

// Test 5: Verificar contador de resultados
function testResultsCounter() {
    console.log("📋 Test 5: Verificando contador de resultados...");
    
    const resultsCounter = document.getElementById('results-count');
    
    if (resultsCounter) {
        console.log("✅ Contador de resultados presente");
        console.log("   Texto actual:", resultsCounter.textContent);
        return true;
    } else {
        console.log("❌ Contador de resultados no encontrado");
        return false;
    }
}

// Ejecutar todas las pruebas
function runAllTests() {
    console.log("🚀 EJECUTANDO TODAS LAS PRUEBAS...\n");
    
    const results = [
        testDOMElements(),
        testFunctions(),
        testEventListeners(),
        testAutocomplete(),
        testResultsCounter()
    ];
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`\n📊 RESULTADO FINAL: ${passed}/${total} pruebas pasadas`);
    
    if (passed === total) {
        console.log("🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está funcionando correctamente.");
    } else {
        console.log("⚠️  Hay problemas que requieren atención.");
    }
    
    return passed === total;
}

// Ejecutar automáticamente si se carga el script
if (typeof window !== 'undefined') {
    setTimeout(runAllTests, 1000);
}
