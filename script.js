document.addEventListener("DOMContentLoaded", () => {
  // --- 1. State Variables ---
  let allProducts = []; // Will be populated from APIs
  let cart = []; // Stores objects like { id: "F-1", quantity: 2 }
  let currentCategory = "All";
  let currentSort = "default";
  let currentMinPrice = "";
  let currentMaxPrice = "";

  // --- 2. DOM Elements ---
  const productGrid = document.getElementById("productGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const categoryList = document.getElementById("categoryList");
  const cartCount = document.getElementById("cartCount");
  const cartBody = document.getElementById("cartBody");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartTotals = document.getElementById("cartTotals");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartDiscount = document.getElementById("cartDiscount");
  const cartTotal = document.getElementById("cartTotal");
  const discountNote = document.getElementById("discountNote");
  const checkoutForm = document.getElementById("checkoutForm");
  const receiptDetails = document.getElementById("receiptDetails");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const sortDropdown = document.getElementById("sortDropdown");
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");

  // --- 3. Bootstrap Modals/Offcanvas ---
  const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
  const receiptModal = new bootstrap.Modal(document.getElementById("receiptModal"));

  // --- 4. NEW: Fetch Products from MULTIPLE APIs ---
  async function fetchProducts() {
    showLoading(true);
    try {
      // Create fetch promises for both APIs
      const fakeStorePromise = fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(data => data.map(product => ({
          id: `F-${product.id}`, // Add 'F-' prefix for unique ID
          name: product.title,
          price: product.price,
          category: product.category,
          image: product.image,
          description: product.description
        })));

      const dummyJsonPromise = fetch('https://dummyjson.com/products?limit=30')
        .then(res => res.json())
        .then(data => data.products.map(product => ({
          id: `D-${product.id}`, // Add 'D-' prefix for unique ID
          name: product.title,
          price: product.price,
          category: product.category,
          image: product.thumbnail, // 'dummyjson' uses 'thumbnail'
          description: product.description
        })));

      // Wait for both promises to resolve
      const [fakeStoreProducts, dummyJsonProducts] = await Promise.all([
        fakeStorePromise,
        dummyJsonPromise
      ]);

      // Combine the arrays
      allProducts = [...fakeStoreProducts, ...dummyJsonProducts];
      
      renderCategories();
      renderProducts();
    } catch (error) {
      productGrid.innerHTML = `<div class="col-12"><h3 class="text-center text-danger mt-5">Failed to load products. Please try again later.</h3></div>`;
      console.error("Error fetching products:", error);
    } finally {
      showLoading(false);
    }
  }
  
  function showLoading(isLoading) {
    if (isLoading) {
      loadingSpinner.classList.remove("d-none");
      productGrid.classList.add("d-none");
    } else {
      loadingSpinner.classList.add("d-none");
      productGrid.classList.remove("d-none");
    }
  }

  // --- 5. Render Products ---
  function renderProducts() {
    let filteredProducts = [...allProducts];

    // Filter by Category
    if (currentCategory !== "All") {
      filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    // Filter by Price Range
    const minPrice = parseFloat(currentMinPrice);
    const maxPrice = parseFloat(currentMaxPrice);
    if (!isNaN(minPrice)) {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    // Sort
    switch (currentSort) {
      case "alpha-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alpha-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        // Default sort (by original fetched order)
        break;
    }

    // Display
    productGrid.innerHTML = ""; // Clear grid
    if (filteredProducts.length === 0) {
      productGrid.innerHTML = `<div class="col-12"><h3 class="text-center text-muted mt-5">No products found matching your criteria.</h3></div>`;
      return;
    }

    filteredProducts.forEach(product => {
      // Use quotes around the string ID in the onclick function
      const card = `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card h-100">
            <img src="${product.image}" class="card-img-top" alt="${product.name}" />
            <div class="card-body">
              <h5 class="card-title" title="${product.name}">${product.name}</h5>
              <p class="card-text text-light">$${product.price.toFixed(2)}</p>
              <p class="badge bg-secondary mb-2">${product.category}</p>
              <button class="btn btn-warning" onclick="addToCart('${product.id}')">
                <i class="bi bi-cart-plus-fill"></i> Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
      productGrid.innerHTML += card;
    });
  }

  // --- 6. Render Categories ---
  function renderCategories() {
    // Use Set to get unique categories, then sort them
    const categories = ["All", ...[...new Set(allProducts.map(p => p.category))].sort()];
    categoryList.innerHTML = categories
      .map(cat => `<li><a class="dropdown-item" href="#" data-category="${cat}">${cat}</a></li>`)
      .join('');
  }

  // --- 7. Cart Functions ---
  // All IDs are now strings (e.g., "F-1", "D-15"), so '===' works perfectly.
  window.addToCart = (id) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ id: id, quantity: 1 });
    }
    updateCart();
  };

  window.updateQuantity = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
      }
    }
    updateCart();
  };

  window.removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCart();
  };

  function updateCart() {
    renderCartItems();
    updateCartTotals();
    updateCartUIState();
  }

  function renderCartItems() {
    if (cart.length === 0) {
      cartBody.innerHTML = "";
      return;
    }

    cartBody.innerHTML = cart.map(item => {
      const product = allProducts.find(p => p.id === item.id);
      if (!product) return ''; // Failsafe if product not found
      return `
        <div class="d-flex align-items-center justify-content-between p-2 mb-2 rounded cart-item">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img me-2">
          <div class="flex-grow-1" style="min-width: 0;"> <div class="fw-bold text-truncate" title="${product.name}">${product.name}</div>
            <div class="text-muted">$${product.price.toFixed(2)}</div>
          </div>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-warning" onclick="updateQuantity('${item.id}', -1)"><i class="bi bi-dash"></i></button>
            <span class="mx-2">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-warning" onclick="updateQuantity('${item.id}', 1)"><i class="bi bi-plus"></i></button>
          </div>
          <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart('${item.id}')"><i class="bi bi-trash-fill"></i></button>
        </div>
      `;
    }).join('');
  }

  function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => {
      const product = allProducts.find(p => p.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const discountRate = 0.05; // 5%
    const discountThreshold = 200;
    let discount = 0;

    if (subtotal > discountThreshold) {
      discount = subtotal * discountRate;
      discountNote.innerHTML = `<i class="bi bi-check-circle-fill"></i> 5% discount applied!`;
      discountNote.classList.add('text-success');
    } else {
      discountNote.innerHTML = `<i class="bi bi-tag-fill text-warning"></i> Spend over $${discountThreshold} to get a 5% discount!`;
      discountNote.classList.remove('text-success');
    }

    const total = subtotal - discount;
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartDiscount.textContent = `-$${discount.toFixed(2)}`;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    cartCount.textContent = totalQuantity;
  }

  function updateCartUIState() {
    if (cart.length === 0) {
      cartEmpty.classList.remove("d-none");
      cartTotals.classList.add("d-none");
    } else {
      cartEmpty.classList.add("d-none");
      cartTotals.classList.remove("d-none");
    }
  }

  // --- 8. Checkout and Receipt ---
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      card: document.getElementById("cardNumber").value.slice(-4),
      address: document.getElementById("address").value,
    };
    renderReceipt(formData);
    checkoutModal.hide();
    receiptModal.show();
    cart = [];
    updateCart();
    checkoutForm.reset();
  });

  function renderReceipt(formData) {
    const subtotal = parseFloat(cartSubtotal.textContent.replace("$", ""));
    const discount = parseFloat(cartDiscount.textContent.replace("-$", ""));
    const total = parseFloat(cartTotal.textContent.replace("$", ""));
    const orderId = Math.floor(Math.random() * 900000) + 100000;

    const itemsHeaderHTML = `
      <div class="receipt-item-header">
        <span class="item-name">Item</span>
        <span class="item-qty">Qty</span>
        <span class="item-total">Total</span>
      </div>`;

    const itemsHTML = cart.map(item => {
      const product = allProducts.find(p => p.id === item.id);
      return `
        <div class="receipt-item">
          <span class="item-name">${product.name}</span>
          <span class="item-qty">x${item.quantity}</span>
          <span class="item-total">$${(product.price * item.quantity).toFixed(2)}</span>
        </div>`;
    }).join('');

    receiptDetails.innerHTML = `
      <div class="receipt-header">
        <h3>Thank You For Your Order!</h3>
        <div>Order #${orderId}</div>
      </div>
      <div class="receipt-section-title">Customer Details</div>
      <div class="receipt-customer-details">
        <p><strong>Full Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Shipping To:</strong> ${formData.address}</p>
        <p><strong>Paid With:</strong> Card ending in **** ${formData.card}</p>
      </div>
      <div class="receipt-section-title">Order Summary</div>
      <div class="receipt-items-list">
        ${itemsHeaderHTML}
        ${itemsHTML}
      </div>
      <div class="receipt-summary">
        <div class="receipt-summary-line">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="receipt-summary-line discount">
          <span>Discount:</span>
          <span>-$${discount.toFixed(2)}</span>
        </div>
        <div class="receipt-final-total">
          <span>Total Paid:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  // --- 9. Event Listeners ---
  // Category Filter
  categoryList.addEventListener("click", (e) => {
    if (e.target.matches("a.dropdown-item")) {
      e.preventDefault();
      currentCategory = e.target.dataset.category;
      categoryDropdown.textContent = currentCategory;
      renderProducts();
    }
  });

  // Sort Filter
  document.getElementById("sortList").addEventListener("click", (e) => {
    if (e.target.matches("a.dropdown-item")) {
      e.preventDefault();
      currentSort = e.target.dataset.sort;
      sortDropdown.textContent = e.target.textContent;
      renderProducts();
    }
  });

  // Price Range Filter
  document.getElementById("priceFilterBtn").addEventListener("click", () => {
    currentMinPrice = minPriceInput.value;
    currentMaxPrice = maxPriceInput.value;
    renderProducts();
  });
  
  // Clear Filters
  document.getElementById("clearFiltersBtn").addEventListener("click", () => {
    currentCategory = "All";
    currentSort = "default";
    currentMinPrice = "";
    currentMaxPrice = "";
    
    // Reset UI
    categoryDropdown.textContent = "Category";
    sortDropdown.textContent = "Sort By";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    
    renderProducts();
  });

  // **NEW: Save Receipt Button Listener**
  document.getElementById("saveReceiptBtn").addEventListener("click", () => {
    const saveBtn = document.getElementById("saveReceiptBtn");
    const receiptElement = document.getElementById("receiptDetails");
    
    // Disable button and show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

    // Use html2canvas
    html2canvas(receiptElement, { 
        useCORS: true, // Needed for cross-domain images from the APIs
        backgroundColor: '#212529' // Set a background color (matches receipt)
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'Mini Store.png';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-download"></i> Save Receipt';
        
    }).catch(err => {
        // Handle errors
        console.error("Error saving receipt:", err);
        alert("Sorry, there was an error saving your receipt.");
        // Reset button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-download"></i> Save Receipt';
    });
  });

  // --- 10. Initial Page Load ---
  fetchProducts(); // Start the app by fetching products
  updateCartUIState();
});