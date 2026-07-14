import { useEffect, useState } from "react";
import products from "./Data.js";
import "./style.css";

const STORAGE_KEY = "streamlist";
const CART_KEY = "streamlistCart";

// Paste your TMDB API key between the quotation marks
const API_KEY = "74e1f2819d0f9641c8f540c73eab0f49";

function App() {
  const [page, setPage] = useState("streamlist");
  const [movieName, setMovieName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [warning, setWarning] = useState("");
  const [movieMessage, setMovieMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [movies, setMovies] = useState(() => {
    try {
      const savedMovies = localStorage.getItem(STORAGE_KEY);

      if (savedMovies) {
        return JSON.parse(savedMovies);
      }

      return [];
    } catch (error) {
      console.log("Could not load movies:", error);
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        return JSON.parse(savedCart);
      }

      return [];
    } catch (error) {
      console.log("Could not load cart:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

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
      name: movieName,
      completed: false,
      poster: null,
    };

    setMovies([...movies, newMovie]);
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

      setSearchResults(data.results);
    } catch (error) {
      console.log("Movie search error:", error);

      setMovieMessage(
        "Could not search for movies. Check your API key."
      );
    }

    setLoading(false);
  }

  function addSearchMovie(movie) {
    const movieExists = movies.find(
      (item) => item.tmdbId === movie.id
    );

    if (movieExists) {
      setMovieMessage(
        movie.title + " is already in your StreamList."
      );

      return;
    }

    const newMovie = {
      id: Date.now(),
      tmdbId: movie.id,
      name: movie.title,
      completed: false,
      poster: movie.poster_path,
    };

    setMovies([...movies, newMovie]);

    setMovieMessage(
      movie.title + " was added to your StreamList."
    );
  }

  function deleteMovie(id) {
    const updatedMovies = movies.filter(
      (movie) => movie.id !== id
    );

    setMovies(updatedMovies);
  }

  function completeMovie(id) {
    const updatedMovies = movies.map((movie) => {
      if (movie.id === id) {
        return {
          ...movie,
          completed: !movie.completed,
        };
      }

      return movie;
    });

    setMovies(updatedMovies);
  }

  function editMovie(id) {
    const movie = movies.find((item) => item.id === id);

    const updatedName = prompt(
      "Enter a new movie or show name:",
      movie.name
    );

    if (updatedName && updatedName.trim() !== "") {
      const updatedMovies = movies.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            name: updatedName,
          };
        }

        return item;
      });

      setMovies(updatedMovies);
    }
  }

  function addToCart(product) {
    const itemInCart = cart.find(
      (item) => item.id === product.id
    );

    if (
      product.type === "subscription" &&
      itemInCart
    ) {
      setWarning(
        product.name + " is already in your cart."
      );

      return;
    }

    setWarning("");

    if (itemInCart) {
      const updatedCart = cart.map((item) => {
        if (item.id === product.id) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }

        return item;
      });

      setCart(updatedCart);
    } else {
      const newItem = {
        ...product,
        quantity: 1,
      };

      setCart([...cart, newItem]);
    }
  }

  function removeItem(id) {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    setCart(updatedCart);
    setWarning("");
  }

  function increaseQuantity(id) {
    const selectedItem = cart.find(
      (item) => item.id === id
    );

    if (!selectedItem) {
      return;
    }

    if (selectedItem.type === "subscription") {
      setWarning(
        "Only one of each subscription can be added."
      );

      return;
    }

    setWarning("");

    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    });

    setCart(updatedCart);
  }

  function decreaseQuantity(id) {
    setWarning("");

    const updatedCart = cart
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(updatedCart);
  }

  const cartCount = cart.reduce(
    (total, item) => {
      return total + item.quantity;
    },
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => {
      return total + item.price * item.quantity;
    },
    0
  );

  return (
    <div>
      <nav>
        <h2>StreamList</h2>

        <button
          onClick={() => changePage("streamlist")}
        >
          StreamList
        </button>

        <button
          onClick={() => changePage("movies")}
        >
          Movies
        </button>

        <button
          onClick={() => changePage("subscriptions")}
        >
          Subscriptions
        </button>

        <button onClick={() => changePage("cart")}>
          Cart ({cartCount})
        </button>

        <button
          onClick={() => changePage("about")}
        >
          About
        </button>
      </nav>

      <main className="page-container">
        {page === "streamlist" && (
          <div>
            <h1>My StreamList</h1>

            <p>
              Add movies and shows that you want to watch.
            </p>

            <form onSubmit={addMovie}>
              <input
                type="text"
                placeholder="Enter a movie or show"
                value={movieName}
                onChange={(event) =>
                  setMovieName(event.target.value)
                }
              />

              <button type="submit">
                Add to StreamList
              </button>
            </form>

            <div className="movie-container">
              {movies.length === 0 ? (
                <p>Your StreamList is empty.</p>
              ) : (
                movies.map((movie) => (
                  <div
                    className="movie-card"
                    key={movie.id}
                  >
                    <div className="saved-movie-info">
                      {movie.poster && (
                        <img
                          className="saved-poster"
                          src={`https://image.tmdb.org/t/p/w200${movie.poster}`}
                          alt={movie.name}
                        />
                      )}

                      <h3
                        className={
                          movie.completed
                            ? "completed"
                            : ""
                        }
                      >
                        {movie.name}
                      </h3>
                    </div>

                    <div className="movie-buttons">
                      <button
                        onClick={() =>
                          completeMovie(movie.id)
                        }
                      >
                        {movie.completed
                          ? "Undo"
                          : "Complete"}
                      </button>

                      <button
                        onClick={() =>
                          editMovie(movie.id)
                        }
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteMovie(movie.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {page === "movies" && (
          <div>
            <h1>Find Movies</h1>

            <p>
              Search for movies and add them to your
              StreamList.
            </p>

            <form onSubmit={searchMovies}>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
              />

              <button type="submit">
                Search
              </button>
            </form>

            {movieMessage && (
              <p className="movie-message">
                {movieMessage}
              </p>
            )}

            {loading ? (
              <p>Searching for movies...</p>
            ) : (
              <div className="movie-grid">
                {searchResults.map((movie) => (
                  <div
                    className="search-movie-card"
                    key={movie.id}
                  >
                    {movie.poster_path ? (
                      <img
                        className="movie-poster"
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                      />
                    ) : (
                      <div className="no-poster">
                        No Image
                      </div>
                    )}

                    <h3>{movie.title}</h3>

                    <p>
                      {movie.release_date
                        ? movie.release_date.substring(
                            0,
                            4
                          )
                        : "Release year unavailable"}
                    </p>

                    <button
                      onClick={() =>
                        addSearchMovie(movie)
                      }
                    >
                      Add to StreamList
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {page === "subscriptions" && (
          <div>
            <h1>Subscriptions</h1>

            <p>
              Choose a streaming subscription or
              StreamList accessory.
            </p>

            {warning && (
              <p className="warning">{warning}</p>
            )}

            <div className="product-container">
              {products.map((product) => (
                <div
                  className="product-card"
                  key={product.id}
                >
                  <h3>{product.name}</h3>

                  <p className="price">
                    ${product.price.toFixed(2)}
                  </p>

                  <p>
                    {product.type === "subscription"
                      ? "Streaming Subscription"
                      : "StreamList Accessory"}
                  </p>

                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {page === "cart" && (
          <div>
            <h1>Your Cart</h1>

            {warning && (
              <p className="warning">{warning}</p>
            )}

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div>
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <div>
                      <h3>{item.name}</h3>

                      <p>
                        Price: $
                        {item.price.toFixed(2)}
                      </p>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                      <p>
                        Item Total: $
                        {(
                          item.price * item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="cart-buttons">
                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        -
                      </button>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                      <button
                        onClick={() =>
                          removeItem(item.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="cart-summary">
                  <h2>Cart Summary</h2>

                  <p>
                    Total Items: {cartCount}
                  </p>

                  <h2>
                    Total Price: $
                    {cartTotal.toFixed(2)}
                  </h2>
                </div>
              </div>
            )}
          </div>
        )}

        {page === "about" && (
          <div className="about-page">
            <h1>About StreamList</h1>

            <p>
              StreamList helps users search for and
              organize movies they want to watch.
            </p>

            <p>
              Users can add, edit, complete, and delete
              movies from their StreamList.
            </p>

            <p>
              Movie search results are retrieved from
              The Movie Database.
            </p>

            <p>
              StreamList also includes streaming
              subscriptions and accessories that can be
              added to a shopping cart.
            </p>

            <p>
              StreamList and cart information is saved
              using local storage.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;