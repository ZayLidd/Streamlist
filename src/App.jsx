import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

const STORAGE_KEY = 'streamlist';
const TMDB_API_KEY = '74e1f2819d0f9641c8f540c73eab0f49';

function Navigation() {
  return (
    <nav>
      <h2>🎬 StreamList</h2>
      <Link to="/">StreamList</Link>
      <Link to="/movies">Movies</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

function Home() {
  const [movieName, setMovieName] = useState('');
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const savedMovies = localStorage.getItem(STORAGE_KEY);

    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }, [movies]);

  function addMovie(event) {
    event.preventDefault();

    if (movieName === '') {
      return;
    }

    const newMovie = {
      id: Date.now(),
      title: movieName,
      complete: false
    };

    setMovies([...movies, newMovie]);
    console.log('Movie added:', movieName);
    setMovieName('');
  }

  function deleteMovie(index) {
    const newList = movies.filter((movie, movieIndex) => movieIndex !== index);
    setMovies(newList);
  }

  function completeMovie(index) {
    const newList = movies.map((movie, movieIndex) => {
      if (movieIndex === index) {
        return {
          ...movie,
          complete: !movie.complete
        };
      }

      return movie;
    });

    setMovies(newList);
  }

  function editMovie(index) {
    const updatedTitle = prompt('Enter the new movie name:', movies[index].title);

    if (updatedTitle) {
      const newList = movies.map((movie, movieIndex) => {
        if (movieIndex === index) {
          return {
            ...movie,
            title: updatedTitle
          };
        }

        return movie;
      });

      setMovies(newList);
    }
  }

  return (
    <div className="page">
      <h1>StreamList Home</h1>
      <p>Add movies or shows you want to watch later.</p>

      <form onSubmit={addMovie}>
        <input
          type="text"
          value={movieName}
          placeholder="Enter movie or show"
          onChange={(event) => setMovieName(event.target.value)}
        />

        <button type="submit">Add</button>
      </form>

      <h2>My Watch List</h2>

      {movies.length === 0 && <p>No movies added yet.</p>}

      <ul className="list">
        {movies.map((movie, index) => (
          <li key={movie.id}>
            <span className={movie.complete ? 'completed-text' : ''}>
              {movie.title}
            </span>

            <div className="button-group">
              <button onClick={() => completeMovie(index)}>Complete</button>
              <button onClick={() => editMovie(index)}>Edit</button>
              <button onClick={() => deleteMovie(index)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Movies() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);

  function searchMovies(event) {
    event.preventDefault();

    if (searchText.trim() === '') {
      alert('Please enter a movie title to search.');
      return;
    }

    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchText)}`
    )
      .then((response) => response.json())
      .then((data) => {
        setResults(data.results);
      })
      .catch((error) => {
        console.log('Error:', error);
      });
  }

  return (
    <div className="page">
      <h1>Movie Search</h1>
      <p>Search for movies using the TMDB API.</p>

      <form onSubmit={searchMovies}>
        <input
          type="text"
          value={searchText}
          placeholder="Search movie title"
          onChange={(event) => setSearchText(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <div className="movie-grid">
        {results.map((movie) => (
          <div className="movie-card" key={movie.id}>
            {movie.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
              />
            )}

            <h3>{movie.title}</h3>
            <p><strong>Release:</strong> {movie.release_date}</p>
            <p><strong>Rating:</strong> {movie.vote_average}</p>
            <p>{movie.overview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cart() {
  return (
    <div className="page">
      <h1>Cart Page</h1>
      <p>This page will be built later.</p>
    </div>
  );
}

function About() {
  return (
    <div className="page">
      <h1>About StreamList</h1>
      <p>
        StreamList helps users save movies and search movie information using the TMDB API.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}