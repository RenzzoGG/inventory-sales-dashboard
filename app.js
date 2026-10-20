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

function getRecentSales(days) {
    const since = daysAgo(days);
    return sales.filter(sale => sale.date >= since);
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

        tableBody.appendChild(createRow([
            createCell(product.name),
            createCell(product.category),
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
            createCell(formatDate(sale.date)),
            createCell(getProductName(sale.productId)),
            createCell(formatMoney(getSaleTotal(sale)), "num")
        ]));
    });
}


// ---------- SALES ----------

function renderSales() {
    const tableBody = document.getElementById("sales-table-body");
    tableBody.replaceChildren();

    sales.forEach(sale => {
        tableBody.appendChild(createRow([
            createCell("#" + sale.id),
            createCell(formatDate(sale.date)),
            createCell(getProductName(sale.productId)),
            createCell(sale.qty, "num"),
            createCell(formatMoney(sale.unitPrice), "num"),
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
    renderSales();
    renderReports();
}


document.addEventListener("DOMContentLoaded", () => {
    renderAll();
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
