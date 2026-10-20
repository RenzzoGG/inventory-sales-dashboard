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

// Fecha local en formato AAAA-MM-DD (para nombres de archivo)
function formatFileDate(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}


// ---------- MÉTRICAS ----------

const LOW_STOCK_THRESHOLD = 5;
const REVENUE_WINDOW_DAYS = 30;

function getSaleTotal(sale) {
    return sale.qty * sale.unitPrice;
}

function getRecentSales(days) {
    const since = daysAgo(days);
    return sales.filter(sale => sale.date >= since);
}

function isLowStock(product) {
    return product.stock <= LOW_STOCK_THRESHOLD;
}

function getLowStockProducts() {
    return products.filter(isLowStock);
}

function getInventoryValue(list = products) {
    return list.reduce((acc, p) => acc + p.price * p.stock, 0);
}


// ---------- Actualizar cards ----------

function updateCards() {
    const unitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
    document.getElementById("total-products").textContent = products.length;
    document.getElementById("total-units").textContent = `${unitsInStock} units in stock`;

    // Ingresos de los últimos 30 días, calculados a partir de las ventas
    const recentSales = getRecentSales(REVENUE_WINDOW_DAYS);
    const revenue = recentSales.reduce((acc, sale) => acc + getSaleTotal(sale), 0);
    const unitsSold = recentSales.reduce((acc, sale) => acc + sale.qty, 0);
    document.getElementById("revenue").textContent = formatMoney(revenue);
    document.getElementById("revenue-note").textContent = `${recentSales.length} orders · ${unitsSold} units sold`;

    document.getElementById("low-stock").textContent = getLowStockProducts().length;
    document.getElementById("low-stock-note").textContent = `${LOW_STOCK_THRESHOLD} units or fewer`;

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
        const row = document.createElement("tr");
        const cell = createCell("No products match your search.", "empty-state");
        cell.colSpan = 4;
        row.appendChild(cell);
        tableBody.appendChild(row);
    }

    list.forEach(product => {
        const row = document.createElement("tr");

        const stockCell = createCell(product.stock, "num");
        if (isLowStock(product)) {
            stockCell.append(" ", createLowStockBadge());
        }

        row.append(
            createCell(product.name),
            createCell(product.category),
            stockCell,
            createCell(formatMoney(product.price), "num")
        );
        tableBody.appendChild(row);
    });

    document.getElementById("results-count").textContent =
        `Showing ${list.length} of ${products.length} products`;
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

    loadCategories();
    renderProducts();
    updateCards();
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

function exportToPDF() {
    if (!window.jspdf) {
        showToast("The PDF library could not be loaded. Check your connection.");
        return;
    }

    const list = getVisibleProducts();
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

function exportToExcel() {
    if (!window.XLSX) {
        showToast("The Excel library could not be loaded. Check your connection.");
        return;
    }

    // Convertir los productos visibles a un formato plano para Excel
    const data = getVisibleProducts().map(p => ({
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


// ---------- Inicializar Dashboard ----------

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    renderProducts();
    updateCards();

    document.getElementById("search-input").addEventListener("input", renderProducts);
    document.getElementById("category-filter").addEventListener("change", renderProducts);
    document.getElementById("export-pdf-btn").addEventListener("click", exportToPDF);
    document.getElementById("export-excel-btn").addEventListener("click", exportToExcel);

    document.getElementById("add-product-btn").addEventListener("click", openModal);
    document.getElementById("close-modal").addEventListener("click", closeModal);
    productForm.addEventListener("submit", saveProduct);
    document.addEventListener("keydown", handleModalKeydown);

    // Clic fuera del contenido cierra el modal
    modal.addEventListener("click", event => {
        if (event.target === modal) closeModal();
    });
});
