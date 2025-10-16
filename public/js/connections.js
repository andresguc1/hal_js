// Sistema de conexiones estilo n8n

let connections = [];
let connectionIdCounter = 0;
let isDraggingConnection = false;
let connectionDragStart = null;
let previewLine = null;
let dragIndicator = null;

// ===== HELPER: Obtener workspace activo =====
function getActiveWorkspace() {
  if (window.tabs?.getActiveWorkspace) {
    try {
      const workspace = window.tabs.getActiveWorkspace();
      if (workspace) return workspace;
    } catch (e) {
      console.warn('Error al obtener workspace desde tabs:', e);
    }
  }

  // Fallback: buscar workspace directamente
  return (
    document.querySelector('.workspace-content:not(.hidden)') ||
    document.querySelector('.workspace-content')
  );
}

// Inicializar sistema de conexiones
function initConnections() {
  connections = [];
  connectionIdCounter = 0;
  isDraggingConnection = false;
  connectionDragStart = null;

  // Verificar que existan workspaces primero
  const workspaces = document.querySelectorAll('.workspace-content');
  if (workspaces.length === 0) {
    console.warn('⚠️ No hay workspaces todavía. Esperando...');
    setTimeout(initConnections, 100);
    return;
  }

  createConnectionsCanvas();

  document.addEventListener('mousemove', handleConnectionDrag);
  document.addEventListener('mouseup', handleConnectionMouseUp);
  document.addEventListener('keydown', handleConnectionKeyboard);

  console.log('✅ Sistema de conexiones inicializado');
}

// Crear canvas SVG
function createConnectionsCanvas() {
  const workspaces = document.querySelectorAll('.workspace-content');

  if (workspaces.length === 0) {
    console.warn('⚠️ No se encontraron workspaces');
    return;
  }

  workspaces.forEach((workspace) => {
    if (!workspace.querySelector('.connections-canvas')) {
      const canvas = document.createElement('div');
      canvas.className = 'connections-canvas';

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.overflow = 'visible';

      canvas.appendChild(svg);
      workspace.insertBefore(canvas, workspace.firstChild);

      console.log('✅ Canvas SVG creado en:', workspace.id);
    }
  });
}

// Agregar puntos de conexión a un bloque
function addConnectionPoints(blockElement) {
  if (blockElement.querySelector('.connection-points')) {
    return;
  }

  const points = document.createElement('div');
  points.className = 'connection-points';

  const blockId = blockElement.dataset.id;

  // Punto de entrada principal (izquierda)
  const inputPoint = createConnectionPoint(blockId, 'input-main', 'input');
  points.appendChild(inputPoint);

  // Punto de salida principal (derecha)
  const outputPoint = createConnectionPoint(blockId, 'output-main', 'output');
  points.appendChild(outputPoint);

  // Botón plus para agregar más conexiones
  const plusBtn = document.createElement('div');
  plusBtn.className = 'connection-add-btn';
  plusBtn.innerHTML = '+';
  plusBtn.title = 'Agregar conexión';
  plusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  points.appendChild(plusBtn);

  blockElement.appendChild(points);
}

// Crear un punto de conexión
function createConnectionPoint(blockId, position, type) {
  const point = document.createElement('div');
  point.className = `connection-point ${position} ${type}`;
  point.dataset.blockId = blockId;
  point.dataset.position = position;
  point.dataset.type = type;

  if (type === 'output') {
    point.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startConnectionDrag(blockId, position, e);
    });
  }

  point.addEventListener('mouseenter', () => {
    if (isDraggingConnection && type === 'input') {
      point.classList.add('highlight');
    }
  });

  point.addEventListener('mouseleave', () => {
    point.classList.remove('highlight');
  });

  return point;
}

