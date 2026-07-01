import { useState } from 'react';
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
  const [title, setTitle] = useState('');
  const [streamItems, setStreamItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() === '') {
      return;
    }

    const newItem = {
      name: title,
      completed: false
    };

    setStreamItems([...streamItems, newItem]);
    console.log("Movie or show added:", title);
    setTitle('');
  }

  function deleteItem(index) {
    const updatedItems = streamItems.filter((item, itemIndex) => itemIndex !== index);
    setStreamItems(updatedItems);
  }

  function completeItem(index) {
    const updatedItems = streamItems.map((item, itemIndex) => {
      if (itemIndex === index) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    setStreamItems(updatedItems);
  }

  function startEdit(index) {
    setEditIndex(index);
    setEditTitle(streamItems[index].name);
  }

  function saveEdit(index) {
    const updatedItems = streamItems.map((item, itemIndex) => {
      if (itemIndex === index) {
        return { ...item, name: editTitle };
      }
      return item;
    });

    setStreamItems(updatedItems);
    setEditIndex(null);
    setEditTitle('');
  }

  return (
    <div className="page">
      <h1>StreamList Home</h1>
      <p>Add movies or shows you want to watch later.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          placeholder="Enter movie or show"
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <h2>My Watch List</h2>

      {streamItems.length === 0 ? (
        <p>No movies or shows added yet.</p>
      ) : (
        <ul className="list">
          {streamItems.map((item, index) => (
            <li key={index} className={item.completed ? 'completed' : ''}>
              {editIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                  <button onClick={() => saveEdit(index)}>Save</button>
                </>
              ) : (
                <>
                  <span>{item.name}</span>
                  <button onClick={() => completeItem(index)}>Complete</button>
                  <button onClick={() => startEdit(index)}>Edit</button>
                  <button onClick={() => deleteItem(index)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
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