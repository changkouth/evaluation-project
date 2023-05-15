const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = () => {
    // define your method to get cart data
    return fetch(URL + "/cart").then((data) => data.json());
  };

  const getInventory = () => {
    // define your method to get inventory data
    return fetch(URL + "/inventory").then((data) => data.json());
  };

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(URL + "/cart", {
      method: "POST",
      body: JSON.stringify(inventoryItem),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((data) => data.json);
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
    return fetch(URL + "/cart" + "/" + id, {
      method: "PATCH",
      body: JSON.stringify(newAmount),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((data) => data.json());
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    return fetch(URL + "/cart" + "/" + id, {
      method: "DELETE",}).then((data) => data.json());
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();


const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange();
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const inventory = document.querySelector(".inventory-list");
  const cart = document.querySelector(".cart-list");
  const checkout = document.querySelector(".checkout-btn");
  const cartBtn = document.querySelector(".inventory-list");

  
  const renderInventory = (array) => {
    let itemTemp = "";
    array.forEach(item => {
      const content = item.content;
      const liElement = `<li cart-id="${item.id}">${content}<button class="sub-btn">-</button><span id="count">0</span><button class="add-btn" >+</button><button class="addto-cart">add to cart</button></li>`;
      itemTemp += liElement;
    });
    inventory.innerHTML = itemTemp;
  }

  const renderCart = (array) => {
    let itemTemp = "";
    array.forEach(item => {
      const content = item.content;
      const liElement = `<li cart-id="${item.id}">${content}<span><span> x </span id="cart-count">0</span> <button class="delete-btn">delete</button></li>`
      itemTemp += liElement;
    });
    cart.innerHTML = itemTemp;
  }

  return {
    inventory,
    cart,
    renderInventory,
    renderCart,
    cartBtn,
    checkout,
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {
    model.getInventory().then(data => {
      state.inventory = data;
    })
    model.getCart().then(data => {
      state.cart = data;
    })
  };

  const handleUpdateAmount = () => {

    view.inventory.addEventListener("click", (event)=> {
      let updateCount = event.target.parentNode.children["count"];
      const addButton = event.target.parentNode.children[2];
      const subButton = event.target.parentNode.children[0];
      var count = 0;
      var temp = updateCount.innerHTML;
      
      function increaseCount(temp) {
        count = temp;
        count++;
        updateCount.innerText = count;
      };

      function decreaseCount(temp) {
        count = temp;
        count--;
        updateCount.innerText = count;
      };

      if (event.target.className === 'add-btn') {
        addButton.addEventListener("click", increaseCount(temp));
      }

      if (event.target.className === 'sub-btn') {
        subButton.addEventListener("click", decreaseCount(temp));
      }

    });
  };

  const handleAddToCart = () => {
    view.cartBtn.addEventListener("click", (event) => {
      if (event.target.className === "addto-cart") {
        const id = event.target.parentNode.getAttribute("cart-id");
        let cartObj = {};
        state.inventory.forEach(item => {
          if (+id === item.id) {
            cartObj.content = item.content;
            cartObj = {
              content: item.content,
              id: +id
            }
          }
        });
        model.addToCart(cartObj).then((data) => {
          data = {
            content: cartObj.content,
            id: cartObj.id
          }
          state.cart = [data, ...state.cart];
        })
      }
    })
  };

  const handleDelete = () => {
    view.cart.addEventListener("click", (event) => {
      if (event.target.className !== "delete-btn") return;
      const id = event.target.parentNode.getAttribute("cart-id");
      model.deleteFromCart(id).then((data) => {
        state.cart = state.cart.filter((item) => item.id !== +id);
      });
    });
  };

  const handleCheckout = () => {
    view.checkout.addEventListener("click", (event) => {
      model.checkout();
      state.cart = [];
    })
  };

  const bootstrap = () => {
    handleUpdateAmount();
    handleAddToCart();
    handleDelete();
    handleCheckout();
    init();
    state.subscribe(() => {
      view.renderInventory(state.inventory);
      view.renderCart(state.cart);
    });
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();