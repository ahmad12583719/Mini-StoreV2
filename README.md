# Mini Store 🛒

This is a fully interactive, front-end mini e-commerce store built from scratch. It features product filtering, a dynamic shopping cart, a checkout process, and the ability to save your receipt as an image. The project is built using vanilla HTML, CSS, and JavaScript, with Bootstrap for styling and external APIs for product data.

✨ Features

* **Product Catalog:** Dynamically loads over 50 products from multiple external APIs on page load.
* **Loading State:** Displays a spinner while products are being fetched.
* **Advanced Filtering:**
    * Filter by **Category** (e.g., "electronics", "skincare", "laptops").
    * Filter by **Price Range** (Min & Max).
    * **Clear Filters** button to reset the view.
* **Sorting:**
    * Alphabetically (A-Z, Z-A)
    * By Price (Low-High, High-Low)
* **Dynamic Cart:**
    * Add items to a side-panel cart (Bootstrap Offcanvas).
    * Update item quantities (increase, decrease) or remove items.
    * Live-updating cart count in the navbar.
* **Discount Logic:**
    * Automatically applies a **5% discount** if the cart subtotal exceeds $200.
    * Displays a note about the discount, which turns green when applied.
* **Checkout Process:**
    * A checkout modal (Bootstrap Modal) opens to collect user and payment details.
    * Form validation for required fields.
* **Receipt Generation:**
    * After "checkout," a clean, attractive receipt is generated in a new modal.
    * Displays all items, quantities, subtotal, discount (if any), and the final total paid.
* **Save Receipt:**
    * A "Save Receipt" button in the receipt modal uses the `html2canvas` library to capture the receipt as a **PNG image** and download it.

## 💻 Technologies Used

* **HTML5:** For the core structure and markup.
* **CSS3:** For custom styling, theme (dark/orange), and card symmetry.
* **JavaScript (ES6+):** For all interactivity, including:
    * `fetch` API (async/await) to get product data.
    * DOM manipulation.
    * State management (filters, cart).
    * All filtering, sorting, and discount logic.
* **Bootstrap 5:** For the responsive grid, components (Navbar, Modals, Offcanvas), and utility classes.
* **Bootstrap Icons:** For UI icons.
* **html2canvas:** A JavaScript library to capture the receipt HTML and save it as an image.

## 🚀 How to Run

This is a purely front-end project and requires no server.

1.  Ensure all three files (`index.html`, `style.css`, `script.js`) are in the same folder.
2.  Simply **open the `index.html` file** in any modern web browser (like Chrome, Firefox, or Edge).
3.  The page will show a "Loading..." spinner and then fetch and display the products.

**Note:** An active internet connection is required to fetch product data from the APIs.

## 📂 File Structure
/Mini Store │ 
├── 📄 index.html (The main HTML structure) 
├── 📄 style.css (All custom styling and theme) 
└── 📄 script.js (All application logic and interactivity)

## 🌐 APIs Used

This project pulls its product data from two free-to-use public APIs:
* [**Fake Store API**](https://fakestoreapi.com/)
* [**DummyJSON**](https://dummyjson.com/products)
