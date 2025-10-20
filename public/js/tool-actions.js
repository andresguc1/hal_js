// Gestión de acciones de testing en el panel de herramientas

let currentCategory = 'navigation';

// Cambiar categoría de herramientas
function switchToolCategory(category) {
  currentCategory = category;

  // Actualizar pestañas
  document.querySelectorAll('.tools-tab').forEach((tab) => {
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Actualizar contenido
  document.querySelectorAll('.tools-category').forEach((content) => {
    if (content.dataset.category === category) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Getter para evitar warning de variable no usada
function getCurrentCategory() {
  return currentCategory;
}

// Inicializar listeners de acciones
function setupActionListeners() {
  document.querySelectorAll('.tool-action-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      // Ignorar clicks que son producto de un drag sobre el mismo botón
      const wasDragged = btn.dataset._wasDragged === 'true';
      const dragTime = Number(btn.dataset._dragTime || 0);
      const now = Date.now();

      // Ignorar si marcó como arrastrado o si hubo un drag en los últimos 700ms
      if (wasDragged || (dragTime && now - dragTime < 700)) {
        // limpiar marcas por si acaso y evitar duplicados
        delete btn.dataset._wasDragged;
        delete btn.dataset._dragTime;
        return;
      }

      // NUEVO: ignorar si justo antes se creó una acción por drop
      const lastDrop = Number(window._lastActionCreatedByDrop || 0);
      if (lastDrop && now - lastDrop < 800) {
        // limpiar la marca global y salir
        delete window._lastActionCreatedByDrop;
        return;
      }

      const actionType = btn.dataset.action;
      const configPage = btn.dataset.configPage;

      // Si hay un formulario de configuración, abrirlo
      if (configPage && window.configPanel?.loadPage) {
        window.configPanel.loadPage(configPage, (formData) => {
          const actionDef = {
            name: btn.querySelector('.tool-name')?.textContent?.trim() ?? actionType,
            icon: btn.querySelector('.tool-icon')?.textContent ?? '',
            config: formData ?? {},
          };
          if (window.app?.addActionToWorkspace) window.app.addActionToWorkspace(actionType, actionDef);
        });
      } else {
        // Crear con configuración por defecto
        const actionDef = {
          name: btn.querySelector('.tool-name')?.textContent?.trim() ?? actionType,
          icon: btn.querySelector('.tool-icon')?.textContent ?? '',
          config: {},
        };
        if (window.app?.addActionToWorkspace) window.app.addActionToWorkspace(actionType, actionDef);
      }
    });

    // Drag and drop
    btn.setAttribute('draggable', 'true');

    btn.addEventListener('dragstart', function (e) {
      const actionType = this.dataset.action;
      e.dataTransfer.setData('actionType', actionType);
      e.dataTransfer.effectAllowed = 'copy';
      this.style.opacity = '0.5';
    });

    // eliminar parámetro no usado
    btn.addEventListener('dragend', function () {
      this.style.opacity = '1';
    });
  });
}

// Agregar acción al workspace
async function addActionToWorkspace(actionType, x = null, y = null) {
  const actionDef = window.TestActions?.[actionType] ?? {};
  if (!actionType) {
    console.warn('[toolActions] addActionToWorkspace: actionType vacío');
    return;
  }

  const buttonEl = document.querySelector(`.tool-action-btn[data-action="${actionType}"]`);
  let configPage = actionDef.configPage || buttonEl?.dataset?.configPage;

  console.log('[toolActions] addActionToWorkspace', { actionType, actionDef, buttonHasConfig: !!buttonEl, buttonConfigPage: buttonEl?.dataset?.configPage, resolvedConfigPage: configPage });

  // Helper para crear la acción en el workspace (pasa coords si existen)
  const createAction = (configObj = {}) => {
    const def = {
      name: actionDef.name ?? (buttonEl?.querySelector('.tool-name')?.textContent?.trim() ?? actionType),
      icon: actionDef.icon ?? (buttonEl?.querySelector('.tool-icon')?.textContent ?? ''),
      config: Object.assign({}, actionDef.config ?? {}, configObj ?? {}),
    };
    if (window.app?.addActionToWorkspace) {
      window.app.addActionToWorkspace(actionType, def, x, y);
      window._lastActionCreatedByDrop = Date.now();
    } else {
      console.warn('[toolActions] app.addActionToWorkspace no disponible');
    }
  };

  // Resolve possible URLs for config page (try relative, leading slash, /public/...)
  async function findWorkingUrl(p) {
    if (!p) return null;
    const candidates = [];
    const clean = p.replace(/^\/+/, '');
    candidates.push(p);
    if (!p.startsWith('/')) candidates.push('/' + clean);
    candidates.push('/public/' + clean);

    for (const c of candidates) {
      try {
        // probar con HEAD para evitar descargar el recurso completo
        const res = await fetch(c, { method: 'HEAD' });
        if (res.ok) return c;
      } catch (err) {
        // ignora y prueba siguiente candidato
      }
    }
    // fallback: devolver original p (se intentará cargar)
    return p;
  }

  // Si hay página de configuración, resolver su URL y abrirla
  if (configPage && window.configPanel?.loadPage) {
    const resolved = await findWorkingUrl(configPage);
    let finalUrl = resolved || configPage;
    if (typeof finalUrl === 'string') {
      const sep = finalUrl.includes('?') ? '&' : '?';
      finalUrl = finalUrl + sep + '_t=' + Date.now();
    }
    console.log('[toolActions] loading config page for', actionType, finalUrl);
    try {
      window.configPanel.loadPage(finalUrl, (formData) => {
        createAction(formData ?? {});
      }, Object.assign({}, actionDef.config ?? {}));
    } catch (err) {
      // fallback si loadPage no acepta initial data
      window.configPanel.loadPage(finalUrl, (formData) => {
        createAction(formData ?? {});
      });
    }
    return;
  }

  // Si hay params definidos pero no configPage, crear con defaults
  const params = actionDef.params || {};
  if (Object.keys(params).length > 0) {
    const defaults = {};
    Object.keys(params).forEach((p) => {
      defaults[p] = params[p]?.default ?? '';
    });
    createAction(defaults);
    return;
  }

  // Caso por defecto: crear acción sin configuración extra
  createAction(actionDef.config ?? {});
}

// Obtener configuración de acción por defecto
function getDefaultActionConfig(actionDef) {
  const config = {
    name: actionDef.name,
    icon: actionDef.icon,
    description: actionDef.description,
  };

  // Agregar parámetros con valores por defecto (protegido si no hay params)
  const params = actionDef.params || {};
  Object.keys(params).forEach((paramName) => {
    const param = params[paramName];
    config[paramName] = param?.default || '';
  });

  return config;
}

// Validar configuración de acción
function validateActionConfig(actionType, config) {
  const actionDef = window.TestActions?.[actionType];
  if (!actionDef) return { valid: false, errors: ['Acción no encontrada'] };

  const errors = [];
  const params = actionDef.params || {};

  Object.keys(params).forEach((paramName) => {
    const param = params[paramName];
    const value = config[paramName];

    if (param && param.required && (!value || value.toString().trim() === '')) {
      errors.push(`El campo "${param.label}" es obligatorio`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

// Exportar funciones
window.toolActions = {
  switchCategory: switchToolCategory,
  setupListeners: setupActionListeners,
  addToWorkspace: addActionToWorkspace,
  getDefaultConfig: getDefaultActionConfig,
  validateConfig: validateActionConfig,
  getCurrentCategory, // exportado para uso/lectura externa
};

// Funciones globales para HTML
window.switchToolCategory = switchToolCategory;
