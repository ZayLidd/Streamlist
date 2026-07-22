# Final Project Implementation Summary

## Optional Google OAuth

Google OAuth is available throughout the application but is no longer required. The public homepage offers both **Continue as Guest** and **Sign In with Google**. Guest users can access the complete application. The main navigation continues to show a Google sign in option until authentication succeeds.

A successful Google credential response creates a browser session and displays the user's name, email, and profile image. Signing out clears only the Google session and returns the application to guest mode.

## Guest access

Guest users can use:

* StreamList management
* TMDB movie search
* Subscriptions and merchandise
* Shopping cart
* Checkout
* Credit card entry and saved card management
* Order confirmation

Guest data is stored in the current browser. Because localStorage is browser specific, guest information can differ between Chrome, Edge, Firefox, different devices, or different site addresses.

## Credit card management

`CreditCardManager.jsx` provides cardholder name input, automatic four digit card number grouping, expiration validation, security code validation, billing ZIP validation, saved card selection, saved card deletion, and masked card display.

The security code is validated but never saved. Guest cards use a guest localStorage key. Signed in users use a separate key based on their Google user identifier.

## Checkout flow

The shopping cart includes a **Proceed to Checkout** button. The checkout component accepts either guest or signed in users. Completing an order clears the cart and displays the order number, amount, item count, and selected card's last four digits.

## Main files

* `src/App.jsx`
* `src/PublicHome.jsx`
* `src/LoginScreen.jsx`
* `src/CreditCardManager.jsx`
* `src/auth.js`
* `src/style.css`
* `.env.example`
