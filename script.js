/* ===========================================
   1. NAVEGACIÓN
   =========================================== */
function switchTab(tabName) {
    // 1. Ocultar todo
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // 2. Mostrar seleccionado
    document.getElementById('section-' + tabName).classList.add('active');
    
    // 3. Activar botón
    const buttons = document.querySelectorAll('.nav-btn');
    if(tabName === 'codes') buttons[0].classList.add('active');
    if(tabName === 'prices') buttons[1].classList.add('active');
    if(tabName === 'time') buttons[2].classList.add('active');

    // 4. Modo Oscuro (Solo Precios)
    if (tabName === 'prices') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Scroll suave arriba al cambiar
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
    // Permitir "Enter" en el teclado del celular
    inputUser.addEventListener('keyup', (e) => {
        if (e.key === "Enter") {
            inputUser.blur(); // Cierra el teclado del cel
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
    
    // Limpieza visual
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
        savingsBox.style.display = 'block'; // Asegura visualización

        // Comparar contra el más barato de las opciones mensuales/semanales
        let benchmark = (annualW > 0 && annualM > 0) ? Math.min(annualW, annualM) : Math.max(annualW, annualM);
        let diff = benchmark - y;
        
        const label = savingsBox.querySelector('.label');
        const amount = document.getElementById('savingsAmount');
        const detail = document.getElementById('savingsDetail');

        savingsBox.className = 'savings-box'; // Reset clases

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
   4. TIEMPO (Conversor y Otros)
   =========================================== */
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
    
    let val = parseFloat(inputSrc.value);
    if (isNaN(val)) { inputDest.value = ""; return; }
    
    const sec = val * rates[unitSrc.value];
    const res = sec / rates[unitDest.value];
    
    // Redondear bonito (máx 4 decimales)
    inputDest.value = parseFloat(res.toFixed(4));
}

if(tInputA) {
    tInputA.addEventListener('input', () => convertTime('down'));
    tInputB.addEventListener('input', () => convertTime('up'));
    tUnitA.addEventListener('change', () => convertTime('down'));
    tUnitB.addEventListener('change', () => convertTime('down'));
}

// --- Parking ---
const parkInput = document.getElementById('parkingInput');
if(parkInput) {
    parkInput.addEventListener('input', function() {
        const h = parseFloat(this.value);
        const total = (isNaN(h) || h < 0) ? 0 : h * 10;
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