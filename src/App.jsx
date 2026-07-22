import { useEffect, useMemo, useState } from "react";
import CreditCardManager from "./CreditCardManager.jsx";
import LoginScreen from "./LoginScreen.jsx";
import PublicHome from "./PublicHome.jsx";
import products from "./Data.js";
import {
  clearSessionUser,
  createSessionUser,
  loadSessionUser,
  saveSessionUser,
} from "./auth.js";
import "./style.css";

const STORAGE_KEY = "streamlist";
const CART_KEY = "streamlistCart";
const CARD_KEY = "streamlistCards";
const GUEST_USER_ID = "guest";
const API_KEY =
  import.meta.env.VITE_TMDB_API_KEY || "74e1f2819d0f9641c8f540c73eab0f49";

function loadJson(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch (error) {
    console.error(`Could not load ${key}:`, error);
    return fallback;
  }
}

function getCardStorageKey(userId) {
  return `${CARD_KEY}:${userId}`;
}

function App({ googleClientIdConfigured = true }) {
  const [user, setUser] = useState(() => loadSessionUser());
  const [loginError, setLoginError] = useState("");
  const [page, setPage] = useState(() =>
    loadSessionUser() ? "streamlist" : "home"
  );
  const [movieName, setMovieName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [warning, setWarning] = useState("");
  const [movieMessage, setMovieMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const [movies, setMovies] = useState(() => loadJson(STORAGE_KEY, []));
  const [cart, setCart] = useState(() => loadJson(CART_KEY, []));
  const [cards, setCards] = useState(() => {
    const savedUser = loadSessionUser();
    return loadJson(getCardStorageKey(savedUser?.id || GUEST_USER_ID), []);
  });
  const [selectedCardId, setSelectedCardId] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const cardOwnerId = user?.id || GUEST_USER_ID;
    localStorage.setItem(getCardStorageKey(cardOwnerId), JSON.stringify(cards));
  }, [cards, user]);

  useEffect(() => {
    if (cards.length === 0) {
      setSelectedCardId("");
      return;
    }

    const selectedCardStillExists = cards.some(
      (card) => card.id === selectedCardId
    );

    if (!selectedCardStillExists) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      setLoginError("Google sign in was not completed. Please try again.");
      return;
    }

    try {
      const authenticatedUser = createSessionUser(credentialResponse.credential);
      saveSessionUser(authenticatedUser);
      setUser(authenticatedUser);
      setCards(loadJson(getCardStorageKey(authenticatedUser.id), []));
      setLoginError("");
      setPage("streamlist");
    } catch (error) {
      console.error("Google sign in error:", error);
      setLoginError("Google sign in could not be verified in the application.");
    }
  }

  function signOut() {
    clearSessionUser();
    window.google?.accounts?.id?.disableAutoSelect();
    setUser(null);
    setCards(loadJson(getCardStorageKey(GUEST_USER_ID), []));
    setSelectedCardId("");
    setPage("streamlist");
    setWarning("");
    setMovieMessage("");
    setOrderDetails(null);
  }

  function changePage(newPage) {
    setPage(newPage);
    setWarning("");
    setMovieMessage("");
  }

  function addMovie(event) {
    event.preventDefault();

    if (movieName.trim() === "") {
      return;
    }

    const newMovie = {
      id: Date.now(),
      name: movieName.trim(),
      completed: false,
      poster: null,
    };

    setMovies((currentMovies) => [...currentMovies, newMovie]);
    setMovieName("");
  }

  async function searchMovies(event) {
    event.preventDefault();

    if (searchText.trim() === "") {
      return;
    }

    setLoading(true);
    setMovieMessage("");

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          searchText
        )}`
      );

      if (!response.ok) {
        throw new Error("Movie search failed");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Movie search error:", error);
      setMovieMessage("Could not search for movies. Check your TMDB API key.");
    } finally {
      setLoading(false);
    }
  }

  function addSearchMovie(movie) {
    const movieExists = movies.some((item) => item.tmdbId === movie.id);

    if (movieExists) {
      setMovieMessage(`${movie.title} is already in your StreamList.`);
      return;
    }

    const newMovie = {
      id: Date.now(),
      tmdbId: movie.id,
      name: movie.title,
      completed: false,
      poster: movie.poster_path,
    };

    setMovies((currentMovies) => [...currentMovies, newMovie]);
    setMovieMessage(`${movie.title} was added to your StreamList.`);
  }

  function deleteMovie(id) {
    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== id)
    );
  }

  function completeMovie(id) {
    setMovies((currentMovies) =>
      currentMovies.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              completed: !movie.completed,
            }
          : movie
      )
    );
  }

  function editMovie(id) {
    const movie = movies.find((item) => item.id === id);

    if (!movie) {
      return;
    }

    const updatedName = window.prompt(
      "Enter a new movie or show name:",
      movie.name
    );

    if (updatedName?.trim()) {
      setMovies((currentMovies) =>
        currentMovies.map((item) =>
          item.id === id ? { ...item, name: updatedName.trim() } : item
        )
      );
    }
  }

  function addToCart(product) {
    const itemInCart = cart.find((item) => item.id === product.id);

    if (product.type === "subscription" && itemInCart) {
      setWarning(`${product.name} is already in your cart.`);
      return;
    }

    setWarning("");

    if (itemInCart) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      return;
    }

    setCart((currentCart) => [...currentCart, { ...product, quantity: 1 }]);
  }

  function removeItem(id) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
    setWarning("");
  }

  function increaseQuantity(id) {
    const selectedItem = cart.find((item) => item.id === id);

    if (!selectedItem) {
      return;
    }

    if (selectedItem.type === "subscription") {
      setWarning("Only one of each subscription can be added.");
      return;
    }

    setWarning("");
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id) {
    setWarning("");
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function saveCard(card) {
    setCards((currentCards) => {
      const matchingCard = currentCards.find(
        (savedCard) => savedCard.cardNumber === card.cardNumber
      );

      if (matchingCard) {
        setSelectedCardId(matchingCard.id);
        return currentCards.map((savedCard) =>
          savedCard.id === matchingCard.id
            ? { ...card, id: matchingCard.id }
            : savedCard
        );
      }

      setSelectedCardId(card.id);
      return [...currentCards, card];
    });
  }

  function deleteCard(id) {
    setCards((currentCards) => currentCards.filter((card) => card.id !== id));
  }

  function completeOrder() {
    const selectedCard = cards.find((card) => card.id === selectedCardId);

    if (!selectedCard || cart.length === 0) {
      return;
    }

    const orderNumber = `SL${Date.now().toString().slice(-8)}`;
    const lastFour = selectedCard.cardNumber.replace(/\D/g, "").slice(-4);

    setOrderDetails({
      orderNumber,
      total: cartTotal,
      lastFour,
      itemCount: cartCount,
    });
    setCart([]);
    setPage("confirmation");
  }

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  if (page === "login") {
    return (
      <LoginScreen
        googleClientIdConfigured={googleClientIdConfigured}
        onGoogleSuccess={handleGoogleSuccess}
        errorMessage={loginError}
        onBackHome={() => {
          setLoginError("");
          setPage("home");
        }}
        onContinueAsGuest={() => {
          setLoginError("");
          setPage("streamlist");
        }}
      />
    );
  }

  if (page === "home") {
    return (
      <PublicHome
        onSignIn={() => setPage("login")}
        onContinueAsGuest={() => setPage("streamlist")}
      />
    );
  }

  return (
    <div className="app-shell">
      <nav className="main-nav" aria-label="Main navigation">
        <button
          className="brand-button"
          type="button"
          onClick={() => changePage("streamlist")}
        >
          StreamList
        </button>

        <div className="nav-links">
          <button type="button" onClick={() => changePage("streamlist")}>
            StreamList
          </button>
          <button type="button" onClick={() => changePage("movies")}>
            Movies
          </button>
          <button type="button" onClick={() => changePage("subscriptions")}>
            Subscriptions
          </button>
          <button type="button" onClick={() => changePage("cart")}>
            Cart ({cartCount})
          </button>
          <button type="button" onClick={() => changePage("about")}>
            About
          </button>
        </div>

        <div className="account-menu">
          {user ? (
            <>
              {user.picture && (
                <img className="account-avatar" src={user.picture} alt="" />
              )}
              <div className="account-copy">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button className="sign-out-button" type="button" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="account-copy">
                <strong>Guest User</strong>
                <span>Data saved in this browser</span>
              </div>
              <button
                className="sign-out-button"
                type="button"
                onClick={() => changePage("login")}
              >
                Sign In with Google
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="page-container">
        {page === "streamlist" && (
          <section>
            <p className="eyebrow">Personal watch queue</p>
            <h1>My StreamList</h1>
            <p>Add movies and shows that you want to watch.</p>

            <form className="inline-form" onSubmit={addMovie}>
              <input
                type="text"
                placeholder="Enter a movie or show"
                value={movieName}
                onChange={(event) => setMovieName(event.target.value)}
              />
              <button className="primary-button" type="submit">
                Add to StreamList
              </button>
            </form>

            <div className="movie-container">
              {movies.length === 0 ? (
                <div className="empty-state">
                  <h2>Your StreamList is empty</h2>
                  <p>Add a title manually or search the movie catalog.</p>
                </div>
              ) : (
                movies.map((movie) => (
                  <article className="movie-card" key={movie.id}>
                    <div className="saved-movie-info">
                      {movie.poster && (
                        <img
                          className="saved-poster"
                          src={`https://image.tmdb.org/t/p/w200${movie.poster}`}
                          alt={movie.name}
                        />
                      )}
                      <h3 className={movie.completed ? "completed" : ""}>
                        {movie.name}
                      </h3>
                    </div>

                    <div className="movie-buttons">
                      <button type="button" onClick={() => completeMovie(movie.id)}>
                        {movie.completed ? "Undo" : "Complete"}
                      </button>
                      <button type="button" onClick={() => editMovie(movie.id)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteMovie(movie.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {page === "movies" && (
          <section>
            <p className="eyebrow">TMDB catalog</p>
            <h1>Find Movies</h1>
            <p>Search for movies and add them to your StreamList.</p>

            <form className="inline-form" onSubmit={searchMovies}>
              <input
                type="search"
                placeholder="Search movies"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              <button className="primary-button" type="submit">
                Search
              </button>
            </form>

            {movieMessage && <p className="movie-message">{movieMessage}</p>}

            {loading ? (
              <p>Searching for movies...</p>
            ) : (
              <div className="movie-grid">
                {searchResults.map((movie) => (
                  <article className="search-movie-card" key={movie.id}>
                    {movie.poster_path ? (
                      <img
                        className="movie-poster"
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                      />
                    ) : (
                      <div className="no-poster">No Image</div>
                    )}
                    <h3>{movie.title}</h3>
                    <p>
                      {movie.release_date
                        ? movie.release_date.substring(0, 4)
                        : "Release year unavailable"}
                    </p>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => addSearchMovie(movie)}
                    >
                      Add to StreamList
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "subscriptions" && (
          <section>
            <p className="eyebrow">Plans and merchandise</p>
            <h1>Subscriptions</h1>
            <p>Choose a streaming subscription or StreamList accessory.</p>

            {warning && <p className="warning">{warning}</p>}

            <div className="product-container">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <p className="product-type">
                    {product.type === "subscription"
                      ? "Streaming Subscription"
                      : "StreamList Accessory"}
                  </p>
                  <h3>{product.name}</h3>
                  <p className="price">${product.price.toFixed(2)}</p>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === "cart" && (
          <section>
            <p className="eyebrow">Review before checkout</p>
            <h1>Your Cart</h1>

            {warning && <p className="warning">{warning}</p>}

            {cart.length === 0 ? (
              <div className="empty-state">
                <h2>Your cart is empty</h2>
                <p>Add a subscription or accessory to begin checkout.</p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => changePage("subscriptions")}
                >
                  View Subscriptions
                </button>
              </div>
            ) : (
              <div>
                {cart.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>Price: ${item.price.toFixed(2)}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>
                        Item Total: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="cart-buttons">
                      <button type="button" onClick={() => decreaseQuantity(item.id)}>
                        Decrease
                      </button>
                      <button type="button" onClick={() => increaseQuantity(item.id)}>
                        Increase
                      </button>
                      <button type="button" onClick={() => removeItem(item.id)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}

                <div className="cart-summary">
                  <h2>Cart Summary</h2>
                  <p>Total Items: {cartCount}</p>
                  <h2>Total Price: ${cartTotal.toFixed(2)}</h2>
                  <button
                    className="primary-button checkout-button"
                    type="button"
                    onClick={() => changePage("checkout")}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {page === "checkout" && (
          <CreditCardManager
            cards={cards}
            selectedCardId={selectedCardId}
            setSelectedCardId={setSelectedCardId}
            onSaveCard={saveCard}
            onDeleteCard={deleteCard}
            cart={cart}
            cartTotal={cartTotal}
            onBackToCart={() => changePage("cart")}
            onCompleteOrder={completeOrder}
          />
        )}

        {page === "confirmation" && orderDetails && (
          <section className="confirmation-card">
            <div className="confirmation-icon" aria-hidden="true">
              ✓
            </div>
            <p className="eyebrow">Order complete</p>
            <h1>Thank you for your purchase</h1>
            <p>
              Order <strong>{orderDetails.orderNumber}</strong> was completed
              using the card ending in {orderDetails.lastFour}.
            </p>
            <p>
              {orderDetails.itemCount} item(s), total ${orderDetails.total.toFixed(2)}
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={() => changePage("subscriptions")}
            >
              Continue Shopping
            </button>
          </section>
        )}

        {page === "about" && (
          <section className="about-page">
            <p className="eyebrow">Application overview</p>
            <h1>About StreamList</h1>
            <p>
              StreamList helps users search for and organize movies they want to
              watch.
            </p>
            <p>
              The public home page introduces StreamList before entering the app.
              Every feature works in guest mode, while Google sign in remains available
              for users who want an account based profile.
            </p>
            <p>
              The application also provides subscription shopping, a persistent
              cart, checkout, and browser based credit card management.
            </p>
            <p>
              StreamList data and cart information are saved with localStorage. Guest
              card records are stored in this browser, while signed in users receive a
              separate card storage area tied to their Google profile.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
