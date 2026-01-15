/* ===========================================
   1. NAVEGACIÓN
   =========================================== */
function switchTab(tabName) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById('section-' + tabName).classList.add('active');
    
    const buttons = document.querySelectorAll('.nav-btn');
    if(tabName === 'codes') buttons[0].classList.add('active');
    if(tabName === 'prices') buttons[1].classList.add('active');
    if(tabName === 'time') buttons[2].classList.add('active');

    if (tabName === 'prices') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===========================================
   2. CÓDIGOS QR / BARRAS
   =========================================== */
const btnGenerar = document.getElementById('btnGenerar');
const btnDescargar = document.getElementById('btnDescargar');
const inputUser = document.getElementById('codeUserInput');
let ultimoTipoGenerado = null;

if(btnGenerar) {
    btnGenerar.addEventListener('click', procesarCodigo);
    btnDescargar.addEventListener('click', descargarImagen);
    inputUser.addEventListener('keyup', (e) => {
        if (e.key === "Enter") {
            inputUser.blur(); 
            procesarCodigo();
        }
    });
}

function procesarCodigo() {
    const input = inputUser.value.trim();
    const tipoSeleccionado = document.querySelector('input[name="tipoCodigo"]:checked').value;
    const qrCard = document.getElementById('qr-card');
    const barcodeCard = document.getElementById('barcode-card');
    const downloadSection = document.getElementById('download-section');
    const qrOutputDiv = document.getElementById('qrcode-output');
    const canvas = document.getElementById('barcode-output');
    
    qrOutputDiv.innerHTML = "";
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0; canvas.height = 0;
    qrCard.style.display = "none";
    barcodeCard.style.display = "none";
    downloadSection.style.display = "none";

    if (input === "") { alert("Escribe algo primero."); return; }

    if (tipoSeleccionado === 'qr') {
        qrCard.style.display = "flex";
        setTimeout(() => {
             new QRCode(qrOutputDiv, {
                text: input, width: 180, height: 180,
                colorDark : "#000000", colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            downloadBtnCheck('qr');
        }, 100);
    } else {
        try {
            JsBarcode("#barcode-output", input, {
                format: "CODE128", lineColor: "#000", width: 2, height: 60,
                displayValue: true, margin: 10, background: "#ffffff"
            });
            barcodeCard.style.display = "flex";
            downloadBtnCheck('bar');
        } catch (e) { alert("Caracteres no válidos para barras."); }
    }
}

function downloadBtnCheck(type) {
    document.getElementById('download-section').style.display = "block";
    ultimoTipoGenerado = type;
}

function descargarImagen() {
    if (!ultimoTipoGenerado) return;
    let url, name;
    if (ultimoTipoGenerado === 'qr') {
        const img = document.querySelector('#qrcode-output img');
        if(img) { url = img.src; name = 'qr-code.png'; }
    } else {
        const cvs = document.getElementById('barcode-output');
        url = cvs.toDataURL("image/png"); name = 'barcode.png';
    }
    if (url) {
        const link = document.createElement('a');
        link.href = url; link.download = name;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
}

/* ===========================================
   3. CALCULADORA PRECIOS
   =========================================== */
const priceInputs = [
    document.getElementById('weeklyInput'),
    document.getElementById('monthlyInput'),
    document.getElementById('yearlyInput')
];

priceInputs.forEach(input => {
    if(input) input.addEventListener('input', calculatePrices);
});

function calculatePrices() {
    const w = parseFloat(priceInputs[0].value) || 0;
    const m = parseFloat(priceInputs[1].value) || 0;
    const y = parseFloat(priceInputs[2].value) || 0;

    const annualW = w * 52;
    const annualM = m * 12;

    document.getElementById('totalWeeklyYear').innerText = `$${annualW.toLocaleString()}`;
    document.getElementById('totalMonthlyYear').innerText = `$${annualM.toLocaleString()}`;
    document.getElementById('yearlyDisplay').innerText = `$${y.toLocaleString()}`;

    const savingsBox = document.getElementById('savingsBox');
    
    if (y > 0 && (annualW > 0 || annualM > 0)) {
        savingsBox.classList.remove('hidden');
        savingsBox.style.display = 'block';

        let benchmark = (annualW > 0 && annualM > 0) ? Math.min(annualW, annualM) : Math.max(annualW, annualM);
        let diff = benchmark - y;
        
        const label = savingsBox.querySelector('.label');
        const amount = document.getElementById('savingsAmount');
        const detail = document.getElementById('savingsDetail');

        savingsBox.className = 'savings-box'; 

        if (diff > 0) {
            savingsBox.style.backgroundColor = "#107C10";
            label.innerText = "¡Ahorras!";
            amount.innerText = `$${diff.toLocaleString()}`;
            detail.innerText = "vs pagar mes/semana";
        } else if (diff < 0) {
            savingsBox.classList.add('loss');
            label.innerText = "Pérdida:";
            amount.innerText = `$${Math.abs(diff).toLocaleString()}`;
            detail.innerText = "La anualidad es más cara";
        } else {
            savingsBox.classList.add('neutral');
            label.innerText = "Igual";
            amount.innerText = "$0";
            detail.innerText = "Mismo precio";
        }
    } else {
        savingsBox.style.display = 'none';
    }
}

/* ===========================================
   4. TIEMPO (Conversor y Parking)
   =========================================== */

// --- LÓGICA DE FORMATO LEGIBLE ---
function formatHumanTime(val, unit) {
    // Si el valor no es válido
    if (isNaN(val)) return "";
    
    // Si elegimos "Horas" y tenemos decimales
    if (unit === 'hours') {
        const hrs = Math.floor(val);
        const mins = Math.round((val - hrs) * 60);
        
        // Ej: 119 min -> 1.98h -> 1 h y 59 min
        if (hrs > 0 && mins > 0) return `${hrs} h y ${mins} min`;
        if (hrs > 0 && mins === 0) return `${hrs} horas`;
        if (hrs === 0) return `${mins} minutos`;
    }
    
    // Si elegimos "Días" y tenemos decimales
    if (unit === 'days') {
        const days = Math.floor(val);
        const hrs = Math.round((val - days) * 24);
        
        if (days > 0 && hrs > 0) return `${days} d y ${hrs} h`;
        if (days > 0 && hrs === 0) return `${days} días`;
        if (days === 0) return `${hrs} horas`;
    }

    // Para el resto (segundos, minutos puros) o si son enteros
    return parseFloat(val.toFixed(2));
}

const tInputA = document.getElementById('inputTop');
const tInputB = document.getElementById('inputBottom');
const tUnitA = document.getElementById('unitTop');
const tUnitB = document.getElementById('unitBottom');
const rates = { seconds: 1, minutes: 60, hours: 3600, days: 86400 };

function convertTime(direction) {
    const inputSrc = direction === 'down' ? tInputA : tInputB;
    const inputDest = direction === 'down' ? tInputB : tInputA;
    const unitSrc = direction === 'down' ? tUnitA : tUnitB;
    const unitDest = direction === 'down' ? tUnitB : tUnitA;
    
    // ParseFloat directo. Si el usuario escribe texto en el input fuente, se limpia.
    let val = parseFloat(inputSrc.value);
    
    if (isNaN(val)) { 
        // No borramos si está escribiendo, solo si está vacío
        if(inputSrc.value === "") inputDest.value = ""; 
        return; 
    }
    
    const sec = val * rates[unitSrc.value];
    const res = sec / rates[unitDest.value];
    
    // Usamos la nueva función de formato
    inputDest.value = formatHumanTime(res, unitDest.value);
}

if(tInputA) {
    // Eventos para calcular al escribir o cambiar unidad
    tInputA.addEventListener('input', () => convertTime('down'));
    // Al hacer click en el input, si tiene texto tipo "1 h y 50 min", 
    // lo limpiamos para que puedas escribir un número nuevo fácilmente
    tInputA.addEventListener('focus', function() { if(isNaN(this.value)) this.value = ""; });
    
    tInputB.addEventListener('input', () => convertTime('up'));
    tInputB.addEventListener('focus', function() { if(isNaN(this.value)) this.value = ""; });

    tUnitA.addEventListener('change', () => convertTime('down'));
    tUnitB.addEventListener('change', () => convertTime('down'));
}

// --- Parking (Actualizado a $10 por 2 horas = $5/h) ---
const parkInput = document.getElementById('parkingInput');
// Tarifa: $5 pesos por hora
const pricePerHour = 5; 

if(parkInput) {
    parkInput.addEventListener('input', function() {
        let h = parseFloat(this.value);
        if (isNaN(h) || h < 0) h = 0;
        const total = h * pricePerHour;
        document.getElementById('parkingResult').innerText = `$ ${total.toFixed(2)}`;
    });
}

// --- Sumar Horas ---
const timeels = [document.getElementById('startTime'), document.getElementById('addHours'), document.getElementById('addMinutes')];
if(timeels[0]) {
    timeels.forEach(el => el.addEventListener('input', () => {
        const start = timeels[0].value;
        if(!start) return;
        let [h, m] = start.split(':').map(Number);
        h += parseInt(timeels[1].value || 0);
        m += parseInt(timeels[2].value || 0);
        
        const date = new Date();
        date.setHours(h); date.setMinutes(m);
        
        document.getElementById('endTimeResult').innerText = 
            `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    }));
}