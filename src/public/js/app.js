// Funcionalidad JavaScript para la aplicación CRUD

// Variables globales
let productoActual = null;
let categoriaSeleccionada = null;
let productos = [];
let categorias = [];
let productosFiltrados = [];
let paginaActual = 1;
const productosPorPagina = 6;
let terminoBusqueda = '';
let ordenActual = 'nombre';

// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
  if (text == null || text == undefined) {
    return '';
  }
  const str = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Verificar autenticación al cargar la página
function verificarAutenticacionInicial() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  if (!token) {
    // Redirigir a la página de autenticación
    window.location.href = '/auth';
    return false;
  }
  
  // Mostrar información del usuario
  if (username) {
    document.getElementById('currentUser').textContent = username;
    document.getElementById('welcomeUser').textContent = username;
  }
  
  return true;
}

// Event listeners cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación antes de cargar contenido
  if (!verificarAutenticacionInicial()) {
    return;
  }
  
  // Inicializar dropdowns de Bootstrap manualmente
  setTimeout(() => {
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
    dropdownElementList.forEach(dropdownToggleEl => {
      if (!dropdownToggleEl.hasAttribute('data-bs-toggle-initialized')) {
        new bootstrap.Dropdown(dropdownToggleEl);
        dropdownToggleEl.setAttribute('data-bs-toggle-initialized', 'true');
      }
    });
  }, 100);
  
  // Cargar categorías y productos
  cargarCategorias();
  cargarProductos();
  
  // Event listener para mostrar formulario de producto
  document.getElementById('mostrarFormProducto').addEventListener('click', () => {
    resetearFormularioProducto();
    
    // Configurar modal para modo creación
    document.getElementById('modalProductoTitulo').textContent = 'Nuevo Producto';
    const submitBtn = document.querySelector('#formProducto button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Crear Producto';
    }
    
    const modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalProducto.show();
  });
  
  // Event listener para mostrar formulario de categoría
  document.getElementById('mostrarFormCategoria').addEventListener('click', () => {
    document.getElementById('formCategoria').reset();
    document.getElementById('categoriaId').value = '';
    const modalFormCategoria = new bootstrap.Modal(document.getElementById('modalFormCategoria'));
    modalFormCategoria.show();
  });
  
  // Event listener para guardar producto
  document.getElementById('btnGuardarProducto').addEventListener('click', guardarProducto);
  
  // Event listener para vista previa de imagen
  document.getElementById('imagen').addEventListener('change', mostrarVistaPrevia);
  
  // Event listeners para búsqueda y filtros
   document.getElementById('buscarProducto').addEventListener('input', manejarBusqueda);
   document.getElementById('ordenarPor').addEventListener('change', manejarOrdenamiento);
   document.getElementById('limpiarFiltros').addEventListener('click', limpiarFiltros);
  
  // Event listener para formulario de categoría
  document.getElementById('formCategoria').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        mostrarAlerta('Debes iniciar sesión para gestionar categorías', 'warning');
        return;
      }

      const id = document.getElementById('categoriaId').value;
      const nombre = document.getElementById('nombreCategoria').value;
      
      const url = id ? `/api/categorias/${id}` : '/api/categorias';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre })
      });
      
      if (response.ok) {
        mostrarAlerta(`Categoría ${id ? 'actualizada' : 'creada'} correctamente`, 'success');
        const modalFormCategoria = bootstrap.Modal.getInstance(document.getElementById('modalFormCategoria'));
        modalFormCategoria.hide();
        cargarCategorias();
      } else {
        const error = await response.json();
        throw new Error(error.message || `Error al ${id ? 'actualizar' : 'crear'} categoría`);
      }
    } catch (error) {
      console.error(`Error al guardar categoría:`, error);
      mostrarAlerta(`Error al guardar categoría`, 'danger');
    }
  });
});

