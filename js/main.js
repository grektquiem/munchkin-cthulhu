// js/main.js

/**
 * ==========================================
 * 1. MODELO DE DATOS (Class)
 * ==========================================
 * Esta clase es el "molde" para cualquier entidad en el combate.
 * Cumple con el principio de responsabilidad única: sabe su nombre,
 * su nivel, su equipo y cómo calcular su propia fuerza total.
 */
class Combatiente {
    constructor(id, nombre, color) {
        this.id = id;
        this.nombre = nombre;
        this.color = color;
        this.nivel = 1;
        this.equipo = 0;
    }

    // Un "getter" actúa como una propiedad pero ejecuta lógica por debajo
    get fuerzaTotal() {
        return this.nivel + this.equipo;
    }

    // Genera la interfaz de usuario específica para este combatiente
    render() {
        return `
            <div class="card mb-3 shadow-sm border-${this.color}">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="card-title fw-bold text-${this.color} m-0">${this.nombre}</h6>
                        <span class="badge bg-${this.color} fs-6">${this.fuerzaTotal}</span>
                    </div>
                    <div class="row g-2 align-items-end">
                        <div class="col-5">
                            <label class="small text-muted fw-bold">Nivel Base</label>
                            <input type="number" class="form-control" value="${this.nivel}" min="1" 
                                oninput="actualizarNivel('${this.id}', this.value)">
                        </div>
                        <div class="col-7">
                            <label class="small text-muted fw-bold">Modificadores</label>
                            <div class="input-group">
                                <button class="btn btn-outline-secondary" onclick="ajustarEquipo('${this.id}', -2)">-2</button>
                                <input type="number" class="form-control text-center fw-bold" value="${this.equipo}" readonly>
                                <button class="btn btn-outline-secondary" onclick="ajustarEquipo('${this.id}', 2)">+2</button>
                                <button class="btn btn-outline-secondary" onclick="ajustarEquipo('${this.id}', 5)">+5</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

/**
 * ==========================================
 * 2. ESTADO GLOBAL (Single Source of Truth)
 * ==========================================
 */
let jugadorPrincipal = new Combatiente('j1', 'Tu Personaje', 'success'); // El jugador principal siempre está presente
let ayudante = null; // Inicialmente no hay ayudante
let monstruos = [new Combatiente('m1', 'Monstruo Principal', '#dc3545')]; // Comenzamos con un monstruo

/**
 * ==========================================
 * 3. CONTROLADORES DEL DOM (Renderizado)
 * ==========================================
 */
function renderizarUI() {
    // 1. Renderizar bando de jugadores
    let htmlJugadores = jugadorPrincipal.render();
    if (ayudante !== null) {
        htmlJugadores += ayudante.render();
    }
    document.getElementById('contenedor-jugadores').innerHTML = htmlJugadores;

    // 2. Renderizar bando de monstruos
    let htmlMonstruos = '';
    monstruos.forEach(monstruo => {
        htmlMonstruos += monstruo.render();
    });
    document.getElementById('contenedor-monstruos').innerHTML = htmlMonstruos;

    // 3. Recalcular y mostrar los totales
    calcularTotales();
}

function calcularTotales() {
    // Fuerza Jugadores
    let fuerzaJugadores = jugadorPrincipal.fuerzaTotal;
    if (ayudante !== null) {
        fuerzaJugadores += ayudante.fuerzaTotal;
    }

    // Fuerza Monstruos (Usando el método funcional .reduce)
    const fuerzaMonstruos = monstruos.reduce((total, monstruo) => {
        return total + monstruo.fuerzaTotal;
    }, 0);

    // Actualizar marcadores visuales
    document.getElementById('total-fuerza-jugadores').textContent = fuerzaJugadores;
    document.getElementById('total-fuerza-monstruos').textContent = fuerzaMonstruos;

    const status = document.getElementById('status-combate');
    // Lógica principal: Los jugadores deben superar estrictamente a los monstruos (el empate lo gana el monstruo)
    if (fuerzaJugadores > fuerzaMonstruos) {
        status.textContent = "🏆 Jugadores Ganan";
        status.className = "badge p-2 fs-6 w-100 bg-success text-white shadow-sm";
    } else {
        status.textContent = "💀 Monstruos Ganan";
        status.className = "badge p-2 fs-6 w-100 bg-danger text-white shadow-sm";
    }
}

/**
 * ==========================================
 * 4. GESTIÓN DE EVENTOS Y MUTACIONES
 * ==========================================
 */

// Buscar un combatiente por su ID dentro de nuestro estado
function encontrarCombatiente(id) {
    if (id === jugadorPrincipal.id) return jugadorPrincipal;
    if (ayudante && id === ayudante.id) return ayudante;
    return monstruos.find(m => m.id === id);
}

// Actualizar Nivel (Llamado desde el input del HTML)
window.actualizarNivel = function(id, nuevoValor) {
    const valorPuro = parseInt(nuevoValor, 10) || 1; // Fallback de seguridad
    const combatiente = encontrarCombatiente(id);
    combatiente.nivel = valorPuro;
    renderizarUI(); 
};

// Ajustar Equipo/Bonificadores (Llamado desde los botones de +/-)
window.ajustarEquipo = function(id, cantidad) {
    const combatiente = encontrarCombatiente(id);
    combatiente.equipo += cantidad;
    renderizarUI();
};

// Activar/Desactivar Ayudante
document.getElementById('switchAyudante').addEventListener('change', function(evento) {
    if (evento.target.checked) {
        ayudante = new Combatiente('a1', 'Compañero de Batalla', 'info');
    } else {
        ayudante = null;
    }
    renderizarUI();
});

// Añadir Monstruo Errante (Límite de 3)
document.getElementById('btnAnadirMonstruo').addEventListener('click', function() {
    if (monstruos.length < 3) {
        const nuevoId = `m${monstruos.length + 1}`;
        const nuevoNombre = `Monstruo Errante ${monstruos.length}`;
        monstruos.push(new Combatiente(nuevoId, nuevoNombre, 'danger'));
        renderizarUI();
    } else {
        alert("Las reglas dictan que es muy poco probable enfrentar a más de 3 monstruos a la vez. ¡No pierdas la cordura!");
    }
});

/**
 * ==========================================
 * 5. INICIALIZACIÓN
 * ==========================================
 */
// Renderizar la aplicación por primera vez al cargar el archivo
renderizarUI();