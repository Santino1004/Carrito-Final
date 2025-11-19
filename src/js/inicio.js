//----------------------------------------
//  FIREBASE (VERSIÓN 8 — CDN)
//----------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAv34CnZuHfF5eMZQjdbTW-FdeR1vT7YvI",
  authDomain: "autoparts-83233.firebaseapp.com",
  projectId: "autoparts-83233",
  storageBucket: "autoparts-83233.firebasestorage.app",
  messagingSenderId: "570343552718",
  appId: "1:570343552718:web:085227d2df13439e0ac29f",
  measurementId: "G-C96Q0Y90PC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//----------------------------------------
//  VARIABLES GLOBALES
//----------------------------------------
let productos = [];
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

//----------------------------------------
//  CARGAR PRODUCTOS DESDE FIRESTORE
//----------------------------------------
async function cargarProductos() {
  const snap = await db.collection("productos").get();
  productos = [];

  snap.forEach(doc => {
    productos.push({ firebaseId: doc.id, ...doc.data() });
  });

  renderProductos();
}

//----------------------------------------
//  RENDERIZAR PRODUCTOS
//----------------------------------------
function renderProductos() {
  container.innerHTML = productos.map(p => {
    const stockBadge = p.stock === 0 
      ? `<span class="stock-badge agotado">Agotado</span>`
      : p.stock <= 5 
        ? `<span class="stock-badge bajo">Stock: ${p.stock}</span>`
        : `<span class="stock-badge">Stock: ${p.stock}</span>`;

    return `
      <div class="producto-card">
        <img src="${p.imagen}" class="producto-img" alt="${p.nombre}">
        <h2>${p.nombre}</h2>
        <p class="descripcion">${p.descripcion}</p>
        ${stockBadge}
        <p class="price">$${p.precio}</p>
        <button class="agregar-carrito" data-id="${p.firebaseId}" ${p.stock === 0 ? "disabled" : ""}>
          🛒 ${p.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    `;
  }).join("");
}

//----------------------------------------
//  AGREGAR AL CARRITO
//----------------------------------------
async function agregarCarrito(id) {
  const producto = productos.find(p => p.firebaseId === id);
  if (!producto || producto.stock <= 0) return;

  producto.stock--;

  if (!carrito[id]) carrito[id] = { producto, cantidad: 1 };
  else carrito[id].cantidad++;

  guardarCarrito();
  renderCarrito();

  await db.collection("productos").doc(id).update({
    stock: producto.stock
  });

  cargarProductos();
}

//----------------------------------------
//  RESTAR DEL CARRITO
//----------------------------------------
async function restarCarrito(id) {
  if (!carrito[id]) return;

  carrito[id].cantidad--;

  const prod = productos.find(p => p.firebaseId === id);
  if (prod) prod.stock++;

  if (carrito[id].cantidad <= 0) delete carrito[id];

  guardarCarrito();
  renderCarrito();

  await db.collection("productos").doc(id).update({
    stock: prod.stock
  });

  cargarProductos();
}

//----------------------------------------
//  ELIMINAR PRODUCTO DEL CARRITO
//----------------------------------------
async function eliminarProducto(id) {
  if (!carrito[id]) return;

  const prod = productos.find(p => p.firebaseId === id);
  if (prod) prod.stock += carrito[id].cantidad;

  delete carrito[id];

  guardarCarrito();
  renderCarrito();

  await db.collection("productos").doc(id).update({
    stock: prod.stock
  });

  cargarProductos();
}

