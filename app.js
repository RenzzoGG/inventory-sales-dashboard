// ---------- MOCK DATA (Datos de ejemplo) ----------

const products = [
    { id: 1, name: "Lenovo ThinkPad E14 Laptop", category: "Electronics", stock: 8, price: 1149.00 },
    { id: 2, name: "Logitech G203 Mouse", category: "Accessories", stock: 35, price: 39.99 },
    { id: 3, name: "Samsung 24\" Monitor", category: "Electronics", stock: 5, price: 179.99 },
    { id: 4, name: "Redragon K552 Keyboard", category: "Accessories", stock: 15, price: 49.99 },
    { id: 5, name: "Razer Iskur Gaming Chair", category: "Furniture", stock: 2, price: 499.00 },
    { id: 6, name: "iPhone 14", category: "Electronics", stock: 10, price: 699.00 },
    { id: 7, name: "Sony WH-1000XM5 Headphones", category: "Audio", stock: 12, price: 399.99 },
    { id: 8, name: "JBL Flip 6 Speaker", category: "Audio", stock: 4, price: 129.95 },
    { id: 9, name: "Standing Desk 48\"", category: "Furniture", stock: 6, price: 349.00 },
    { id: 10, name: "Anker USB-C Hub 7-in-1", category: "Accessories", stock: 40, price: 34.99 }
];


// Copia original para "Reset demo data"
const initialProducts = products.map(p => ({ ...p }));


// ---------- VENTAS DE EJEMPLO ----------
// Fechas relativas a hoy para que la demo siempre tenga ventas recientes.

function daysAgo(days) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - days);
    return date;
}

// [productId, cantidad, hace cuántos días]
const sampleSales = [
    [2, 3, 0], [6, 1, 1], [10, 2, 2], [4, 1, 3], [7, 1, 4],
    [1, 1, 6], [2, 2, 8], [3, 2, 9], [8, 1, 11], [10, 4, 13],
    [5, 1, 15], [6, 2, 17], [9, 1, 19], [4, 2, 22], [7, 2, 25],
    [1, 2, 28], [2, 5, 33], [3, 1, 37], [6, 1, 41], [8, 2, 45],
    [10, 3, 50], [9, 1, 54], [4, 3, 58]
];

const sales = sampleSales.map(([productId, qty, days], index) => ({
    id: 1001 + index,
    productId,
    qty,
    unitPrice: products.find(p => p.id === productId).price,
    date: daysAgo(days)
}));

// Más reciente primero
sales.sort((a, b) => b.date - a.date);


// ---------- Formato de moneda (Estados Unidos) ----------

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatMoney(amount) {
    return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function formatDate(date) {
    return dateFormatter.format(date);
}

// Montos cortos para el eje de la gráfica: $0, $500, $1.5K
const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
});

function formatCompactMoney(amount) {
    return compactCurrencyFormatter.format(amount);
}

// Sin año: para listas de días recientes
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function formatShortDate(date) {
    return shortDateFormatter.format(date);
}

// Fecha local en formato AAAA-MM-DD (para nombres de archivo)
function formatFileDate(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}


// ---------- MÉTRICAS ----------

const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const REVENUE_WINDOW_DAYS = 30;

// Se puede cambiar desde Settings
let lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD;

function getSaleTotal(sale) {
    return sale.qty * sale.unitPrice;
}

// Ventas de los últimos `days` días contando hoy (con 30: hoy y los 29 anteriores)
function getRecentSales(days) {
    const since = daysAgo(days);
    return sales.filter(sale => sale.date > since);
}

function isSameDay(a, b) {
    return a.toDateString() === b.toDateString();
}

// Ingresos por día, del más antiguo a hoy (incluye los días sin ventas)
function getDailyRevenue(days) {
    const result = [];
    for (let offset = days - 1; offset >= 0; offset--) {
        const date = daysAgo(offset);
        const daySales = sales.filter(sale => isSameDay(sale.date, date));
        result.push({ date, total: getRevenue(daySales), orders: daySales.length });
    }
    return result;
}

function isLowStock(product) {
    return product.stock <= lowStockThreshold;
}

function getLowStockProducts() {
    return products.filter(isLowStock);
}

function getInventoryValue(list = products) {
    return list.reduce((acc, p) => acc + p.price * p.stock, 0);
}