// Función para cargar categorías
async function cargarCategorias() {
  try {
    const response = await fetch('/api/categorias');
    const data = await response.json();
    
    // Asegurarse de que categorias sea un array
    const categorias = Array.isArray(data) ? data : [];
    
    // Llenar el menú lateral de categorías
    const listaCategorias = document.getElementById('listaCategorias');
    listaCategorias.innerHTML = `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <a href="#" class="categoria-link" data-id="todos">Todos los productos</a>
      </li>
    `;
    
    categorias.forEach(categoria => {
      listaCategorias.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <a href="#" class="categoria-link" data-id="${categoria.id}">${categoria.nombre}</a>
        </li>
      `;
    });
    
    // Llenar el select de categorías en el formulario
    const selectCategorias = document.getElementById('categoria_id');
    selectCategorias.innerHTML = '<option value="">Seleccione una categoría</option>';
    
    categorias.forEach(categoria => {
      selectCategorias.innerHTML += `<option value="${categoria.id}">${categoria.nombre}</option>`;
    });
    
    // Agregar event listeners a los enlaces de categoría
    document.querySelectorAll('.categoria-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const categoriaId = link.getAttribute('data-id');
        categoriaSeleccionada = categoriaId;
        
        if (categoriaId === 'todos') {
          cargarProductos();
          document.getElementById('tituloProductos').textContent = 'Todos los Productos';
        } else {
          cargarProductosPorCategoria(categoriaId);
          const nombreCategoria = link.textContent;
          document.getElementById('tituloProductos').textContent = `Productos: ${nombreCategoria}`;
        }
      });
    });
    
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarAlerta('Error al cargar categorías', 'danger');
  }
}

// Función para cargar todos los productos
async function cargarProductos() {
  try {
    const response = await fetch('/api/productos');
    const data = await response.json();
    // Asegurarse de que productos sea un array
    productos = Array.isArray(data) ? data : [];
    aplicarFiltrosYMostrar();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarAlerta('Error al cargar productos', 'danger');
  }
}

// Función para cargar productos por categoría
async function cargarProductosPorCategoria(categoriaId) {
  try {
    const response = await fetch(`/api/productos/categoria/${categoriaId}`);
    const data = await response.json();
    // Asegurarse de que productos sea un array
    productos = Array.isArray(data) ? data : [];
    aplicarFiltrosYMostrar();
  } catch (error) {
    console.error('Error al cargar productos por categoría:', error);
    mostrarAlerta('Error al cargar productos', 'danger');
  }
}

// Función para mostrar productos en la interfaz
function mostrarProductos(productos) {
  const listaProductos = document.getElementById('listaProductos');
  const contadorProductos = document.getElementById('contadorProductos');
  
  // Actualizar contador
  contadorProductos.textContent = `${productos.length} producto${productos.length !== 1 ? 's' : ''}`;
  
  if (productos.length === 0) {
    listaProductos.innerHTML = '<div class="col-12"><div class="alert alert-info text-center"><i class="bi bi-info-circle me-2"></i>No hay productos disponibles</div></div>';
    return;
  }
  
  listaProductos.innerHTML = '';
  
  productos.forEach(producto => {
    // Obtener la primera imagen si existe
    let imagenHTML = '<div class="text-center"><i class="bi bi-image text-muted" style="font-size: 5rem;"></i></div>';
    
    if (producto.imagenes && producto.imagenes.length > 0) {
      imagenHTML = `<img src="${producto.imagenes[0].url}" class="card-img-top producto-img" alt="${producto.nombre}">`;
    }
    
    const cardElement = document.createElement('div');
    cardElement.className = 'col-md-4 mb-4';
    cardElement.innerHTML = `
      <div class="card h-100 shadow-sm">
        ${imagenHTML}
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(producto.nombre || 'Sin nombre')}</h5>
          <p class="card-text">${escapeHtml(String(producto.descripcion || 'Sin descripción').substring(0, 100))}${String(producto.descripcion || '').length > 100 ? '...' : ''}</p>
          <p class="card-text"><strong>Precio:</strong> $${parseFloat(producto.precio || 0).toFixed(2)}</p>
          <p class="card-text"><small class="text-muted">Categoría: ${escapeHtml(producto.categoria_nombre || 'Sin categoría')}</small></p>
        </div>
        <div class="card-footer bg-transparent">
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-primary" onclick="verProducto(${producto.id})">Ver</button>
            <button class="btn btn-sm btn-warning" onclick="editarProducto(${producto.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${producto.id})">Eliminar</button>
          </div>
        </div>
      </div>
    `;
    listaProductos.appendChild(cardElement);
  });
}

// Funciones para filtrado, búsqueda y paginación
function aplicarFiltrosYMostrar() {
  // Filtrar productos por término de búsqueda
  productosFiltrados = productos.filter(producto => {
    if (!terminoBusqueda) return true;
    const termino = terminoBusqueda.toLowerCase();
    return producto.nombre.toLowerCase().includes(termino) ||
           producto.descripcion.toLowerCase().includes(termino) ||
           (producto.categoria_nombre && producto.categoria_nombre.toLowerCase().includes(termino));
  });
  
  // Ordenar productos
  ordenarProductos();
  
  // Resetear página actual si es necesario
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  if (paginaActual > totalPaginas && totalPaginas > 0) {
    paginaActual = 1;
  }
  
  // Mostrar productos paginados
  mostrarProductosPaginados();
  
  // Generar paginación
  generarPaginacion();
}

function ordenarProductos() {
  productosFiltrados.sort((a, b) => {
    switch (ordenActual) {
      case 'nombre':
        return a.nombre.localeCompare(b.nombre);
      case 'precio_asc':
        return parseFloat(a.precio) - parseFloat(b.precio);
      case 'precio_desc':
        return parseFloat(b.precio) - parseFloat(a.precio);
      case 'fecha':
        return new Date(b.created_at || b.id) - new Date(a.created_at || a.id);
      default:
        return 0;
    }
  });
}

function mostrarProductosPaginados() {
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosFiltrados.slice(inicio, fin);
  mostrarProductos(productosPagina);
}

function generarPaginacion() {
  const paginacion = document.getElementById('paginacion');
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  
  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Botón anterior
  html += `
    <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">
        <i class="bi bi-chevron-left"></i>
      </a>
    </li>
  `;
  
  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
      html += `
        <li class="page-item ${i === paginaActual ? 'active' : ''}">
          <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>
        </li>
      `;
    } else if (i === paginaActual - 2 || i === paginaActual + 2) {
      html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }
  
  // Botón siguiente
  html += `
    <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">
        <i class="bi bi-chevron-right"></i>
      </a>
    </li>
  `;
  
  paginacion.innerHTML = html;
}

// Función para cambiar página (disponible globalmente)
window.cambiarPagina = function(nuevaPagina) {
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
    paginaActual = nuevaPagina;
    mostrarProductosPaginados();
    generarPaginacion();
  }
}

function manejarBusqueda(event) {
  terminoBusqueda = event.target.value;
  paginaActual = 1;
  aplicarFiltrosYMostrar();
}

function manejarOrdenamiento(event) {
  ordenActual = event.target.value;
  aplicarFiltrosYMostrar();
}

function limpiarFiltros() {
  document.getElementById('buscarProducto').value = '';
  document.getElementById('ordenarPor').value = 'nombre';
  terminoBusqueda = '';
  ordenActual = 'nombre';
  paginaActual = 1;
  aplicarFiltrosYMostrar();
}

// Función para recargar solo el contenido del modal sin crear nueva instancia
async function recargarContenidoModal(id) {
  try {
    const response = await fetch(`/api/productos/${id}`);
    const producto = await response.json();
    
    // Actualizar solo el contenido, no crear nuevo modal
    actualizarContenidoModal(producto, id);
  } catch (error) {
    console.error('Error al recargar contenido del modal:', error);
    mostrarAlerta('Error al recargar contenido', 'danger');
  }
}

// Función para actualizar el contenido del modal
function actualizarContenidoModal(producto, id) {
  // Cargar imágenes en el carrusel
  const carouselInner = document.getElementById('carouselInner');
  carouselInner.innerHTML = '';
  
  if (producto.imagenes && producto.imagenes.length > 0) {
    producto.imagenes.forEach((imagen, index) => {
      carouselInner.innerHTML += `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <img src="${imagen.url}" class="d-block w-100" alt="${producto.nombre}">
        </div>
      `;
    });
  } else {
    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="text-center p-5">
          <i class="bi bi-image text-muted" style="font-size: 5rem;"></i>
          <p class="mt-3">No hay imágenes disponibles</p>
        </div>
      </div>
    `;
  }
  
  // Mostrar miniaturas
  const contenedorMiniaturas = document.getElementById('contenedorMiniaturas');
  contenedorMiniaturas.innerHTML = '';
  
  if (producto.imagenes && producto.imagenes.length > 0) {
    producto.imagenes.forEach((imagen, index) => {
      contenedorMiniaturas.innerHTML += `
        <div class="me-2 mb-2">
          <img src="${imagen.url}" class="miniatura-imagen ${index === 0 ? 'active' : ''}" alt="${producto.nombre}" data-index="${index}">
        </div>
      `;
    });
    
    // Agregar event listeners a las miniaturas
    document.querySelectorAll('.miniatura-imagen').forEach(miniatura => {
      miniatura.addEventListener('click', () => {
        const index = miniatura.getAttribute('data-index');
        const carousel = bootstrap.Carousel.getInstance(document.getElementById('carouselImagenes'));
        if (carousel) {
          carousel.to(index);
        }
        
        // Actualizar clase active
        document.querySelectorAll('.miniatura-imagen').forEach(m => m.classList.remove('active'));
        miniatura.classList.add('active');
      });
    });
  }
}

// Función para ver detalle de un producto
// Función para ver producto (disponible globalmente)
window.verProducto = async function(id) {
  try {
    const response = await fetch(`/api/productos/${id}`);
    const producto = await response.json();
    
    // Mostrar detalles en el modal
    document.getElementById('modalDetalleProductoTitulo').textContent = producto.nombre;
    document.getElementById('detalleNombre').textContent = producto.nombre;
    document.getElementById('detalleCategoria').textContent = producto.categoria_nombre;
    document.getElementById('detallePrecio').textContent = parseFloat(producto.precio).toFixed(2);
    document.getElementById('detalleDescripcion').textContent = producto.descripcion;
    
    // Configurar botones de acción
    document.getElementById('btnEditarProducto').onclick = () => {
      const modalDetalleProducto = bootstrap.Modal.getInstance(document.getElementById('modalDetalleProducto'));
      modalDetalleProducto.hide();
      editarProducto(id);
    };
    
    document.getElementById('btnEliminarProducto').onclick = () => {
      const modalDetalleProducto = bootstrap.Modal.getInstance(document.getElementById('modalDetalleProducto'));
      modalDetalleProducto.hide();
      confirmarEliminar(id);
    };
    
    // Actualizar contenido del modal usando la función reutilizable
    actualizarContenidoModal(producto, id);
    
    // Configurar formulario para subir nueva imagen
    document.getElementById('formSubirImagen').onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      const fileInput = document.getElementById('inputImagen');
      
      if (fileInput.files.length > 0) {
        formData.append('imagen', fileInput.files[0]);
        
        try {
          const token = localStorage.getItem('token');
          const headers = {};
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(`/api/imagenes/producto/${id}`, {
            method: 'POST',
            headers: headers,
            body: formData
          });
          
          if (response.ok) {
            mostrarAlerta('Imagen subida correctamente', 'success');
            // Limpiar el input de archivo
            fileInput.value = '';
            // Recargar solo el contenido del modal sin crear una nueva instancia
            await recargarContenidoModal(id);
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Error al subir imagen');
          }
        } catch (error) {
          console.error('Error al subir imagen:', error);
          mostrarAlerta('Error al subir imagen', 'danger');
        }
      }
    };
    
    // Mostrar modal (solo si no está ya visible)
    const modalElement = document.getElementById('modalDetalleProducto');
    let modalDetalleProducto = bootstrap.Modal.getInstance(modalElement);
    
    if (!modalDetalleProducto) {
      modalDetalleProducto = new bootstrap.Modal(modalElement);
    }
    
    if (!modalElement.classList.contains('show')) {
      modalDetalleProducto.show();
    }
  } catch (error) {
    console.error('Error al cargar detalle del producto:', error);
    mostrarAlerta('Error al cargar detalle del producto', 'danger');
  }
}

