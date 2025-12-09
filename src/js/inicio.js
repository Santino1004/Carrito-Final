let productos = [
  { id: 1, nombre: "Filtro de Aceite Premium", descripcion: "Filtro de alta calidad para máxima protección.", precio: 2500, imagen: "img/filtropremium.png", stock: 15 },
  { id: 2, nombre: "Pastillas de Freno", descripcion: "Juego completo de pastillas cerámicas.", precio: 4800, imagen: "img/pastillas-frenos.png", stock: 8 },
  { id: 3, nombre: "Batería 12V 75Ah", descripcion: "Batería de alto rendimiento, 3 años garantía.", precio: 8500, imagen: "img/bateria.png", stock: 5 }
];


let carrito = JSON.parse(localStorage.getItem("carrito")) || {};


const container = document.getElementById("productos-container");

const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const contador = document.getElementById("contador");

const carritoDiv = document.getElementById("carrito");
const btnCarrito = document.getElementById("btn-carrito");


const btnPanel = document.getElementById("btn-panel");
const modalPanel = document.getElementById("modal-panel");
const btnCerrar = document.getElementById("btn-cerrar");
const formProducto = document.getElementById("form-producto");
const inputImagen = document.getElementById("imagen");
const preview = document.getElementById("preview");


function nextId() {
  return productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
}


btnCarrito.addEventListener("click", () => carritoDiv.classList.toggle("activo"));


document.addEventListener("click", (e) => {
  if (!e.target.closest("#carrito-container") && !e.target.closest("#carrito")) {
    carritoDiv.classList.remove("activo");
  }
});


function renderProductos() {
  container.innerHTML = productos.map(p => {
    const stockBadge = p.stock === 0 ? `<span class="stock-badge agotado">Agotado</span>` :
                       p.stock <= 5 ? `<span class="stock-badge bajo">Stock: ${p.stock}</span>` :
                       `<span class="stock-badge">Stock: ${p.stock}</span>`;

    return `
      <div class="producto-card">
        <img src="${p.imagen}" class="producto-img" alt="${p.nombre}">
        <h2>${p.nombre}</h2>
        <p class="descripcion">${p.descripcion || 'Sin descripción.'}</p>
        ${stockBadge}
        <p class="price">$${p.precio}</p>
        <button class="agregar-carrito" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
          🛒 ${p.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    `;
  }).join("");
}


function agregarCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto || producto.stock <= 0) return;


  producto.stock--;

  if (!carrito[id]) carrito[id] = { producto, cantidad: 1 };
  else carrito[id].cantidad++;

  guardarCarrito();
  renderCarrito();
  renderProductos(); 

  if (btnPanel) {
    btnPanel.textContent = '✅ Producto agregado!';
    setTimeout(() => btnPanel.textContent = '➕ Agregar Producto', 1600);
  }
}

function restarCarrito(id) {
  if (!carrito[id]) return;
  carrito[id].cantidad--;

  const prod = productos.find(p => p.id === id);
  if (prod) prod.stock++;

  if (carrito[id].cantidad <= 0) delete carrito[id];

  guardarCarrito();
  renderCarrito();
  renderProductos();
}

function eliminarProducto(id) {
  if (!carrito[id]) return;

  const prod = productos.find(p => p.id === id);
  if (prod) prod.stock += carrito[id].cantidad;

  delete carrito[id];
  guardarCarrito();
  renderCarrito();
  renderProductos();
}


function renderCarrito() {
  const items = Object.values(carrito);
  if (!items.length) {
    listaCarrito.innerHTML = `<p class="vacio">Tu carrito está vacío.</p>`;
    totalCarrito.textContent = "$0";
    contador.textContent = "0";
    return;
  }

  listaCarrito.innerHTML = items.map(item => `
    <li class="item-carrito">
      <img src="${item.producto.imagen}" class="mini-img" alt="">
      <div style="display:flex;flex-direction:column;gap:4px;">
        <span class="nombre">${item.producto.nombre}</span>
        <small style="color:#666">${item.producto.precio} c/u</small>
      </div>

      <div class="controles" style="margin-left:auto;display:flex;align-items:center;gap:.5rem;">
        <button class="btn-restar" data-id="${item.producto.id}">-</button>
        <span style="min-width:26px;text-align:center">${item.cantidad}</span>
        <button class="btn-sumar" data-id="${item.producto.id}">+</button>
      </div>

      <div style="width:70px;text-align:right;margin-left:12px;font-weight:700;">
        $${item.producto.precio * item.cantidad}
      </div>

      <button class="btn-eliminar" data-id="${item.producto.id}" style="margin-left:8px;">x</button>
    </li>
  `).join("");

  const total = items.reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0);
  const cantidadTotal = items.reduce((acc, it) => acc + it.cantidad, 0);

  totalCarrito.textContent = `$${total}`;
  contador.textContent = cantidadTotal;
}


document.addEventListener("click", (e) => {

  if (e.target.classList.contains("agregar-carrito")) {
    const id = Number(e.target.dataset.id);
    agregarCarrito(id);
    return;
  }


  if (e.target.classList.contains("btn-sumar")) {
    const id = Number(e.target.dataset.id);
    agregarCarrito(id);
    return;
  }
  if (e.target.classList.contains("btn-restar")) {
    const id = Number(e.target.dataset.id);
    restarCarrito(id);
    return;
  }
  if (e.target.classList.contains("btn-eliminar")) {
    const id = Number(e.target.dataset.id);
    eliminarProducto(id);
    return;
  }
});


function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}


function openModal() { modalPanel.classList.add("activo"); }
function closeModal() {
  modalPanel.classList.remove("activo");
  formProducto.reset();
  preview.style.display = 'none';
  preview.src = '';
}

btnPanel && btnPanel.addEventListener("click", openModal);
btnCerrar && btnCerrar.addEventListener("click", closeModal);

modalPanel && modalPanel.addEventListener("click", (e) => {
  if (e.target === modalPanel) closeModal();
});


inputImagen && inputImagen.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    preview.src = ev.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});


formProducto && formProducto.addEventListener("submit", (e) => {
  e.preventDefault();


  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const stock = parseInt(document.getElementById("stock").value) || 0;
  const precio = parseFloat(document.getElementById("precio").value) || 0;
  const imagenSrc = preview && preview.src ? preview.src : "img/placeholder.png";


  const id = nextId();


  const nuevo = { id, nombre, descripcion, precio, imagen: imagenSrc, stock };

  productos.push(nuevo);


  renderProductos();
  closeModal();


  if (btnPanel) {
    btnPanel.textContent = '✅ Producto agregado!';
    setTimeout(() => btnPanel.textContent = '➕ Agregar Producto', 1600);
  }
});


renderProductos();
renderCarrito();