function getRevenue(list) {
    return list.reduce((acc, sale) => acc + getSaleTotal(sale), 0);
}

function getProductById(id) {
    return products.find(p => p.id === id);
}


// ---------- Actualizar cards ----------

function updateCards() {
    const unitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
    document.getElementById("total-products").textContent = products.length;
    document.getElementById("total-units").textContent = `${unitsInStock} units in stock`;

    // Ingresos de los últimos 30 días, calculados a partir de las ventas
    const recentSales = getRecentSales(REVENUE_WINDOW_DAYS);
    const revenue = getRevenue(recentSales);
    const unitsSold = recentSales.reduce((acc, sale) => acc + sale.qty, 0);
    document.getElementById("revenue").textContent = formatMoney(revenue);
    document.getElementById("revenue-note").textContent = `${recentSales.length} orders · ${unitsSold} units sold`;

    document.getElementById("low-stock").textContent = getLowStockProducts().length;
    document.getElementById("low-stock-note").textContent = `${lowStockThreshold} units or fewer`;

    // Valor del inventario: precio × stock (antes aparecía como "Monthly Revenue")
    document.getElementById("inventory-value").textContent = formatMoney(getInventoryValue());
}


// ---------- TABLA DE PRODUCTOS ----------

// textContent (y no innerHTML) para que el texto que escribe el usuario
// nunca se interprete como HTML.
function createCell(text, className) {
    const cell = document.createElement("td");
    cell.textContent = text;
    if (className) cell.className = className;
    return cell;
}

// Fila de tabla a partir de una lista de celdas
function createRow(cells) {
    const row = document.createElement("tr");
    row.append(...cells);
    return row;
}

// Fila con un mensaje que ocupa todas las columnas
function createEmptyRow(message, columns) {
    const cell = createCell(message, "empty-state");
    cell.colSpan = columns;
    return createRow([cell]);
}

function getProductName(productId) {
    const product = getProductById(productId);
    return product ? product.name : "Unknown product";
}

// Celda con una línea secundaria debajo: en móvil muestra los datos
// de las columnas ocultas (.col-hide-mobile) para evitar el scroll horizontal
function createCellWithSub(text, subText) {
    const cell = createCell(text);
    const sub = document.createElement("span");
    sub.className = "cell-sub";
    sub.textContent = subText;
    cell.appendChild(sub);
    return cell;
}

function createLowStockBadge() {
    const badge = document.createElement("span");
    badge.className = "badge badge-warning";
    badge.textContent = "Low";
    return badge;
}

// Búsqueda y categoría se aplican juntas
function getVisibleProducts() {
    const searchText = document.getElementById("search-input").value.trim().toLowerCase();
    const category = document.getElementById("category-filter").value;

    return products.filter(product => {
        const matchesCategory = category === "all" || product.category === category;
        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });
}

function renderProducts() {
    const list = getVisibleProducts();
    const tableBody = document.getElementById("product-table-body");
    tableBody.replaceChildren();

    if (list.length === 0) {
        tableBody.appendChild(createEmptyRow("No products match your search.", 4));
    }

    list.forEach(product => {
        const stockCell = createCell(product.stock, "num");
        if (isLowStock(product)) {
            stockCell.append(" ", createLowStockBadge());
        }

        // En móvil la categoría se muestra bajo el nombre (la columna se oculta)
        tableBody.appendChild(createRow([
            createCellWithSub(product.name, product.category),
            createCell(product.category, "col-hide-mobile"),
            stockCell,
            createCell(formatMoney(product.price), "num")
        ]));
    });

    document.getElementById("results-count").textContent =
        `Showing ${list.length} of ${products.length} products`;
}


// ---------- DASHBOARD: STOCK BAJO Y VENTAS RECIENTES ----------

function renderDashboardTables() {
    const lowStockBody = document.getElementById("low-stock-body");
    const lowStock = getLowStockProducts().sort((a, b) => a.stock - b.stock);
    lowStockBody.replaceChildren();

    if (lowStock.length === 0) {
        lowStockBody.appendChild(createEmptyRow("All products are well stocked.", 2));
    }

    lowStock.forEach(product => {
        lowStockBody.appendChild(createRow([
            createCell(product.name),
            createCell(product.stock, "num")
        ]));
    });

    const recentBody = document.getElementById("recent-sales-body");
    recentBody.replaceChildren();

    sales.slice(0, 5).forEach(sale => {
        recentBody.appendChild(createRow([
            createCell(formatShortDate(sale.date), "nowrap"),
            createCell(getProductName(sale.productId)),
            createCell(formatMoney(getSaleTotal(sale)), "num")
        ]));
    });
}