// Iniciar drag de conexión
function startConnectionDrag(blockId, position, _event) {
  isDraggingConnection = true;
  connectionDragStart = { blockId, position };

  const sourceBlock = document.querySelector(`.action-block[data-id="${blockId}"]`);
  if (sourceBlock) {
    sourceBlock.classList.add('connecting', 'connection-source');

    const point = sourceBlock.querySelector(`.connection-point[data-position="${position}"]`);
    if (point) {
      point.classList.add('dragging', 'active');
    }
  }

  // Resaltar bloques de destino
  document.querySelectorAll('.action-block').forEach((block) => {
    if (block.dataset.id !== blockId) {
      block.classList.add('connection-target');
      const inputPoints = block.querySelectorAll('.connection-point.input');
      inputPoints.forEach((p) => p.classList.add('active'));
    }
  });

  document.body.style.cursor = 'crosshair';

  createPreviewLine();
  showDragIndicator('Arrastra hacia un punto de entrada');
}

// Crear línea de preview
function createPreviewLine() {
  const workspace = getActiveWorkspace();
  const svg = workspace?.querySelector('.connections-canvas svg');

  if (svg && !previewLine) {
    previewLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    previewLine.classList.add('connection-preview');
    svg.appendChild(previewLine);
  }
}

// Manejar drag
function handleConnectionDrag(e) {
  if (!isDraggingConnection || !connectionDragStart || !previewLine) return;

  const workspace = getActiveWorkspace();
  if (!workspace) return;

  const workspaceRect = workspace.getBoundingClientRect();
  const scrollContainer = workspace.closest('.workspace-container');

  const sourceBlock = document.querySelector(
    `.action-block[data-id="${connectionDragStart.blockId}"]`
  );
  if (!sourceBlock) return;

  const startPos = getPointPosition(sourceBlock, connectionDragStart.position, workspace);
  const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

  const endX = e.clientX - workspaceRect.left + scrollLeft;
  const endY = e.clientY - workspaceRect.top + scrollTop;

  const path = createOrthogonalPath(startPos.x, startPos.y, endX, endY);
  previewLine.setAttribute('d', path);

  updateDragIndicator(e.clientX, e.clientY);

  const targetPoint = document.elementFromPoint(e.clientX, e.clientY);
  if (targetPoint?.classList.contains('connection-point') && targetPoint.dataset.type === 'input') {
    updateDragIndicator(e.clientX, e.clientY, '✓ Suelta para conectar');
  }
}

// Manejar mouse up
function handleConnectionMouseUp(e) {
  if (!isDraggingConnection) return;

  const targetElement = document.elementFromPoint(e.clientX, e.clientY);

  if (
    targetElement?.classList.contains('connection-point') &&
    targetElement.dataset.type === 'input'
  ) {
    const targetBlockId = targetElement.dataset.blockId;
    const targetPosition = targetElement.dataset.position;

    finishConnection(targetBlockId, targetPosition);
  } else {
    cancelConnection();
  }
}

// Finalizar conexión
function finishConnection(targetBlockId, targetPosition) {
  if (!connectionDragStart) return;

  // Validar
  if (connectionDragStart.blockId === targetBlockId) {
    cancelConnection();
    if (typeof window.showNotification === 'function') {
      window.showNotification('❌ No puedes conectar un bloque consigo mismo', true);
    }
    return;
  }

  const exists = connections.some(
    (conn) =>
      conn.from.blockId === connectionDragStart.blockId &&
      conn.from.position === connectionDragStart.position &&
      conn.to.blockId === targetBlockId &&
      conn.to.position === targetPosition
  );

  if (exists) {
    cancelConnection();
    if (typeof window.showNotification === 'function') {
      window.showNotification('⚠️ Esta conexión ya existe', true);
    }
    return;
  }

  const connection = {
    id: connectionIdCounter++,
    from: {
      blockId: connectionDragStart.blockId,
      position: connectionDragStart.position,
    },
    to: {
      blockId: targetBlockId,
      position: targetPosition,
    },
    type: 'default',
  };

  connections.push(connection);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      drawConnection(connection);
    });
  });

  cancelConnection();

  if (typeof window.showNotification === 'function') {
    window.showNotification('✅ Conexión creada');
  }
}

