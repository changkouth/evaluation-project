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
  const listItem = document.querySelector(".inventory-list");

  // add more inventory
  const addInventory = document.querySelector(".add-btn");

  // reduce inventory
  const subInventory = document.querySelector(".sub-btn");

  const cartBtn = document.querySelector(".inventory-list");

  const getlistItem = () => listItem.value;

  const renderInventory = (array, count) => {
    let itemTemp = "";
    const arrContent = [];
    array.forEach(item => {
      arrContent.push(item.content);
      const liElement = `<li cart-id="${item.id}">${item.content}<button class="sub-btn">-</button><span>${count}</span><button class="add-btn" >+</button><button class="addto-cart">add to cart</button></li>`;
      itemTemp += liElement;
    });

    inventory.innerHTML = itemTemp;
  }

  return {
    inventory,
    getlistItem,
    renderInventory,
    addInventory,
    subInventory,
    cartBtn,
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {
    model.getInventory().then(data => {
      state.inventory = data;
    })
  };

  const handleUpdateAmount = () => {
    view.inventory.addEventListener("click", (event)=> {
      let count = 0;
      if (event.target.className === "add-btn") {
        console.log(event.target.className);
        count += 1;
        view.renderInventory(state.inventory, count);

      } else if (event.target.className === "sub-btn") {
        count -= 1;
        view.renderInventory(state.inventory, count);
      }
    });
    
  };

  const handleAddToCart = () => {
    view.cartBtn.addEventListener("click", () => {
      console.log("handleAddCart");
      const tempArr = state.inventory;
      const cartObj = {
        content: tempArr.content,
        id: tempArr.id
      };
      model.addToCart(cartObj).then((data) => {
        state.cart = [data, ...state.cart];
      });
    });

  };

  const handleDelete = () => {};

  const handleCheckout = () => {};
  const bootstrap = () => {
    init();
    state.subscribe(() => {
      view.renderInventory(state.inventory, 0);
    });
    handleUpdateAmount();
    handleAddToCart();

  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
