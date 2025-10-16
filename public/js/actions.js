// Definición de acciones de testing

const TestActions = {
  // Navegación
  openUrl: {
    type: 'openUrl',
    category: 'navigation',
    name: 'Abrir URL',
    icon: '🌐',
    description: 'Navegar a una URL específica',
    params: {
      url: {
        type: 'text',
        label: 'URL',
        required: true,
        placeholder: 'https://ejemplo.com',
      },
    },
  },
  goBack: {
    type: 'goBack',
    category: 'navigation',
    name: 'Retroceder',
    icon: '◀️',
    description: 'Ir a la página anterior del historial',
    params: {},
  },
  goForward: {
    type: 'goForward',
    category: 'navigation',
    name: 'Avanzar',
    icon: '▶️',
    description: 'Ir a la página siguiente del historial',
    params: {},
  },
  reload: {
    type: 'reload',
    category: 'navigation',
    name: 'Recargar',
    icon: '🔄',
    description: 'Recargar la página actual',
    params: {},
  },
  switchTab: {
    type: 'switchTab',
    category: 'navigation',
    name: 'Cambiar Pestaña',
    icon: '🗂️',
    description: 'Cambiar a otra pestaña del navegador',
    params: {
      tabIndex: {
        type: 'number',
        label: 'Índice de pestaña',
        required: true,
        placeholder: '0',
      },
    },
  },

  // Interacción
  click: {
    type: 'click',
    category: 'interaction',
    name: 'Click',
    icon: '👆',
    description: 'Hacer click en un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#btnSubmit',
      },
    },
  },
  doubleClick: {
    type: 'doubleClick',
    category: 'interaction',
    name: 'Doble Click',
    icon: '👆👆',
    description: 'Hacer doble click en un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#element',
      },
    },
  },
  rightClick: {
    type: 'rightClick',
    category: 'interaction',
    name: 'Click Derecho',
    icon: '🖱️',
    description: 'Hacer click derecho en un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#element',
      },
    },
  },
  type: {
    type: 'type',
    category: 'interaction',
    name: 'Escribir Texto',
    icon: '⌨️',
    description: 'Escribir texto en un campo',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#input',
      },
      text: {
        type: 'text',
        label: 'Texto',
        required: true,
        placeholder: 'Texto a escribir',
      },
    },
  },
  fill: {
    type: 'fill',
    category: 'interaction',
    name: 'Rellenar Campo',
    icon: '✏️',
    description: 'Rellenar un campo de formulario',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'input[name="email"]',
      },
      value: {
        type: 'text',
        label: 'Valor',
        required: true,
        placeholder: 'test@example.com',
      },
    },
  },
  select: {
    type: 'select',
    category: 'interaction',
    name: 'Seleccionar Opción',
    icon: '📋',
    description: 'Seleccionar opción de un dropdown',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'select#country',
      },
      option: {
        type: 'text',
        label: 'Opción',
        required: true,
        placeholder: 'España',
      },
    },
  },
  check: {
    type: 'check',
    category: 'interaction',
    name: 'Marcar Checkbox',
    icon: '☑️',
    description: 'Marcar un checkbox',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'input[type="checkbox"]',
      },
    },
  },
  uncheck: {
    type: 'uncheck',
    category: 'interaction',
    name: 'Desmarcar Checkbox',
    icon: '☐',
    description: 'Desmarcar un checkbox',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'input[type="checkbox"]',
      },
    },
  },
  hover: {
    type: 'hover',
    category: 'interaction',
    name: 'Hover',
    icon: '👋',
    description: 'Hacer hover sobre un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.menu-item',
      },
    },
  },
  dragDrop: {
    type: 'dragDrop',
    category: 'interaction',
    name: 'Drag & Drop',
    icon: '🎯',
    description: 'Arrastrar y soltar un elemento',
    params: {
      source: {
        type: 'text',
        label: 'Elemento Origen',
        required: true,
        placeholder: '#draggable',
      },
      target: {
        type: 'text',
        label: 'Elemento Destino',
        required: true,
        placeholder: '#droppable',
      },
    },
  },
  press: {
    type: 'press',
    category: 'interaction',
    name: 'Presionar Tecla',
    icon: '⏎',
    description: 'Presionar una tecla',
    params: {
      key: {
        type: 'text',
        label: 'Tecla',
        required: true,
        placeholder: 'Enter',
      },
    },
  },

  // Validación
  getText: {
    type: 'getText',
    category: 'validation',
    name: 'Obtener Texto',
    icon: '📝',
    description: 'Obtener el texto de un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.message',
      },
      variable: {
        type: 'text',
        label: 'Variable',
        required: false,
        placeholder: 'textoObtenido',
      },
    },
  },
  getAttribute: {
    type: 'getAttribute',
    category: 'validation',
    name: 'Leer Atributo',
    icon: '🏷️',
    description: 'Obtener un atributo de un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'a.link',
      },
      attribute: {
        type: 'text',
        label: 'Atributo',
        required: true,
        placeholder: 'href',
      },
      variable: {
        type: 'text',
        label: 'Variable',
        required: false,
        placeholder: 'urlObtenida',
      },
    },
  },
  getValue: {
    type: 'getValue',
    category: 'validation',
    name: 'Obtener Valor',
    icon: '💾',
    description: 'Obtener el valor de un input',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'input#email',
      },
      variable: {
        type: 'text',
        label: 'Variable',
        required: false,
        placeholder: 'emailValue',
      },
    },
  },
  isVisible: {
    type: 'isVisible',
    category: 'validation',
    name: 'Verificar Visible',
    icon: '👁️',
    description: 'Verificar si un elemento es visible',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.success-message',
      },
    },
  },
  isEnabled: {
    type: 'isEnabled',
    category: 'validation',
    name: 'Verificar Habilitado',
    icon: '✅',
    description: 'Verificar si un elemento está habilitado',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'button#submit',
      },
    },
  },
  exists: {
    type: 'exists',
    category: 'validation',
    name: 'Verificar Existe',
    icon: '🔍',
    description: 'Verificar si un elemento existe en el DOM',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#elementId',
      },
    },
  },
  validateUrl: {
    type: 'validateUrl',
    category: 'validation',
    name: 'Validar URL',
    icon: '🔗',
    description: 'Validar que la URL contiene un texto',
    params: {
      expected: {
        type: 'text',
        label: 'URL Esperada',
        required: true,
        placeholder: '/dashboard',
      },
    },
  },
  validateTitle: {
    type: 'validateTitle',
    category: 'validation',
    name: 'Validar Título',
    icon: '📄',
    description: 'Validar el título de la página',
    params: {
      expected: {
        type: 'text',
        label: 'Título Esperado',
        required: true,
        placeholder: 'Dashboard',
      },
    },
  },
  assertText: {
    type: 'assertText',
    category: 'validation',
    name: 'Verificar Texto',
    icon: '✔️',
    description: 'Verificar que un elemento contiene texto específico',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.message',
      },
      expected: {
        type: 'text',
        label: 'Texto Esperado',
        required: true,
        placeholder: 'Éxito',
      },
    },
  },
  assertValue: {
    type: 'assertValue',
    category: 'validation',
    name: 'Verificar Valor',
    icon: '🎯',
    description: 'Verificar el valor de un input',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'input',
      },
      expected: {
        type: 'text',
        label: 'Valor Esperado',
        required: true,
        placeholder: 'test',
      },
    },
  },

  // Control (continúa...)
  openNewTab: {
    type: 'openNewTab',
    category: 'control',
    name: 'Abrir Pestaña',
    icon: '➕',
    description: 'Abrir una nueva pestaña',
    params: {
      url: {
        type: 'text',
        label: 'URL (opcional)',
        required: false,
        placeholder: 'https://...',
      },
    },
  },

  closeTab: {
    type: 'closeTab',
    category: 'control',
    name: 'Cerrar Pestaña',
    icon: '✖️',
    description: 'Cerrar la pestaña actual',
    params: {},
  },
  openWindow: {
    type: 'openWindow',
    category: 'control',
    name: 'Abrir Ventana',
    icon: '🪟',
    description: 'Abrir una nueva ventana',
    params: {
      url: {
        type: 'text',
        label: 'URL',
        required: true,
        placeholder: 'https://...',
      },
    },
  },
  closeWindow: {
    type: 'closeWindow',
    category: 'control',
    name: 'Cerrar Ventana',
    icon: '❌',
    description: 'Cerrar la ventana actual',
    params: {},
  },
  maximize: {
    type: 'maximize',
    category: 'control',
    name: 'Maximizar',
    icon: '⛶',
    description: 'Maximizar la ventana del navegador',
    params: {},
  },
  handleAlert: {
    type: 'handleAlert',
    category: 'control',
    name: 'Manejar Alerta',
    icon: '⚠️',
    description: 'Aceptar o rechazar una alerta',
    params: {
      action: {
        type: 'select',
        label: 'Acción',
        required: true,
        options: ['accept', 'dismiss'],
        default: 'accept',
      },
    },
  },
  handleConfirm: {
    type: 'handleConfirm',
    category: 'control',
    name: 'Manejar Confirm',
    icon: '❓',
    description: 'Aceptar o rechazar un diálogo de confirmación',
    params: {
      action: {
        type: 'select',
        label: 'Acción',
        required: true,
        options: ['accept', 'dismiss'],
        default: 'accept',
      },
    },
  },
  handlePrompt: {
    type: 'handlePrompt',
    category: 'control',
    name: 'Manejar Prompt',
    icon: '💬',
    description: 'Responder a un prompt',
    params: {
      text: {
        type: 'text',
        label: 'Texto',
        required: true,
        placeholder: 'Respuesta',
      },
      action: {
        type: 'select',
        label: 'Acción',
        required: true,
        options: ['accept', 'dismiss'],
        default: 'accept',
      },
    },
  },
  setCookie: {
    type: 'setCookie',
    category: 'control',
    name: 'Establecer Cookie',
    icon: '🍪',
    description: 'Establecer una cookie',
    params: {
      name: {
        type: 'text',
        label: 'Nombre',
        required: true,
        placeholder: 'sessionId',
      },
      value: {
        type: 'text',
        label: 'Valor',
        required: true,
        placeholder: 'abc123',
      },
    },
  },
  getCookie: {
    type: 'getCookie',
    category: 'control',
    name: 'Obtener Cookie',
    icon: '🍪',
    description: 'Obtener el valor de una cookie',
    params: {
      name: {
        type: 'text',
        label: 'Nombre',
        required: true,
        placeholder: 'sessionId',
      },
      variable: {
        type: 'text',
        label: 'Variable',
        required: false,
        placeholder: 'cookieValue',
      },
    },
  },
  clearCookies: {
    type: 'clearCookies',
    category: 'control',
    name: 'Limpiar Cookies',
    icon: '🧹',
    description: 'Limpiar todas las cookies',
    params: {},
  },
  localStorage: {
    type: 'localStorage',
    category: 'control',
    name: 'Local Storage',
    icon: '💾',
    description: 'Interactuar con localStorage',
    params: {
      action: {
        type: 'select',
        label: 'Acción',
        required: true,
        options: ['get', 'set', 'remove', 'clear'],
        default: 'get',
      },
      key: {
        type: 'text',
        label: 'Clave',
        required: false,
        placeholder: 'userId',
      },
      value: {
        type: 'text',
        label: 'Valor',
        required: false,
        placeholder: '12345',
      },
    },
  },

  // Esperas
  waitVisible: {
    type: 'waitVisible',
    category: 'wait',
    name: 'Esperar Visible',
    icon: '⏳👁️',
    description: 'Esperar a que un elemento sea visible',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.loader',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '5000',
        default: 5000,
      },
    },
  },
  waitClickable: {
    type: 'waitClickable',
    category: 'wait',
    name: 'Esperar Clickeable',
    icon: '⏳👆',
    description: 'Esperar a que un elemento sea clickeable',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'button#submit',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '5000',
        default: 5000,
      },
    },
  },
  waitPresent: {
    type: 'waitPresent',
    category: 'wait',
    name: 'Esperar Presente',
    icon: '⏳🔍',
    description: 'Esperar a que un elemento esté en el DOM',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#dynamicElement',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '5000',
        default: 5000,
      },
    },
  },
  waitDisappear: {
    type: 'waitDisappear',
    category: 'wait',
    name: 'Esperar Desaparecer',
    icon: '⏳👻',
    description: 'Esperar a que un elemento desaparezca',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.loading',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '5000',
        default: 5000,
      },
    },
  },
  waitText: {
    type: 'waitText',
    category: 'wait',
    name: 'Esperar Texto',
    icon: '⏳📝',
    description: 'Esperar a que aparezca un texto específico',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '.status',
      },
      text: {
        type: 'text',
        label: 'Texto',
        required: true,
        placeholder: 'Completado',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '5000',
        default: 5000,
      },
    },
  },
  waitPageLoad: {
    type: 'waitPageLoad',
    category: 'wait',
    name: 'Esperar Carga',
    icon: '⏳📄',
    description: 'Esperar a que la página cargue completamente',
    params: {
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '30000',
        default: 30000,
      },
    },
  },
  wait: {
    type: 'wait',
    category: 'wait',
    name: 'Espera Fija',
    icon: '⏱️',
    description: 'Esperar un tiempo fijo',
    params: {
      duration: {
        type: 'number',
        label: 'Duración (ms)',
        required: true,
        placeholder: '1000',
      },
    },
  },
  waitCondition: {
    type: 'waitCondition',
    category: 'wait',
    name: 'Esperar Condición',
    icon: '⏳✅',
    description: 'Esperar a que se cumpla una condición personalizada',
    params: {
      condition: {
        type: 'textarea',
        label: 'Condición JS',
        required: true,
        placeholder: 'return document.readyState === "complete"',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        required: false,
        placeholder: '5000',
        default: 5000,
      },
    },
  },

  // Avanzado
  screenshot: {
    type: 'screenshot',
    category: 'advanced',
    name: 'Screenshot',
    icon: '📸',
    description: 'Tomar captura de pantalla completa',
    params: {
      filename: {
        type: 'text',
        label: 'Nombre archivo',
        required: false,
        placeholder: 'screenshot.png',
      },
    },
  },
  screenshotElement: {
    type: 'screenshotElement',
    category: 'advanced',
    name: 'Screenshot Elemento',
    icon: '📷',
    description: 'Tomar captura de un elemento específico',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#element',
      },
      filename: {
        type: 'text',
        label: 'Nombre archivo',
        required: false,
        placeholder: 'element.png',
      },
    },
  },
  scroll: {
    type: 'scroll',
    category: 'advanced',
    name: 'Scroll',
    icon: '📜',
    description: 'Hacer scroll en la página',
    params: {
      x: {
        type: 'number',
        label: 'Posición X',
        required: false,
        placeholder: '0',
        default: 0,
      },
      y: {
        type: 'number',
        label: 'Posición Y',
        required: true,
        placeholder: '500',
      },
    },
  },
  scrollTo: {
    type: 'scrollTo',
    category: 'advanced',
    name: 'Scroll a Elemento',
    icon: '🎯',
    description: 'Hacer scroll hasta un elemento',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: '#section',
      },
    },
  },
  switchIframe: {
    type: 'switchIframe',
    category: 'advanced',
    name: 'Cambiar a Iframe',
    icon: '🖼️',
    description: 'Cambiar el contexto a un iframe',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'iframe#myFrame',
      },
    },
  },
  uploadFile: {
    type: 'uploadFile',
    category: 'advanced',
    name: 'Subir Archivo',
    icon: '📤',
    description: 'Subir un archivo',
    params: {
      selector: {
        type: 'text',
        label: 'Selector CSS',
        required: true,
        placeholder: 'input[type="file"]',
      },
      filepath: {
        type: 'text',
        label: 'Ruta del archivo',
        required: true,
        placeholder: '/path/to/file.pdf',
      },
    },
  },
  downloadFile: {
    type: 'downloadFile',
    category: 'advanced',
    name: 'Descargar Archivo',
    icon: '📥',
    description: 'Descargar un archivo',
    params: {
      url: {
        type: 'text',
        label: 'URL del archivo',
        required: true,
        placeholder: 'https://...',
      },
    },
  },
  executeScript: {
    type: 'executeScript',
    category: 'advanced',
    name: 'Ejecutar Script',
    icon: '💻',
    description: 'Ejecutar JavaScript personalizado',
    params: {
      script: {
        type: 'textarea',
        label: 'Código JavaScript',
        required: true,
        placeholder: 'console.log("Hello");',
      },
    },
  },
  log: {
    type: 'log',
    category: 'advanced',
    name: 'Log/Comentario',
    icon: '📋',
    description: 'Agregar un log o comentario',
    params: {
      message: {
        type: 'textarea',
        label: 'Mensaje',
        required: true,
        placeholder: 'Punto de verificación...',
      },
    },
  },
};

// Obtener acción por tipo
function getActionByType(type) {
  return TestActions[type] || null;
}

// Obtener acciones por categoría
function getActionsByCategory(category) {
  return Object.values(TestActions).filter((action) => action.category === category);
}

// Obtener todas las categorías
function getAllCategories() {
  const categories = new Set();
  Object.values(TestActions).forEach((action) => {
    categories.add(action.category);
  });
  return Array.from(categories);
}

// Exportar
window.TestActions = TestActions;
window.getActionByType = getActionByType;
window.getActionsByCategory = getActionsByCategory;
window.getAllCategories = getAllCategories;
