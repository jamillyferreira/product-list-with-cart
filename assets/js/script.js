let cartItems = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  document
    .querySelector(".cart__confirm-order")
    .addEventListener("click", confirmOrder);
});

const loadProducts = () => {
  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Não foi possivel carregar os dados");
      }
      return response.json();
    })
    .then((data) => {
      displayProducts(data);
    })
    .catch((error) => console.error("Error ao carregar os produtos:", error));
};

const displayProducts = (products) => {
  const cardContainer = document.querySelector(".card__container");
  cardContainer.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "card";

    const existingItem = cartItems.find((item) => item.name === product.name);
    const quantity = existingItem ? existingItem.quantity : 0;
    const imageClass = quantity ? "product__added" : "";

    let buttonHTML;
    if (quantity > 0) {
      buttonHTML = `
      <div class="card__add-btn card__quantity-control" data-product='${JSON.stringify(
        product
      )}'>
        <button class="decrease-btn">-</button>
        <span class="item-count">${quantity}</span>
        <button class="increase-btn">+</button>
      </div>
      `;
    } else {
      buttonHTML = `
      <button class="card__add-btn" data-product='${JSON.stringify(product)}'>
        <img src="assets/images/icon-add-to-cart.svg" alt="" />
        Add to Cart
      </button>
      `;
    }
    card.innerHTML = `
    <div class="card__image">
      <picture>
        <source media="(min-width: 1025px)" srcset="${product.image.desktop}"/>
        <source media="(min-width: 600px)" srcset="${product.image.tablet}"/>
        <img class="${imageClass}" src="${product.image.mobile}" 
        alt="${product.name}" />
      </picture>
     
    </div>
    <div class="card__content">
      <span class="card__category">${product.category}</span>
      <p class="card__name">${product.name}</p>
      <span class="card__price">R$${product.price.toFixed(2)}</span>
       ${buttonHTML}
    </div>
    `;
    cardContainer.appendChild(card);
  });

  addCartButtonListeners();
};

const addCartButtonListeners = () => {
  const addCartButtons = document.querySelectorAll(
    ".card__add-btn:not(.card__quantity-control)"
  );
  addCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const product = JSON.parse(this.getAttribute("data-product"));
      addToCart(product);
    });
  });

  const increaseButtons = document.querySelectorAll(".increase-btn");
  increaseButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const product = JSON.parse(
        this.closest(".card__quantity-control").getAttribute("data-product")
      );
      addToCart(product);
    });
  });

  const decreaseButtons = document.querySelectorAll(".decrease-btn");
  decreaseButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const product = JSON.parse(
        this.closest(".card__quantity-control").getAttribute("data-product")
      );
      decreaseQuantity(product);
    });
  });
};

const addToCart = (product) => {
  const existingItem = cartItems.find((item) => item.name === product.name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }
  updateCartDisplay();
  loadProducts();
};

const decreaseQuantity = (product) => {
  const existingItemIndex = cartItems.findIndex(
    (item) => item.name === product.name
  );
  if (existingItemIndex !== -1) {
    if (cartItems[existingItemIndex].quantity > 1) {
      cartItems[existingItemIndex].quantity -= 1;
    } else {
      cartItems.splice(existingItemIndex, 1);
    }
    updateCartDisplay();
    loadProducts();
  }
};

const updateCartDisplay = () => {
  const cartItemsContainer = document.querySelector(".cart__items");
  const cartCountSpan = document.querySelector(".cart h3 span");
  const cartTotalStrong = document.querySelector(".cart__total strong");
  const emptyCart = document.querySelector(".empty__cart");
  const cartTotalDiv = document.querySelector(".cart__total");

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.textContent = totalItems > 0 ? `(${totalItems})` : "()";

  if (totalItems > 0) {
    emptyCart.classList.add("hidden");
    cartTotalDiv.classList.remove("hidden");
  } else {
    emptyCart.classList.remove("hidden");
    cartTotalDiv.classList.add("hidden");
  }
  cartItemsContainer.innerHTML = "";
  let orderTotal = 0;

  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    orderTotal += itemTotal;

    const li = document.createElement("li");
    li.className = "cart__item";
    li.innerHTML = `
    <div class="cart__item-content">
      <p class="cart__item-name">${item.name}</p>
      <div class="cart__item-info">
        <span class="cart__item-quantity">${item.quantity}x</span>
        <span class="cart__item-price-unit">@ $${item.price.toFixed(2)}</span>
        <span class="cart__item-price-total">@ $${itemTotal.toFixed(2)}</span>
      </div>
    </div>
    <button class="cart__remove-item" data-index="${index}">
      <img src="assets/images/icon-remove-item.svg" alt="Remover item">
    </button>
    `;
    cartItemsContainer.appendChild(li);
  });

  cartTotalStrong.textContent = `$${orderTotal.toFixed(2)}`;
  addRemoveButtonListeneres();
};

const addRemoveButtonListeneres = () => {
  const removeButtons = document.querySelectorAll(".cart__remove-item");
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      removeFromCart(index);
    });
  });
};

const removeFromCart = (index) => {
  cartItems.splice(index, 1);
  updateCartDisplay();
  loadProducts();
};

const showOrderConfirmation = () => {
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalItemsContainer = document.querySelector(".modal__items");
  const modalTotal = document.querySelector(".modal__total strong");

  modalItemsContainer.innerHTML = "";

  cartItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "modal__item";
    itemElement.innerHTML = `
    <div class="modal__item-content">
      <img class="modal__item-image" src="${item.image.thumbnail}" alt="${
      item.name
    }" />
      <div class="modal__item-info">
        <p class="modal__item-name">${item.name}</p>
        <div class="modal__info-quantity-price">
          <small class="modal__item-quantity">
          ${item.quantity}x</small>
          <small class="modal__item-price"> @
          $${item.price.toFixed(2)}</small>
        </div>
      </div>
    </div>
    <span>$${(item.price * item.quantity).toFixed(2)}</span>
    `;
    modalItemsContainer.appendChild(itemElement);
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  modalTotal.textContent = `$${total.toFixed(2)}`;

  modalOverlay.classList.remove("hidden");
  setTimeout(() => modalOverlay.classList.add("visible"), 10);
};

const closeOrderConfirmation = () => {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay.classList.remove("visible");
  setTimeout(() => {
    modalOverlay.classList.add("hidden");
    cartItems = [];
    updateCartDisplay();
    loadProducts();
  }, 300);
};

const confirmOrder = () => {
  showOrderConfirmation();
};
document
  .querySelector(".modal__close")
  .addEventListener("click", closeOrderConfirmation);