// Función para editar un producto
// Función para editar producto (disponible globalmente)
window.editarProducto = async function(id) {
  try {
    // Mostrar indicador de carga
    mostrarAlerta('Cargando datos del producto...', 'info');
    
    const token = localStorage.getItem('token');
    if (!token) {
      mostrarAlerta('Debes iniciar sesión para editar productos', 'warning');
      return;
    }
    
    const response = await fetch(`/api/productos/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener los datos del producto');
    }
    
    const producto = await response.json();
    
    // Limpiar formulario primero
    resetearFormularioProducto();
    
    // Llenar el formulario con los datos del producto
    document.getElementById('productoId').value = producto.id;
    document.getElementById('nombre').value = producto.nombre || '';
    document.getElementById('descripcion').value = producto.descripcion || '';
    document.getElementById('precio').value = producto.precio || '';
    document.getElementById('categoria_id').value = producto.categoria_id || '';
    
    // Si tiene imagen, mostrar vista previa
    if (producto.imagenes && producto.imagenes.length > 0) {
      const imagenPreview = document.getElementById('imagenPreview');
      const imgElement = imagenPreview.querySelector('img');
      if (imgElement) {
        imgElement.src = producto.imagenes[0].url;
        imagenPreview.classList.remove('d-none');
      }
    }
    
    // Cambiar título del modal y texto del botón
    document.getElementById('modalProductoTitulo').textContent = 'Editar Producto';
    const submitBtn = document.querySelector('#formProducto button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Actualizar Producto';
    }
    
    // Mostrar modal
    const modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
    modalProducto.show();
    
    // Limpiar alerta de carga
    setTimeout(() => {
      const alertas = document.querySelectorAll('.alert');
      alertas.forEach(alerta => {
        if (alerta.textContent.includes('Cargando datos')) {
          alerta.remove();
        }
      });
    }, 1000);
    
  } catch (error) {
    console.error('Error al cargar producto para editar:', error);
    mostrarAlerta(`Error al cargar producto: ${error.message}`, 'danger');
  }
}

// Función para confirmar eliminación con modal
// Función para confirmar eliminación (disponible globalmente)
window.confirmarEliminar = function(id) {
  // Crear modal de confirmación dinámicamente
  const modalHTML = `
    <div class="modal fade" id="modalConfirmarEliminar" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Confirmar Eliminación</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="text-center">
              <i class="bi bi-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
              <h5 class="mt-3">¿Está seguro de que desea eliminar este producto?</h5>
              <p class="text-muted">Esta acción no se puede deshacer.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="btnConfirmarEliminar">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal anterior si existe
  const modalAnterior = document.getElementById('modalConfirmarEliminar');
  if (modalAnterior) {
    modalAnterior.remove();
  }
  
  // Agregar modal al DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Configurar evento de confirmación
  document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar'));
    modal.hide();
    eliminarProducto(id);
  });
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
  modal.show();
  
  // Limpiar modal del DOM cuando se cierre
  document.getElementById('modalConfirmarEliminar').addEventListener('hidden.bs.modal', () => {
    document.getElementById('modalConfirmarEliminar').remove();
  });
}

