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
    #countInventory;
    
    constructor() {
      this.#inventory = [];
      this.#cart = [];
      this.#countInventory = 0;
    }

    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    get countInventory() {
      return this.#countInventory;
    }

    set countInventory(newCountInventory) {
      this.#countInventory = newCountInventory;
      this.#onChange();
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

  // render inventory 
  const renderInventory = (array, itemQuantity) => {
    let inventoryItems = "";
    if (itemQuantity === 0) {
      array.forEach(item => {
        let {id, content} = item;
        const liElement = (`<li cart-id="${id}">${content}
                              <button class="sub-btn">-</button>
                              <span id="count">${itemQuantity}</span>
                              <button class="add-btn" >+</button>
                              <button id=${id} class="addto-cart">add to cart</button>
                            </li>`);
        inventoryItems += liElement;
      });
      inventory.innerHTML = inventoryItems;
    } 
  }

  // render shopping cart
  const renderCart = (array) => {
    let itemTemp = "";
    array.forEach(item => {
      let {content, id, quantity} = item;
      const liElement = (`<li cart-id="${id}">${content}
                            <span> x </span>
                            <span >${quantity}</span> 
                            <button class="delete-btn">delete</button>
                          </li>`);
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
    });
    model.getCart().then(data => {
      state.cart = data;
    });
  };

  const handleUpdateAmount = () => {
    view.inventory.addEventListener("click", (event) => {
      const addButton = event.target.parentNode.children[2];
      const subButton = event.target.parentNode.children[0];
      var count = 0;
      let updateCount = event.target.parentNode.children["count"];
      var temp = updateCount.innerHTML;

      function increaseCount(temp) {
        count = temp;
        count++;
        updateCount.innerText = count; 
      }
      function decreaseCount(temp) {
        count = temp;
        count--;
        updateCount.innerText = count; 
      }

      if (event.target.className === 'add-btn') { addButton.addEventListener("click", increaseCount(temp)); }
      if (event.target.className === 'sub-btn') { subButton.addEventListener("click", decreaseCount(temp)); }
      if (event.target.className === "addto-cart") { state.countInventory = updateCount.innerText; }

    });
  };

  const handleAddToCart = () => {
    view.cartBtn.addEventListener("click", (event) => {
      if (event.target.className === "addto-cart") {
        const selectedID = event.target.parentNode.getAttribute("cart-id");
        let updateCount = event.target.parentNode.children["count"];
        let cartObj = {};

        if (state.cart.length === 0) {
          state.inventory.forEach(item => {
            if (+selectedID === item.id) {
              cartObj = {
                content: item.content,
                id: +selectedID,
                quantity: (+updateCount.innerText)
              }
            }
          });   
          model.addToCart(cartObj).then((data) => {
            data = {
              content: cartObj.content,
              id: cartObj.id,
              quantity: cartObj.quantity
            }
            state.cart = [data, ...state.cart]; 
          });
  
        } else {
          state.inventory.forEach(item => {
            if (+selectedID === item.id) {
              cartObj = {
                content: item.content,
                id: +selectedID,
                quantity: (+updateCount.innerText)
              }
            }
          });
          state.cart.forEach(item => {
            if (+selectedID != item.id && state.cart.length !== state.inventory.length) {
              model.addToCart(cartObj).then((data) => {
                data = {
                  content: cartObj.content,
                  id: cartObj.id,
                  quantity: cartObj.quantity
                }
                state.cart = [data, ...state.cart];
              });
            } else if (+selectedID === item.id && state.cart.length !== state.inventory.length) {
        
              let tmp = (+updateCount.innerText + item.quantity);
              if (+selectedID === cartObj.id) {
                cartObj = {
                  content: item.content,
                  id: item.id,
                  quantity: tmp
                }
              }
              model.updateCart(+selectedID, cartObj).then((data) => {
                data = {
                  content: cartObj.content,
                  id: cartObj.id,
                  quantity: tmp
                }
                state.cart = [data];
              });          
            }
          });
        }

        if (state.cart.length === state.inventory.length) {  
          state.cart.forEach(item => {
            if (+selectedID === item.id) {
              let tmp = +updateCount.innerText + item.quantity;
              cartObj = {
                content: item.content,
                id: item.id,
                quantity: tmp
              }
              model.updateCart(+selectedID, cartObj).then((data) => {
                data = {
                  content: cartObj.content,
                  id: cartObj.id,
                  quantity: cartObj.quantity
                }
                let cartItems = state.cart.map(x => (x.id === data.id) ? data : x);  
                state.cart = [...cartItems];
              });          
            }
          });
        }
      }
   });
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
    init();
    handleUpdateAmount();
    handleAddToCart();
    handleDelete();
    handleCheckout();
  
    state.subscribe(() => {
      view.renderInventory(state.inventory, state.countInventory);
      view.renderCart(state.cart);
    });
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();