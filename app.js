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


// ---------- Cargar productos a la tabla ----------

function loadProducts() {
    const tableBody = document.getElementById("product-table-body");
    tableBody.innerHTML = ""; // limpia

    products.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>${formatMoney(product.price)}</td>
        `;

        tableBody.appendChild(row);
    });
}


// ---------- BUSCADOR DE PRODUCTOS ----------

function searchProducts() {
    const searchText = document.getElementById("search-input").value.toLowerCase();

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText)
    );

    renderFilteredProducts(filtered);
}

function renderFilteredProducts(list) {
    const tableBody = document.getElementById("product-table-body");
    tableBody.innerHTML = "";

    list.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>${formatMoney(product.price)}</td>
        `;
        tableBody.appendChild(row);
    });
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

function getLowStockProducts() {
    return products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
}

function getInventoryValue() {
    return products.reduce((acc, p) => acc + p.price * p.stock, 0);
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


// ---------- GENERAR CATEGORÍAS ÚNICAS ----------

function loadCategories() {
    const select = document.getElementById("category-filter");

    const categories = [...new Set(products.map(p => p.category))];

    select.innerHTML = `<option value="all">All Categories</option>`;

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}


// ---------- FILTRAR POR CATEGORÍA ----------

function filterByCategory() {
    const selected = document.getElementById("category-filter").value;

    let list = products;

    if (selected !== "all") {
        list = products.filter(p => p.category === selected);
    }

    renderFilteredProducts(list);
}



// ---------- MODAL LOGIC ----------

const modal = document.getElementById("modal");
const btnAdd = document.getElementById("add-product-btn");
const btnClose = document.getElementById("close-modal");

btnAdd.onclick = () => {
    modal.classList.remove("hidden");
};

btnClose.onclick = () => {
    modal.classList.add("hidden");
};

document.getElementById("save-product").onclick = () => {
    const name = document.getElementById("new-name").value.trim();
    const category = document.getElementById("new-category").value.trim();
    const stock = parseInt(document.getElementById("new-stock").value);
    const price = parseFloat(document.getElementById("new-price").value);

    if (!name || !category || isNaN(stock) || isNaN(price)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    const newProduct = {
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        name,
        category,
        stock,
        price
    };

    products.push(newProduct);

    loadProducts();
    updateCards();
    loadCategories();

    modal.classList.add("hidden");

    // limpiar inputs
    document.getElementById("new-name").value = "";
    document.getElementById("new-category").value = "";
    document.getElementById("new-stock").value = "";
    document.getElementById("new-price").value = "";
};

// ---------- EXPORTAR A PDF ----------
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Inventory & Sales Dashboard - Product List", 10, 15);

    // Fecha
    doc.setFontSize(11);
    doc.text("Generated: " + new Date().toLocaleString("en-US"), 10, 23);

    // Encabezados de tabla
    const headers = ["Name", "Category", "Stock", "Price"];

    let y = 35;

    doc.setFontSize(12);
    doc.text("Name", 10, y);
    doc.text("Category", 70, y);
    doc.text("Stock", 130, y);
    doc.text("Price", 160, y);

    y += 6;

    // Línea separadora
    doc.line(10, y, 200, y);
    y += 5;

    // Contenido de la tabla
    products.forEach(p => {
        doc.text(p.name, 10, y);
        doc.text(p.category, 70, y);
        doc.text(String(p.stock), 130, y);
        doc.text(formatMoney(p.price), 160, y);

        y += 7; // salto entre filas
    });

    doc.save("inventory_report.pdf");
}
// ---------- EXPORTAR A EXCEL ----------
function exportToExcel() {
    // Convertir los productos a un formato plano para Excel
    const data = products.map(p => ({
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

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    // Descargar archivo
    XLSX.writeFile(workbook, "inventory_report.xlsx");
}


// ---------- Inicializar Dashboard ----------

window.onload = () => {
    loadProducts();
    updateCards();
    loadCategories();

    document.getElementById("search-input").addEventListener("input", searchProducts);
    document.getElementById("category-filter").addEventListener("change", filterByCategory);
    document.getElementById("export-pdf-btn").addEventListener("click", exportToPDF);
    document.getElementById("export-excel-btn").addEventListener("click", exportToExcel);
};