// Función para eliminar un producto
async function eliminarProducto(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      mostrarAlerta('Debes iniciar sesión para eliminar productos', 'warning');
      return;
    }

    // Mostrar indicador de carga en la interfaz
    mostrarAlerta('Eliminando producto...', 'info');

    const response = await fetch(`/api/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      mostrarAlerta('Producto eliminado correctamente', 'success');
      
      // Cerrar modal de detalle si está abierto
      const modalDetalle = document.getElementById('modalDetalleProducto');
      if (modalDetalle && modalDetalle.classList.contains('show')) {
        const modalInstance = bootstrap.Modal.getInstance(modalDetalle);
        if (modalInstance) {
          modalInstance.hide();
        }
      }
      
      // Recargar productos
      if (categoriaSeleccionada === 'todos' || categoriaSeleccionada === null) {
        cargarProductos();
      } else {
        cargarProductosPorCategoria(categoriaSeleccionada);
      }
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar producto');
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    mostrarAlerta(`Error al eliminar producto: ${error.message}`, 'danger');
  }
}

// Función para validar formulario de producto
function validarFormularioProducto() {
  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const categoria_id = document.getElementById('categoria_id').value;
  
  // Limpiar errores previos
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
  
  let esValido = true;
  
  // Validar nombre
  if (!nombre || nombre.length < 2) {
    mostrarErrorCampo('nombre', 'El nombre debe tener al menos 2 caracteres');
    esValido = false;
  } else if (nombre.length > 100) {
    mostrarErrorCampo('nombre', 'El nombre no puede exceder 100 caracteres');
    esValido = false;
  }
  
  // Validar descripción
  if (!descripcion || descripcion.length < 10) {
    mostrarErrorCampo('descripcion', 'La descripción debe tener al menos 10 caracteres');
    esValido = false;
  } else if (descripcion.length > 500) {
    mostrarErrorCampo('descripcion', 'La descripción no puede exceder 500 caracteres');
    esValido = false;
  }
  
  // Validar precio
  if (isNaN(precio) || precio <= 0) {
    mostrarErrorCampo('precio', 'El precio debe ser un número mayor a 0');
    esValido = false;
  } else if (precio > 999999.99) {
    mostrarErrorCampo('precio', 'El precio no puede exceder $999,999.99');
    esValido = false;
  }
  
  // Validar categoría
  if (!categoria_id) {
    mostrarErrorCampo('categoria_id', 'Debe seleccionar una categoría');
    esValido = false;
  }
  
  // Validar imagen (solo para productos nuevos)
  const id = document.getElementById('productoId').value;
  const imagen = document.getElementById('imagen').files[0];
  if (!id && !imagen) {
    mostrarErrorCampo('imagen', 'Debe seleccionar una imagen para el producto');
    esValido = false;
  } else if (imagen) {
    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposPermitidos.includes(imagen.type)) {
      mostrarErrorCampo('imagen', 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)');
      esValido = false;
    }
    // Validar tamaño (máximo 5MB)
    if (imagen.size > 5 * 1024 * 1024) {
      mostrarErrorCampo('imagen', 'La imagen no puede exceder 5MB');
      esValido = false;
    }
  }
  
  return esValido;
}

// Función para mostrar error en un campo específico
function mostrarErrorCampo(campoId, mensaje) {
  const campo = document.getElementById(campoId);
  campo.classList.add('is-invalid');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = mensaje;
  
  campo.parentNode.appendChild(errorDiv);
}

// Función para guardar un producto (crear o actualizar)
async function guardarProducto() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      mostrarAlerta('Debes iniciar sesión para gestionar productos', 'warning');
      return;
    }

    // Validar formulario antes de enviar
    if (!validarFormularioProducto()) {
      mostrarAlerta('Por favor, corrija los errores en el formulario', 'warning');
      return;
    }

    // Mostrar indicador de carga
    const btnGuardar = document.getElementById('btnGuardarProducto');
    const textoOriginal = btnGuardar.textContent;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

    const formProducto = document.getElementById('formProducto');
    const formData = new FormData(formProducto);
    
    const id = document.getElementById('productoId').value;
    const url = id ? `/api/productos/${id}` : '/api/productos';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      mostrarAlerta(`Producto ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
      
      // Cerrar modal
      const modalProducto = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
      modalProducto.hide();
      
      // Recargar productos
      if (categoriaSeleccionada === 'todos' || categoriaSeleccionada === null) {
        cargarProductos();
      } else {
        cargarProductosPorCategoria(categoriaSeleccionada);
      }
    } else {
      const error = await response.json();
      throw new Error(error.message || `Error al ${id ? 'actualizar' : 'crear'} producto`);
    }
  } catch (error) {
    console.error(`Error al ${document.getElementById('productoId').value ? 'actualizar' : 'crear'} producto:`, error);
    mostrarAlerta(`Error al ${document.getElementById('productoId').value ? 'actualizar' : 'crear'} producto: ${error.message}`, 'danger');
  } finally {
    // Restaurar botón
    const btnGuardar = document.getElementById('btnGuardarProducto');
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar';
  }
}

