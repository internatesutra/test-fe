import React, { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api/items';

  // Fetch items from the server
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (e) {
      setError(e.message);
      console.error("Failed to fetch items:", e);
    } finally {
      setLoading(false);
    }
  };

  // useEffect hook to fetch items when the component mounts
  useEffect(() => {
    fetchItems();
  }, []); // Empty dependency array means this runs once on mount

  // Handle form submission to add a new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      alert("Please enter an item name.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItemName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the list to show the new item
      fetchItems(); 
      setNewItemName(''); // Clear the input field

    } catch (e) {
      setError(e.message);
      console.error("Failed to add item:", e);
    }
  };


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '40px auto', padding: '20px', background: '#f4f4f4', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center' }}>PERN Stack Items</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', marginBottom: '20px' }}>
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Enter new item name"
          style={{ flex: 1, padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '0 4px 4px 0' }}>
          Add Item
        </button>
      </form>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.item_id} style={{ background: 'white', padding: '15px', borderBottom: '1px solid #ddd', borderRadius: '4px', marginBottom: '5px' }}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
