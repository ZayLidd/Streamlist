import { Routes, Route, Link } from 'react-router-dom';

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

function StreamList() {
  function handleSubmit(event) {
    event.preventDefault();
    const title = event.target.title.value;
    console.log("Movie or show added:", title);
    alert(title + " was added to the console.");
    event.target.reset();
  }

  return (
    <div className="page">
      <h1>StreamList Home</h1>
      <p>Add a movie or show you want to watch later.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Enter movie or show"
          required
        />
        <button type="submit">Add to StreamList</button>
      </form>
    </div>
  );
}

function Movies() {
  return (
    <div className="page">
      <h1>Movies Page</h1>
      <p>This page will be built in Week 4.</p>
    </div>
  );
}

function Cart() {
  return (
    <div className="page">
      <h1>Cart Page</h1>
      <p>This page will be built in Week 4.</p>
    </div>
  );
}

function About() {
  return (
    <div className="page">
      <h1>About Page</h1>
      <p>This page will be built in Week 5.</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<StreamList />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}