// Función para mostrar vista previa de imagen
function mostrarVistaPrevia(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    const imagenPreview = document.getElementById('imagenPreview');
    
    reader.onload = function(e) {
      imagenPreview.classList.remove('d-none');
      imagenPreview.querySelector('img').src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }
}

// Función para resetear el formulario de producto
function resetearFormularioProducto() {
  document.getElementById('formProducto').reset();
  document.getElementById('productoId').value = '';
  document.getElementById('imagenPreview').classList.add('d-none');
  document.getElementById('modalProductoTitulo').textContent = 'Nuevo Producto';
}

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
  const alertPlaceholder = document.getElementById('alertPlaceholder') || document.createElement('div');
  
  if (!document.getElementById('alertPlaceholder')) {
    alertPlaceholder.id = 'alertPlaceholder';
    alertPlaceholder.className = 'position-fixed top-0 end-0 p-3';
    document.body.appendChild(alertPlaceholder);
  }
  
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  
  alertPlaceholder.appendChild(wrapper);
  
  // Auto-cerrar después de 3 segundos
  setTimeout(() => {
    const alert = wrapper.querySelector('.alert');
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }
  }, 3000);
}
// ==================== AUTENTICACIÓN ====================

// Formularios de autenticación removidos - ahora se manejan en /auth

// ==================== FUNCIONES DE UTILIDAD ====================

// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
  const token = localStorage.getItem('token');
  return token !== null;
}

// Función para cerrar sesión (disponible globalmente)
window.cerrarSesion = function() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  mostrarAlerta('Sesión cerrada correctamente', 'info');
  // Redirigir a la página de autenticación
  setTimeout(() => {
    window.location.href = '/auth';
  }, 1000);
}

