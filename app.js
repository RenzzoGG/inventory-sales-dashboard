// ---------- MOCK DATA (Datos de ejemplo) ----------

const products = [
    { name: "Laptop Lenovo ThinkPad", category: "Electronics", stock: 8, price: 14999 },
    { name: "Mouse Logitech G203", category: "Accessories", stock: 35, price: 499 },
    { name: "Monitor Samsung 24''", category: "Electronics", stock: 5, price: 2899 },
    { name: "Teclado Redragon K552", category: "Accessories", stock: 15, price: 899 },
    { name: "Silla Gamer Razer", category: "Furniture", stock: 2, price: 3999 },
    { name: "iPhone 14", category: "Electronics", stock: 10, price: 18999 }
];


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
            <td>$${product.price}</td>
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
            <td>$${product.price}</td>
        `;
        tableBody.appendChild(row);
    });
}


// ---------- Actualizar cards ----------

function updateCards() {
    // Total de productos (cantidad de items en inventario)
    document.getElementById("total-products").textContent = products.length;

    // Total de ventas (por ahora 0 hasta agregar módulo de ventas)
    document.getElementById("total-sales").textContent = "$0";

    // Productos con poco stock (menos de 5)
    const lowStockCount = products.filter(p => p.stock < 5).length;
    document.getElementById("low-stock").textContent = lowStockCount;

    // Revenue mensual simulado (sumatoria)
    const revenue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    document.getElementById("monthly-revenue").textContent = "$" + revenue.toLocaleString();
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
    doc.text("Generated: " + new Date().toLocaleString(), 10, 23);

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
        doc.text("$" + p.price, 160, y);

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