// ---------- GRÁFICA DE INGRESOS (SVG) ----------

const SVG_NS = "http://www.w3.org/2000/svg";
const CHART_TICKS = 4;

// Datos y medidas del último dibujo (los usa el tooltip)
const chartState = { days: [], activeIndex: -1, geometry: null, width: 0 };

function createSvgElement(tag, attributes) {
    const element = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
    }
    return element;
}

// Máximo del eje redondeado para que las marcas sean números "limpios"
// (pasos de 1, 1.5, 2, 2.5, 3, 4, 5, 6 u 8 × 10^n: la barra más alta llena casi todo el alto)
function getNiceMax(value, ticks) {
    if (value <= 0) return ticks * 100;
    const rawStep = value / ticks;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map(m => m * magnitude).find(s => s >= rawStep);
    return Number((step * ticks).toPrecision(12));   // evita 0.6000000000000001
}

// Columna con esquinas superiores redondeadas y base recta
function columnPath(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height);
    const bottom = y + height;
    return `M${x},${bottom} V${y + r} Q${x},${y} ${x + r},${y} ` +
        `H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${bottom} Z`;
}

function renderRevenueChart() {
    const container = document.getElementById("revenue-chart");
    const days = getDailyRevenue(REVENUE_WINDOW_DAYS);
    chartState.days = days;

    // Medidas según el ancho real (600 si aún no hay layout, p. ej. sección oculta)
    const width = container.clientWidth || 600;
    chartState.width = container.clientWidth;
    const isCompact = width < 500;
    const height = isCompact ? 180 : 220;
    const margin = { top: 12, right: 8, bottom: 28, left: 48 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const baseline = margin.top + plotHeight;
    const maxValue = getNiceMax(Math.max(...days.map(d => d.total)), CHART_TICKS);
    const band = plotWidth / days.length;
    const barWidth = Math.max(2, Math.min(24, band - 2));
    const yFor = value => baseline - (value / maxValue) * plotHeight;
    chartState.geometry = { band, left: margin.left, yFor };

    const svg = createSvgElement("svg", {
        width,
        height,
        class: "chart-svg",
        role: "img",
        tabindex: "0",
        "aria-labelledby": "chart-title",
        "aria-describedby": "chart-summary"
    });

    // Líneas guía y etiquetas del eje Y
    for (let i = 0; i <= CHART_TICKS; i++) {
        const value = (maxValue / CHART_TICKS) * i;
        const y = Math.round(yFor(value)) + 0.5;
        svg.appendChild(createSvgElement("line", { x1: margin.left, x2: width - margin.right, y1: y, y2: y, class: "chart-grid" }));

        const label = createSvgElement("text", { x: margin.left - 8, y, class: "chart-axis", "text-anchor": "end", "dominant-baseline": "middle" });
        label.textContent = formatCompactMoney(value);
        svg.appendChild(label);
    }

    // Etiquetas del eje X: hoy y cada 7 días hacia atrás (cada 10 en móvil)
    const labelEvery = isCompact ? 10 : 7;
    days.forEach((day, i) => {
        const daysFromToday = days.length - 1 - i;
        if (daysFromToday % labelEvery !== 0) return;
        const isToday = daysFromToday === 0;
        const label = createSvgElement("text", {
            x: isToday ? width - margin.right : margin.left + band * (i + 0.5),
            y: height - 8,
            class: "chart-axis",
            "text-anchor": isToday ? "end" : "middle"
        });
        label.textContent = isToday ? "Today" : formatShortDate(day.date);
        svg.appendChild(label);
    });

    // Columnas (solo días con ventas) y áreas activas (todos los días)
    days.forEach((day, i) => {
        if (day.total > 0) {
            const x = margin.left + band * i + (band - barWidth) / 2;
            const y = yFor(day.total);
            svg.appendChild(createSvgElement("path", {
                d: columnPath(x, y, barWidth, baseline - y, 4),
                class: "chart-bar",
                "data-index": i
            }));
        }
    });

    days.forEach((day, i) => {
        svg.appendChild(createSvgElement("rect", {
            x: margin.left + band * i,
            y: margin.top,
            width: band,
            height: plotHeight,
            class: "chart-hit",
            "data-index": i
        }));
    });

    container.querySelector("svg")?.remove();
    container.prepend(svg);

    renderChartText(days);

    // Si había un día activo (p. ej. al redimensionar), vuelve a mostrarlo
    if (chartState.activeIndex >= 0) showChartTooltip(chartState.activeIndex);
}

// Subtítulo, resumen para lectores de pantalla y tabla "View as table"
function renderChartText(days) {
    const total = getRevenue(getRecentSales(REVENUE_WINDOW_DAYS));
    const orders = days.reduce((acc, d) => acc + d.orders, 0);
    const best = days.reduce((top, d) => (d.total > top.total ? d : top), days[0]);
    const emptyDays = days.filter(d => d.total === 0).length;

    document.getElementById("chart-subtitle").textContent =
        `Last ${REVENUE_WINDOW_DAYS} days · ${formatMoney(total)} total`;

    document.getElementById("chart-summary").textContent = total === 0
        ? `No sales in the last ${REVENUE_WINDOW_DAYS} days.`
        : `Revenue over the last ${REVENUE_WINDOW_DAYS} days totaled ${formatMoney(total)} from ${orders} orders. ` +
          `Best day: ${formatDate(best.date)} with ${formatMoney(best.total)}. ` +
          `${emptyDays} days had no sales. Use the left and right arrow keys to explore each day.`;

    const tableBody = document.getElementById("chart-table-body");
    tableBody.replaceChildren();
    [...days].reverse().forEach(day => {
        tableBody.appendChild(createRow([
            createCell(formatDate(day.date), "nowrap"),
            createCell(day.orders, "num"),
            createCell(formatMoney(day.total), "num")
        ]));
    });
}

function describeDay(day) {
    const orders = `${day.orders} ${day.orders === 1 ? "order" : "orders"}`;
    return { value: formatMoney(day.total), detail: `${formatDate(day.date)} · ${orders}` };
}

function showChartTooltip(index) {
    const day = chartState.days[index];
    if (!day) return;
    chartState.activeIndex = index;

    const container = document.getElementById("revenue-chart");
    const tooltip = document.getElementById("chart-tooltip");
    const { value, detail } = describeDay(day);

    const strong = document.createElement("strong");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = detail;
    tooltip.replaceChildren(strong, span);
    tooltip.hidden = false;

    // Resalta la columna y su área activa
    container.querySelectorAll(".is-active").forEach(el => el.classList.remove("is-active"));
    container.querySelectorAll(`[data-index="${index}"]`).forEach(el => el.classList.add("is-active"));

    // Encima de la barra si cabe; si no, al lado (para no taparla)
    const { band, left, yFor } = chartState.geometry;
    const tipWidth = tooltip.offsetWidth;
    const tipHeight = tooltip.offsetHeight;
    const containerWidth = container.clientWidth;
    const centerX = left + band * (index + 0.5);
    const barTop = yFor(day.total);
    const gap = 10;
    let x;
    let y;

    if (barTop - tipHeight - gap >= 0) {
        x = centerX - tipWidth / 2;
        y = barTop - tipHeight - gap;
    } else {
        const rightSide = centerX + band / 2 + gap;
        x = rightSide + tipWidth <= containerWidth ? rightSide : centerX - band / 2 - gap - tipWidth;
        y = barTop;
    }

    // Nunca fuera del panel por los lados
    x = Math.min(Math.max(x, 0), Math.max(containerWidth - tipWidth, 0));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function hideChartTooltip() {
    chartState.activeIndex = -1;
    document.getElementById("chart-tooltip").hidden = true;
    document.querySelectorAll("#revenue-chart .is-active").forEach(el => el.classList.remove("is-active"));
}

function setupChartEvents() {
    const container = document.getElementById("revenue-chart");

    // pointer* cubre mouse, toque y lápiz
    const handlePointer = event => {
        const index = event.target.dataset ? event.target.dataset.index : undefined;
        if (index !== undefined) showChartTooltip(Number(index));
    };
    container.addEventListener("pointermove", handlePointer);
    container.addEventListener("pointerdown", handlePointer);
    container.addEventListener("pointerleave", event => {
        if (event.pointerType === "mouse") hideChartTooltip();
    });

    // En móvil: tocar fuera de la gráfica cierra el tooltip
    document.addEventListener("pointerdown", event => {
        if (!container.contains(event.target)) hideChartTooltip();
    });

    // Teclado: flechas recorren los días, Escape cierra
    container.addEventListener("keydown", event => {
        const last = chartState.days.length - 1;
        const current = chartState.activeIndex;
        let next = null;

        if (event.key === "ArrowRight") next = current < 0 ? 0 : Math.min(current + 1, last);
        if (event.key === "ArrowLeft") next = current < 0 ? last : Math.max(current - 1, 0);
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = last;
        if (event.key === "Escape") hideChartTooltip();
        if (next === null) return;

        event.preventDefault();
        showChartTooltip(next);
        const { value, detail } = describeDay(chartState.days[next]);
        document.getElementById("chart-live").textContent = `${detail}: ${value}`;
    });
    container.addEventListener("focusout", hideChartTooltip);

    // Redibuja cuando cambia el ancho (resize, rotar el móvil, mostrar el Dashboard)
    if ("ResizeObserver" in window) {
        let frame;
        new ResizeObserver(() => {
            if (container.clientWidth === chartState.width) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(renderRevenueChart);
        }).observe(container);
    }
}


// ---------- SALES ----------

function renderSales() {
    const tableBody = document.getElementById("sales-table-body");
    tableBody.replaceChildren();

    sales.forEach(sale => {
        // En móvil pedido, cantidad y precio unitario van bajo el producto
        // (\u00A0 = espacio no separable: "2 × $39.99" nunca se parte en dos líneas)
        const details = `#${sale.id} · ${sale.qty}\u00A0×\u00A0${formatMoney(sale.unitPrice)}`;

        tableBody.appendChild(createRow([
            createCell("#" + sale.id, "col-hide-mobile"),
            createCell(formatDate(sale.date), "nowrap"),
            createCellWithSub(getProductName(sale.productId), details),
            createCell(sale.qty, "num col-hide-mobile"),
            createCell(formatMoney(sale.unitPrice), "num col-hide-mobile"),
            createCell(formatMoney(getSaleTotal(sale)), "num")
        ]));
    });

    document.getElementById("sales-summary").textContent =
        `${sales.length} orders · ${formatMoney(getRevenue(sales))} in total revenue`;
}


// ---------- REPORTS: RESUMEN POR CATEGORÍA ----------

function renderReports() {
    const tableBody = document.getElementById("report-table-body");
    const tableFoot = document.getElementById("report-table-foot");
    const recentSales = getRecentSales(REVENUE_WINDOW_DAYS);
    tableBody.replaceChildren();

    getCategories().forEach(category => {
        const categoryProducts = products.filter(p => p.category === category);
        const categorySales = recentSales.filter(sale => {
            const product = getProductById(sale.productId);
            return product && product.category === category;
        });

        tableBody.appendChild(createRow([
            createCell(category),
            createCell(categoryProducts.length, "num"),
            createCell(categoryProducts.reduce((acc, p) => acc + p.stock, 0), "num"),
            createCell(formatMoney(getInventoryValue(categoryProducts)), "num"),
            createCell(formatMoney(getRevenue(categorySales)), "num")
        ]));
    });

    // Totales: coinciden con las tarjetas del Dashboard
    tableFoot.replaceChildren(createRow([
        createCell("Total"),
        createCell(products.length, "num"),
        createCell(products.reduce((acc, p) => acc + p.stock, 0), "num"),
        createCell(formatMoney(getInventoryValue()), "num"),
        createCell(formatMoney(getRevenue(recentSales)), "num")
    ]));
}


// ---------- GENERAR CATEGORÍAS ÚNICAS ----------

function getCategories() {
    return [...new Set(products.map(p => p.category))].sort();
}

function loadCategories() {
    const select = document.getElementById("category-filter");
    const datalist = document.getElementById("category-options");
    const selected = select.value;
    const categories = getCategories();

    select.replaceChildren(new Option("All Categories", "all"));
    datalist.replaceChildren();

    categories.forEach(cat => {
        select.appendChild(new Option(cat, cat));
        datalist.appendChild(new Option(cat));
    });

    // Conserva el filtro elegido si la categoría sigue existiendo
    select.value = categories.includes(selected) ? selected : "all";
}


// ---------- AVISOS (toast) ----------

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 3000);
}


