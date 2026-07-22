# StreamList Final Project

StreamList is a React and Vite application for managing a watch list, searching TMDB, purchasing streaming subscriptions and accessories, and completing a classroom demonstration checkout.

## Final project features

* Complete guest access without Google authentication
* Optional Google Identity Services sign in through `@react-oauth/google`
* Google profile display and sign out controls
* Persistent StreamList and shopping cart data
* Checkout button after the shopping cart summary
* Credit card management component
* Card number formatting as `1234 5678 9012 3456`
* Guest card records saved to browser localStorage
* Separate saved card records for each signed in Google user
* Security code validation without saving the security code
* Saved card selection and deletion
* Classroom demonstration order confirmation

## Install and run

1. Install dependencies.

```bash
npm install
```

2. Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Add your Google Web Client ID to `.env`.

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com
```

Google sign in is optional. The entire app still works when a client ID is not configured.

4. Add your TMDB API key if you do not want to use the existing classroom key.

```env
VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
```

5. Start the development server.

```bash
npm run dev
```

## Authentication behavior

The application opens on a public landing page. Visitors can select **Continue as Guest** and use every feature, including the StreamList, movie search, subscriptions, cart, checkout, and credit card management.

Google sign in remains available from the homepage, login page, and main navigation. Signed in users see their Google profile. Signing out does not lock the application, it returns the user to guest mode.

Guest card records are saved under a guest localStorage key. Each Google user receives a separate saved card key based on the Google profile identifier. The general watchlist and cart remain stored in the browser.

## Google OAuth configuration

Create an OAuth 2.0 Client ID with application type **Web application** in Google Cloud Console. Add the development address shown by Vite, normally `http://localhost:5173`, to **Authorized JavaScript origins**. Add the deployed site origin before publishing.

The app uses Google Identity Services for the sign in interaction. For this frontend only classroom project, the returned profile establishes a browser session. A production system should send the Google ID token to a backend and verify its signature, audience, issuer, and expiration before creating an application session.

## Credit card security note

The assignment specifically requires saving card information to localStorage. This implementation therefore stores the cardholder name, formatted card number, expiration date, and billing ZIP code in the browser. The security code is never stored. Real payment applications should not store raw card data in localStorage and should use a PCI compliant payment service.

## Validation commands

```bash
npm run lint
npm run build
```