// Cancelar conexión
function cancelConnection() {
  isDraggingConnection = false;

  document.querySelectorAll('.action-block').forEach((block) => {
    block.classList.remove('connecting', 'connection-source', 'connection-target');
  });

  document.querySelectorAll('.connection-point').forEach((point) => {
    point.classList.remove('dragging', 'active', 'highlight');
  });

  connectionDragStart = null;
  document.body.style.cursor = 'default';

  if (previewLine) {
    previewLine.remove();
    previewLine = null;
  }

  hideDragIndicator();
}

// Obtener posición de un punto
function getPointPosition(block, position, workspace) {
  if (!workspace) workspace = getActiveWorkspace();

  const rect = block.getBoundingClientRect();
  const workspaceRect = workspace.getBoundingClientRect();
  const scrollContainer = workspace.closest('.workspace-container');

  const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
  const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

  const baseX = rect.left - workspaceRect.left + scrollLeft;
  const baseY = rect.top - workspaceRect.top + scrollTop;

  const positions = {
    'input-main': { x: baseX, y: baseY + rect.height / 2 },
    'output-main': { x: baseX + rect.width, y: baseY + rect.height / 2 },
    'output-top': { x: baseX + rect.width, y: baseY + rect.height * 0.25 },
    'output-bottom': { x: baseX + rect.width, y: baseY + rect.height * 0.75 },
  };

  return positions[position] || positions['output-main'];
}

// Crear path ortogonal
function createOrthogonalPath(x1, y1, x2, y2) {
  const midX = x1 + (x2 - x1) / 2;
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
}

// Dibujar conexión
function drawConnection(connection) {
  const workspace = getActiveWorkspace();
  const svg = workspace?.querySelector('.connections-canvas svg');
  if (!svg) {
    console.warn('No se encontró SVG canvas');
    return;
  }

  const fromBlock = workspace.querySelector(`.action-block[data-id="${connection.from.blockId}"]`);
  const toBlock = workspace.querySelector(`.action-block[data-id="${connection.to.blockId}"]`);

  if (!fromBlock || !toBlock) {
    console.warn('No se encontraron bloques', connection);
    return;
  }

  const fromPos = getPointPosition(fromBlock, connection.from.position, workspace);
  const toPos = getPointPosition(toBlock, connection.to.position, workspace);

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.dataset.connectionId = connection.id;
  group.dataset.from = connection.from.blockId;
  group.dataset.to = connection.to.blockId;
  group.classList.add('connection-group');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add('connection-line', connection.type);
  path.setAttribute('d', createOrthogonalPath(fromPos.x, fromPos.y, toPos.x, toPos.y));

  path.addEventListener('click', (e) => {
    e.stopPropagation();
    selectConnection(connection.id);
  });

  // Círculos en los extremos
  const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  startCircle.classList.add('connection-endpoint');
  startCircle.setAttribute('cx', fromPos.x);
  startCircle.setAttribute('cy', fromPos.y);
  startCircle.setAttribute('r', 4);

  const endCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  endCircle.classList.add('connection-endpoint');
  endCircle.setAttribute('cx', toPos.x);
  endCircle.setAttribute('cy', toPos.y);
  endCircle.setAttribute('r', 4);

  group.appendChild(path);
  group.appendChild(startCircle);
  group.appendChild(endCircle);

  svg.appendChild(group);
}

