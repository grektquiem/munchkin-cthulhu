// js/main.js

/**
 * ==========================================
 * 1. MODELO DE DATOS BASE (Clase Padre)
 * ==========================================
 */
class Combatiente {
    constructor(id, nombre, color) {
        this.id = id;
        this.nombre = nombre;
        this.color = color;
        this.nivel = 1;
        this.equipo = 0;
    }

    get fuerzaTotal() {
        return this.nivel + this.equipo;
    }

    // Render para Jugadores y Ayudantes
    render() {
        return `
            <div class="card mb-3 shadow-sm border-${this.color}">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="card-title fw-bold text-${this.color} m-0">${this.nombre}</h6>
                        <span class="badge bg-${this.color} fs-6">${this.fuerzaTotal}</span>
                    </div>
                    <div class="row g-2 align-items-end">
                        <div class="col-4">
                            <label class="small text-muted fw-bold">Nivel Base</label>
                            <input type="number" class="form-control px-1" value="${this.nivel}" min="1" 
                                oninput="actualizarNivel('${this.id}', this.value)">
                        </div>
                        <div class="col-8">
                            <label class="small text-muted fw-bold">Modificadores</label>
                            <div class="input-group">
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', -2)">-2</button>
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', -1)">-1</button>
                                <input type="number" class="form-control text-center fw-bold px-1" value="${this.equipo}" readonly>
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', 1)">+1</button>
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', 2)">+2</button>
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
 * 2. HERENCIA (Clase Hija para Monstruos)
 * ==========================================
 * 'extends' toma todo lo de Combatiente y nos deja añadir más cosas.
 */
class Monstruo extends Combatiente {
    constructor(id, nombre, color) {
        super(id, nombre, color); // Llama al constructor del padre
        this.tipo = 'normal'; // Nuevo atributo solo para monstruos
    }

    // Método exclusivo para obtener el texto de la regla
    obtenerReglasHTML() {
        switch (this.tipo) {
            case 'undead': return `<strong>Muerto Viviente:</strong> Otro Muerto Viviente puede unirse sin carta de Monstruo Errante. (solo jugador en turno)`;
            case 'goth': return `<strong>Gótico:</strong> Quien lo jugó (o los demás en orden) puede añadir otro Gótico de su mano.`;
            case 'cthulhu': return `<strong>Great Cthulhu:</strong> Monstruo Nivel 20. Prepárate para el terror absoluto.`;
            default: return '';
        }
    }

    // Sobrescribimos (Override) el render() del padre para añadir el selector
    render() {
        const reglas = this.obtenerReglasHTML();
        // Renderizado condicional: Si hay reglas, dibuja la alerta amarilla. Si no, dibuja vacío.
        const reglasDisplay = reglas ? `<div class="alert alert-warning p-2 mt-2 small lh-sm mb-0 shadow-sm">${reglas}</div>` : '';

        return `
            <div class="card mb-3 shadow-sm border-${this.color}">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h6 class="card-title fw-bold text-${this.color} m-0">${this.nombre}</h6>
                        <span class="badge bg-${this.color} fs-6">${this.fuerzaTotal}</span>
                    </div>
                    
                    <div class="row g-2 align-items-end mb-2">
                        <div class="col-4">
                            <label class="small text-muted fw-bold">Nivel Base</label>
                            <input type="number" class="form-control px-1" value="${this.nivel}" min="1" 
                                oninput="actualizarNivel('${this.id}', this.value)">
                        </div>
                        <div class="col-8">
                            <label class="small text-muted fw-bold">Modificadores</label>
                            <div class="input-group">
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', -2)">-2</button>
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', -1)">-1</button>
                                <input type="number" class="form-control text-center fw-bold px-1" value="${this.equipo}" readonly>
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', 1)">+1</button>
                                <button class="btn btn-outline-secondary px-2" onclick="ajustarEquipo('${this.id}', 2)">+2</button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-2 border-top pt-2">
                        <select class="form-select form-select-sm border-${this.color} bg-dark text-white" onchange="cambiarTipoMonstruo('${this.id}', this.value)">
                            <option value="normal" ${this.tipo === 'normal' ? 'selected' : ''}>Tipo: Normal</option>
                            <option value="undead" ${this.tipo === 'undead' ? 'selected' : ''}>Muerto Viviente (Undead)</option>
                            <option value="goth" ${this.tipo === 'goth' ? 'selected' : ''}>Gótico (Goth)</option>
                            <option value="cthulhu" ${this.tipo === 'cthulhu' ? 'selected' : ''}>Great Cthulhu</option>
                        </select>
                        ${reglasDisplay}
                    </div>

                </div>
            </div>
        `;
    }
}

/**
 * ==========================================
 * 3. ESTADO GLOBAL (Single Source of Truth)
 * ==========================================
 */
let jugadorPrincipal = new Combatiente('j1', 'Tu Personaje', 'primary');
let ayudante = null; 
// ATENCIÓN: Ahora instanciamos usando la clase 'Monstruo'
let monstruos = [new Monstruo('m1', 'Monstruo Principal', 'danger')];

/**
 * ==========================================
 * 4. CONTROLADORES DEL DOM (Renderizado)
 * ==========================================
 */
function renderizarUI() {
    let htmlJugadores = jugadorPrincipal.render();
    if (ayudante !== null) htmlJugadores += ayudante.render();
    document.getElementById('contenedor-jugadores').innerHTML = htmlJugadores;

    let htmlMonstruos = '';
    monstruos.forEach(monstruo => htmlMonstruos += monstruo.render());
    document.getElementById('contenedor-monstruos').innerHTML = htmlMonstruos;

    calcularTotales();
}

function calcularTotales() {
    let fuerzaJugadores = jugadorPrincipal.fuerzaTotal;
    if (ayudante !== null) fuerzaJugadores += ayudante.fuerzaTotal;

    const fuerzaMonstruos = monstruos.reduce((total, monstruo) => total + monstruo.fuerzaTotal, 0);

    document.getElementById('total-fuerza-jugadores').textContent = fuerzaJugadores;
    document.getElementById('total-fuerza-monstruos').textContent = fuerzaMonstruos;

    const status = document.getElementById('status-combate');
    if (fuerzaJugadores > fuerzaMonstruos) {
        status.textContent = "🏆 Jugadores Ganan";
        status.className = "badge p-2 fs-6 w-100 bg-success text-white shadow-sm text-wrap";
    } else {
        status.textContent = "💀 Monstruos Ganan";
        status.className = "badge p-2 fs-6 w-100 bg-danger text-white shadow-sm text-wrap";
    }
}

/**
 * ==========================================
 * 5. GESTIÓN DE EVENTOS Y MUTACIONES
 * ==========================================
 */
function encontrarCombatiente(id) {
    if (id === jugadorPrincipal.id) return jugadorPrincipal;
    if (ayudante && id === ayudante.id) return ayudante;
    return monstruos.find(m => m.id === id);
}

window.actualizarNivel = function(id, nuevoValor) {
    const valorPuro = parseInt(nuevoValor, 10) || 1; 
    const combatiente = encontrarCombatiente(id);
    combatiente.nivel = valorPuro;
    renderizarUI(); 
};

window.ajustarEquipo = function(id, cantidad) {
    const combatiente = encontrarCombatiente(id);
    combatiente.equipo += cantidad;
    renderizarUI();
};

// NUEVO: Función para mutar el tipo de monstruo
window.cambiarTipoMonstruo = function(id, nuevoTipo) {
    const monstruo = encontrarCombatiente(id);
    monstruo.tipo = nuevoTipo;
    renderizarUI(); // Repintamos para que aparezca la alerta amarilla
};

document.getElementById('switchAyudante').addEventListener('change', function(evento) {
    ayudante = evento.target.checked ? new Combatiente('a1', 'Compañero de Batalla', 'info') : null;
    renderizarUI();
});

document.getElementById('btnAnadirMonstruo').addEventListener('click', function() {
    if (monstruos.length < 3) {
        const nuevoId = `m${monstruos.length + 1}`;
        const nuevoNombre = `Monstruo Errante ${monstruos.length}`;
        // Instanciamos la clase hija Monstruo
        monstruos.push(new Monstruo(nuevoId, nuevoNombre, 'danger'));
        renderizarUI();
    } else {
        alert("Las reglas dictan que es muy poco probable enfrentar a más de 3 monstruos a la vez. ¡No pierdas la cordura!");
    }
});

/**
 * ==========================================
 * 6. INICIALIZACIÓN
 * ==========================================
 */
renderizarUI();