import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
const BASE_URL = "http://localhost:1337/Product/";
let AppComponent = class AppComponent {
    // Since we are using a provider above we can receive
    // an instance through a constructor.
    constructor(http) {
        this.http = http;
        this._orderedItems = [];
        this._editableProductName = "";
        this._errorMessage = "";
        this._editId = null;
        this._singleProductNumber = null;
        this._singleProductName = "";
        this._singleProductPrice = 0;
        this._singleProductQty = 0;
        this._tax = 0.0;
        this._subtotal = 0.0;
        this._finaltotal = 0.0;
        this._http = http;
        this.getAllProducts();
    }
    getAllProducts() {
        let url = BASE_URL + 'Index';
        this._http.get(url)
            // Get data and wait for result.
            .subscribe(result => {
            this._productsArray = result.products;
        }, error => {
            // Let user know about the error.
            this._errorMessage = error;
        });
    }
    getProduct(id) {
        let url = BASE_URL + 'Detail?_id=' + id;
        this._http.get(url)
            // Get data and wait for result.
            .subscribe(result => {
            this._singleProductName = result.product.productName;
            this._singleProductNumber = result.product._id;
            this._singleProductPrice = result.product.price;
        }, error => {
            // Let user know about the error.
            this._errorMessage = error;
        });
    }
    sum() {
        this._subtotal = 0;
        this._tax = 0;
        this._finaltotal = 0;
        this._orderedItems.forEach(item => {
            this._subtotal += item.price * item.qty;
        });
        this._tax = 0.07 * this._subtotal;
        this._finaltotal = this._subtotal + this._tax;
    }
    getItem(name) {
        this._orderedItems.forEach(item => {
            if (item.name = name) {
                this._singleProductName = item.name;
                this._singleProductPrice = item.price;
                this._singleProductQty = item.qty;
            }
        });
    }
    addItem() {
        if (this.isDuplicated(this._singleProductName)) {
            this.updateItem(this._singleProductName, this._editableProductQty);
        }
        else {
            let newItem = {
                'name': this._singleProductName,
                'price': this._singleProductPrice,
                'qty': this._editableProductQty
            };
            this._orderedItems.push(newItem);
        }
        this.sum();
    }
    removeItem(name) {
        for (var i = 0; i < this._orderedItems.length; i++) {
            if (this._orderedItems[i].name == name) {
                this._orderedItems.splice(i, 1);
            }
        }
        this.sum();
    }
    isDuplicated(name) {
        this._orderedItems.forEach(item => {
            if (item.name == name) {
                return true;
            }
        });
        return false;
    }
    updateItem(name, qty) {
        this._orderedItems.forEach(item => {
            if (item.name == name) {
                item.qty = qty;
            }
        });
    }
};
AppComponent = tslib_1.__decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html'
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map