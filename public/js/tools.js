// Gestión de las herramientas

// Inicializar listeners de herramientas
function setupToolListeners() {
  document.querySelectorAll('.tool-shape').forEach((tool) => {
    // Click simple - agregar forma al actions-frame
    tool.addEventListener('click', function () {
      const shapeType = this.dataset.shape;
      if (window.app) {
        window.app.addShapeToActionsFrame(shapeType);
      }
    });
  });
}

// Obtener información de la herramienta
function getToolInfo(type) {
  const toolInfo = {
    oval: {
      name: 'Inicio/Fin',
      description: 'Representa el inicio o fin de un proceso',
      category: 'Básicas',
      icon: '⭕',
    },
    rectangle: {
      name: 'Proceso',
      description: 'Representa una acción o proceso a realizar',
      category: 'Básicas',
      icon: '▭',
    },
    diamond: {
      name: 'Decisión',
      description: 'Representa un punto de decisión o validación',
      category: 'Básicas',
      icon: '◆',
    },
    parallelogram: {
      name: 'Input/Output',
      description: 'Representa entrada o salida de datos',
      category: 'Básicas',
      icon: '▱',
    },
    roundedRect: {
      name: 'Subproceso',
      description: 'Representa un subproceso o función',
      category: 'Avanzadas',
      icon: '▢',
    },
    hexagon: {
      name: 'Preparación',
      description: 'Representa preparación o inicialización',
      category: 'Avanzadas',
      icon: '⬡',
    },
    trapezoid: {
      name: 'Manual',
      description: 'Representa una acción manual',
      category: 'Avanzadas',
      icon: '⏢',
    },
    cylinder: {
      name: 'Base de Datos',
      description: 'Representa almacenamiento de datos',
      category: 'Avanzadas',
      icon: '🗄',
    },
    arrow: {
      name: 'Flecha',
      description: 'Representa la dirección del flujo',
      category: 'Conectores',
      icon: '→',
    },
    connector: {
      name: 'Conector',
      description: 'Conecta diferentes partes del diagrama',
      category: 'Conectores',
      icon: '●',
    },
  };

  return (
    toolInfo[type] || {
      name: 'Desconocido',
      description: '',
      category: '',
      icon: '',
    }
  );
}

// Filtrar herramientas por categoría
function filterToolsByCategory(category) {
  const categories = document.querySelectorAll('.tool-category');

  categories.forEach((cat) => {
    const title = cat.querySelector('.category-title').textContent;
    if (category === 'all' || title === category) {
      cat.style.display = 'flex';
    } else {
      cat.style.display = 'none';
    }
  });
}

// Buscar herramientas
function searchTools(query) {
  const tools = document.querySelectorAll('.tool-shape');
  query = query.toLowerCase();

  tools.forEach((tool) => {
    const type = tool.dataset.shape;
    const info = getToolInfo(type);
    const text = (info.name + ' ' + info.description).toLowerCase();

    if (text.includes(query)) {
      tool.style.display = 'flex';
    } else {
      tool.style.display = 'none';
    }
  });
}

// Resetear vista de herramientas
function resetToolsView() {
  const tools = document.querySelectorAll('.tool-shape');
  const categories = document.querySelectorAll('.tool-category');

  tools.forEach((tool) => {
    tool.style.display = 'flex';
  });

  categories.forEach((cat) => {
    cat.style.display = 'flex';
  });
}

// Obtener todas las herramientas disponibles
function getAllTools() {
  const tools = [];
  document.querySelectorAll('.tool-shape').forEach((tool) => {
    const type = tool.dataset.shape;
    tools.push({
      type: type,
      ...getToolInfo(type),
    });
  });
  return tools;
}

// Exportar funciones
window.tools = {
  setup: setupToolListeners,
  getInfo: getToolInfo,
  filterByCategory: filterToolsByCategory,
  search: searchTools,
  reset: resetToolsView,
  getAll: getAllTools,
};