// Actualizar todas las conexiones
function updateAllConnections() {
  const workspace = getActiveWorkspace();
  if (!workspace) return;

  connections.forEach((connection) => {
    const group = workspace.querySelector(`[data-connection-id="${connection.id}"]`);
    if (!group) return;

    const fromBlock = workspace.querySelector(
      `.action-block[data-id="${connection.from.blockId}"]`
    );
    const toBlock = workspace.querySelector(`.action-block[data-id="${connection.to.blockId}"]`);

    if (!fromBlock || !toBlock) return;

    const fromPos = getPointPosition(fromBlock, connection.from.position, workspace);
    const toPos = getPointPosition(toBlock, connection.to.position, workspace);

    const path = group.querySelector('.connection-line');
    if (path) {
      path.setAttribute('d', createOrthogonalPath(fromPos.x, fromPos.y, toPos.x, toPos.y));
    }

    const circles = group.querySelectorAll('.connection-endpoint');
    if (circles[0]) {
      circles[0].setAttribute('cx', fromPos.x);
      circles[0].setAttribute('cy', fromPos.y);
    }
    if (circles[1]) {
      circles[1].setAttribute('cx', toPos.x);
      circles[1].setAttribute('cy', toPos.y);
    }
  });
}

// Seleccionar conexión
function selectConnection(connectionId) {
  document.querySelectorAll('.connection-line').forEach((line) => {
    line.classList.remove('selected');
  });

  const group = document.querySelector(`[data-connection-id="${connectionId}"]`);
  if (group) {
    const line = group.querySelector('.connection-line');
    if (line) {
      line.classList.add('selected');
    }
  }
}

// Eliminar conexión
function deleteConnection(connectionId) {
  connections = connections.filter((c) => c.id !== connectionId);

  const group = document.querySelector(`[data-connection-id="${connectionId}"]`);
  if (group) {
    group.remove();
  }

  if (typeof window.showNotification === 'function') {
    window.showNotification('🗑️ Conexión eliminada');
  }
}

// Eliminar conexiones de un bloque
function removeConnectionsForBlock(blockId) {
  const toRemove = connections.filter(
    (conn) => conn.from.blockId === blockId || conn.to.blockId === blockId
  );

  toRemove.forEach((conn) => {
    const group = document.querySelector(`[data-connection-id="${conn.id}"]`);
    if (group) group.remove();
  });

  connections = connections.filter(
    (conn) => conn.from.blockId !== blockId && conn.to.blockId !== blockId
  );

  if (toRemove.length > 0 && typeof window.showNotification === 'function') {
    window.showNotification(`🗑️ ${toRemove.length} conexión(es) eliminada(s)`);
  }
}

// Keyboard handler
function handleConnectionKeyboard(e) {
  if (e.key === 'Escape' && isDraggingConnection) {
    cancelConnection();
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    const selectedLine = document.querySelector('.connection-line.selected');
    if (selectedLine) {
      const group = selectedLine.closest('[data-connection-id]');
      if (group) {
        deleteConnection(parseInt(group.dataset.connectionId));
      }
    }
  }
}

// Drag indicator helpers
function showDragIndicator(text) {
  if (!dragIndicator) {
    dragIndicator = document.createElement('div');
    dragIndicator.className = 'connection-drag-indicator';
    document.body.appendChild(dragIndicator);
  }
  dragIndicator.textContent = text;
  dragIndicator.style.display = 'block';
}

function updateDragIndicator(x, y, text) {
  if (dragIndicator) {
    dragIndicator.style.left = x + 20 + 'px';
    dragIndicator.style.top = y - 30 + 'px';
    if (text) dragIndicator.textContent = text;
  }
}

function hideDragIndicator() {
  if (dragIndicator) {
    dragIndicator.remove();
    dragIndicator = null;
  }
}

function clearAllConnections() {
  connections = [];
  const workspace = getActiveWorkspace();
  if (workspace) {
    const svg = workspace.querySelector('.connections-canvas svg');
    if (svg) svg.innerHTML = '';
  }
}

// Exportar
window.connections = {
  init: initConnections,
  addPoints: addConnectionPoints,
  updateAll: updateAllConnections,
  clear: clearAllConnections,
  delete: deleteConnection,
  removeForBlock: removeConnectionsForBlock,
  getAll: () => connections,
};

console.log('📦 connections.js cargado');
