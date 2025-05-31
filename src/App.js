import "./index.css";
import React, { useEffect, useState, useRef, useCallback } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loaderRef = useRef(null);

  const fetchItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://dummyjson.com/products?limit=10&skip=${skip}`);
      const data = await res.json();

      if (data.products.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...data.products]);
        setSkip((prev) => prev + 10);
      }
    } catch (err) {
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [skip, loading, hasMore]);

  useEffect(() => {
    fetchItems();
  },[]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchItems();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchItems, hasMore, loading]);

  return (
    <div>
      <h2>Infinite Scroll Product List</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.title} - ${item.price}
          </li>
        ))}
      </ul>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!hasMore && <p>No more products.</p>}
      <div ref={loaderRef}></div>
    </div>
  );
}

export default App;