// ---------- MODAL LOGIC ----------

const modal = document.getElementById("modal");
const productForm = document.getElementById("product-form");
const formError = document.getElementById("form-error");
let lastFocusedElement = null;

function openModal() {
    lastFocusedElement = document.activeElement;
    modal.classList.remove("hidden");
    document.getElementById("new-name").focus();
}

function closeModal() {
    modal.classList.add("hidden");
    productForm.reset();
    formError.textContent = "";
    // Devuelve el foco al botón que abrió el modal
    if (lastFocusedElement) lastFocusedElement.focus();
}

function isModalOpen() {
    return !modal.classList.contains("hidden");
}

// Escape cierra; Tab no se sale del modal mientras está abierto
function handleModalKeydown(event) {
    if (!isModalOpen()) return;

    if (event.key === "Escape") {
        closeModal();
        return;
    }

    if (event.key === "Tab") {
        const focusable = modal.querySelectorAll("input, button");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

function showFormError(message, fieldId) {
    formError.textContent = message;
    document.getElementById(fieldId).focus();
}

function saveProduct(event) {
    event.preventDefault();

    const name = document.getElementById("new-name").value.trim();
    let category = document.getElementById("new-category").value.trim();
    const stockValue = document.getElementById("new-stock").value;
    const priceValue = document.getElementById("new-price").value;
    const stock = Number(stockValue);
    const price = Number(priceValue);

    if (!name) return showFormError("Please enter a product name.", "new-name");
    if (!category) return showFormError("Please enter a category.", "new-category");
    if (stockValue === "" || !Number.isInteger(stock) || stock < 0) {
        return showFormError("Stock must be a whole number (0 or more).", "new-stock");
    }
    if (priceValue === "" || !(price > 0)) {
        return showFormError("Price must be greater than $0.", "new-price");
    }

    // Reutiliza la categoría existente aunque se escriba con otras mayúsculas
    const existing = getCategories().find(cat => cat.toLowerCase() === category.toLowerCase());
    if (existing) category = existing;

    products.push({
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        name,
        category,
        stock,
        price: Math.round(price * 100) / 100
    });

    renderAll();
    closeModal();
    showToast(`"${name}" was added to the inventory.`);
}


// ---------- EXPORTAR A PDF ----------

// Recorta el texto con "..." si no cabe en el ancho de la columna
function fitText(doc, text, maxWidth) {
    if (doc.getTextWidth(text) <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && doc.getTextWidth(cut + "...") > maxWidth) {
        cut = cut.slice(0, -1);
    }
    return cut + "...";
}

function exportToPDF(list) {
    if (!window.jspdf) {
        showToast("The PDF library could not be loaded. Check your connection.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginBottom = 20;
    const rowHeight = 8;

    // x = posición; las columnas numéricas se alinean a la derecha
    const columns = {
        name: { x: 14, width: 82 },
        category: { x: 100, width: 40 },
        stock: { x: 160 },
        price: { x: 196 }
    };

    // Título y fecha
    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Generated: " + new Date().toLocaleString("en-US"), 14, 25);
    doc.text(`${list.length} products · Inventory value: ${formatMoney(getInventoryValue(list))}`, 14, 31);
    doc.setTextColor(0);

    function drawHeader(y) {
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("Name", columns.name.x, y);
        doc.text("Category", columns.category.x, y);
        doc.text("Stock", columns.stock.x, y, { align: "right" });
        doc.text("Price", columns.price.x, y, { align: "right" });
        doc.setFont(undefined, "normal");
        doc.line(14, y + 3, 196, y + 3);
        return y + rowHeight + 2;
    }

    let y = drawHeader(42);

    list.forEach(p => {
        // Nueva página cuando ya no cabe la fila
        if (y > pageHeight - marginBottom) {
            doc.addPage();
            y = drawHeader(20);
        }

        doc.text(fitText(doc, p.name, columns.name.width), columns.name.x, y);
        doc.text(fitText(doc, p.category, columns.category.width), columns.category.x, y);
        doc.text(String(p.stock), columns.stock.x, y, { align: "right" });
        doc.text(formatMoney(p.price), columns.price.x, y, { align: "right" });
        y += rowHeight;
    });

    doc.save(`inventory_report_${formatFileDate(new Date())}.pdf`);
}


// ---------- EXPORTAR A EXCEL ----------

function exportToExcel(list) {
    if (!window.XLSX) {
        showToast("The Excel library could not be loaded. Check your connection.");
        return;
    }

    // Convertir los productos visibles a un formato plano para Excel
    const data = list.map(p => ({
        Name: p.name,
        Category: p.category,
        Stock: p.stock,
        Price: p.price
    }));

    // Crear un workbook y un worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Formato de moneda en la columna Price (D), conservando el valor numérico
    for (let row = 2; row <= data.length + 1; row++) {
        worksheet["D" + row].z = "$#,##0.00";
    }

    // Ancho de columnas
    worksheet["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 8 }, { wch: 12 }];

    // Agregar hoja al libro y descargar
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `inventory_report_${formatFileDate(new Date())}.xlsx`);
}


// ---------- SETTINGS ----------

function updateThreshold(event) {
    const value = Number(event.target.value);
    // Ignora valores inválidos mientras se escribe
    if (event.target.value === "" || !Number.isInteger(value) || value < 0) return;
    lowStockThreshold = value;
    renderAll();
}

function resetDemoData() {
    products.splice(0, products.length, ...initialProducts.map(p => ({ ...p })));
    lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD;
    document.getElementById("search-input").value = "";
    document.getElementById("category-filter").value = "all";
    renderAll();
    showToast("Demo data has been reset.");
}


// ---------- NAVEGACIÓN (secciones por #hash) ----------

const VIEW_TITLES = {
    dashboard: "Dashboard",
    products: "Products",
    sales: "Sales",
    reports: "Reports",
    settings: "Settings"
};

function showView({ moveFocus = false } = {}) {
    const requested = location.hash.slice(1);
    const view = requested in VIEW_TITLES ? requested : "dashboard";

    document.querySelectorAll(".view").forEach(section => {
        section.hidden = section.dataset.view !== view;
    });

    document.querySelectorAll(".menu a").forEach(link => {
        const isActive = link.getAttribute("href") === "#" + view;
        link.classList.toggle("active", isActive);
        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    document.title = `${VIEW_TITLES[view]} · Inventory & Sales Dashboard`;

    // Al cambiar de sección: vuelve arriba y lleva el foco al título (lectores de pantalla)
    if (moveFocus) {
        window.scrollTo(0, 0);
        document.querySelector(`.view[data-view="${view}"] h1`).focus();
    }
}


// ---------- Inicializar Dashboard ----------

// Redibuja todo lo que depende de los datos
function renderAll() {
    document.getElementById("threshold-input").value = lowStockThreshold;
    loadCategories();
    renderProducts();
    updateCards();
    renderDashboardTables();
    renderRevenueChart();
    renderSales();
    renderReports();
}


document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    setupChartEvents();
    showView();
    window.addEventListener("hashchange", () => showView({ moveFocus: true }));

    document.getElementById("search-input").addEventListener("input", renderProducts);
    document.getElementById("category-filter").addEventListener("change", renderProducts);
    document.getElementById("export-pdf-btn").addEventListener("click", () => exportToPDF(getVisibleProducts()));
    document.getElementById("export-excel-btn").addEventListener("click", () => exportToExcel(getVisibleProducts()));
    document.getElementById("report-pdf-btn").addEventListener("click", () => exportToPDF(products));
    document.getElementById("report-excel-btn").addEventListener("click", () => exportToExcel(products));

    document.getElementById("threshold-input").addEventListener("input", updateThreshold);
    document.getElementById("reset-data-btn").addEventListener("click", resetDemoData);

    document.getElementById("add-product-btn").addEventListener("click", openModal);
    document.getElementById("close-modal").addEventListener("click", closeModal);
    productForm.addEventListener("submit", saveProduct);
    document.addEventListener("keydown", handleModalKeydown);

    // Clic fuera del contenido cierra el modal
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });
});