//----------------------------------------
//  RENDER CARRITO
//----------------------------------------
function renderCarrito() {
  const items = Object.values(carrito);

  if (!items.length) {
    listaCarrito.innerHTML = `<p class="vacio">Tu carrito está vacío.</p>`;
    totalCarrito.textContent = "0";
    contador.textContent = "0";
    return;
  }

  listaCarrito.innerHTML = items.map(item => `
    <li class="item-carrito">
      <img src="${item.producto.imagen}" class="mini-img">
      <div style="display:flex;flex-direction:column;">
        <span>${item.producto.nombre}</span>
        <small>$${item.producto.precio} c/u</small>
      </div>

      <div class="controles">
        <button class="btn-restar" data-id="${item.producto.firebaseId}">-</button>
        <span>${item.cantidad}</span>
        <button class="btn-sumar" data-id="${item.producto.firebaseId}">+</button>
      </div>

      <div class="precio-total">$${item.producto.precio * item.cantidad}</div>
      <button class="btn-eliminar" data-id="${item.producto.firebaseId}">x</button>
    </li>
  `).join("");

  const total = items.reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0);
  const cantidadTotal = items.reduce((acc, it) => acc + it.cantidad, 0);

  totalCarrito.textContent = total;
  contador.textContent = cantidadTotal;
}

//----------------------------------------
//  CLICK HANDLERS GLOBAL
//----------------------------------------
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("agregar-carrito")) {
    agregarCarrito(e.target.dataset.id);
  }

  if (e.target.classList.contains("btn-sumar")) {
    agregarCarrito(e.target.dataset.id);
  }

  if (e.target.classList.contains("btn-restar")) {
    restarCarrito(e.target.dataset.id);
  }

  if (e.target.classList.contains("btn-eliminar")) {
    eliminarProducto(e.target.dataset.id);
  }
});

//----------------------------------------
//  GUARDAR CARRITO
//----------------------------------------
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

//----------------------------------------
//  MODAL PANEL
//----------------------------------------
btnPanel.addEventListener("click", () => modalPanel.classList.add("activo"));
btnCerrar.addEventListener("click", () => modalPanel.classList.remove("activo"));

modalPanel.addEventListener("click", (e) => {
  if (e.target === modalPanel) modalPanel.classList.remove("activo");
});

//----------------------------------------
//  VISTA PREVIA DE IMAGEN
//----------------------------------------
inputImagen.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    preview.src = ev.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

//----------------------------------------
//  AGREGAR PRODUCTO NUEVO (FIRESTORE)
//----------------------------------------
formProducto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const descripcion = document.getElementById("descripcion").value;
  const stock = parseInt(document.getElementById("stock").value);
  const precio = parseFloat(document.getElementById("precio").value);
  const imagenSrc = preview.src;

  await db.collection("productos").add({
    nombre,
    descripcion,
    precio,
    stock,
    imagen: imagenSrc
  });

  modalPanel.classList.remove("activo");
  formProducto.reset();
  preview.style.display = "none";

  cargarProductos();
});

//----------------------------------------
//  ABRIR / CERRAR CARRITO
//----------------------------------------
btnCarrito.addEventListener("click", () => {
  carritoDiv.classList.toggle("activo");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#carrito-container") && !e.target.closest("#carrito")) {
    carritoDiv.classList.remove("activo");
  }
});

//----------------------------------------
// FINALIZAR COMPRA
//----------------------------------------
const btnFinalizar = document.getElementById("btn-finalizar");
const mensajeCompra = document.getElementById("mensaje-compra");

btnFinalizar.addEventListener("click", () => {
  if (Object.keys(carrito).length === 0) {
    mensajeCompra.textContent = "El carrito está vacío.";
    mensajeCompra.style.color = "red";
    return;
  }

  // Vaciar carrito (no se toca Firestore porque el stock ya está descontado)
  carrito = {};
  guardarCarrito();
  renderCarrito();

  // Mostrar mensaje
  mensajeCompra.textContent = "🎉 Compra finalizada con éxito 🎉";
  mensajeCompra.style.color = "#28a745";

  // Ocultar mensaje después de 3 segundos
  setTimeout(() => {
    mensajeCompra.textContent = "";
  }, 3000);
});


//----------------------------------------
//  INICIALIZAR
//----------------------------------------
cargarProductos();
renderCarrito();
