// src/components/SavedNews.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SavedNews() {
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/saved-news');
      setSavedArticles(response.data.data); 
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/saved-article/${id}`);
      fetchSavedArticles(); // Refresh after deletion
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Saved Articles</h1>
      {savedArticles.length === 0 ? (
        <p>No saved articles yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedArticles.map((article) => (
            <li key={article._id} className="border p-4 rounded shadow-md">
              <h2 className="font-bold">{article.title}</h2>
              <p>{article.description}</p>
              <a href={article.url} className="text-blue-600" target="_blank" rel="noopener noreferrer">Read more</a>
              <button
                onClick={() => handleDelete(article._id)}
                className="mt-2 block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavedNews;
