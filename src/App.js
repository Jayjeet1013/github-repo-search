import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `https://api.github.com/search/users?q=${searchQuery}`
      );
      const users = response.data.items;
      const repositories = await Promise.all(
        users.map(async (user) => {
          const reposResponse = await axios.get(
            `https://api.github.com/users/${user.login}/repos`
          );
          return { user, repos: reposResponse.data };
        })
      );
      setSearchResults(repositories);
    } catch (error) {
      console.error('Error searching repositories:', error);
    }
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return <p>No results found.</p>;
    }

    return searchResults.map((result) => (
      <div key={result.user.id}>
        <h3>{result.user.login}</h3>
        <ul>
          {result.repos
            .sort((a, b) => {
              if (sortBy === 'stars') {
                return b.stargazers_count - a.stargazers_count;
              } else if (sortBy === 'forks') {
                return b.forks_count - a.forks_count;
              } else {
                return 0;
              }
            })
            .map((repo) => (
              <li key={repo.id}>
                <a href={repo.html_url}>{repo.name}</a>
                <p>Stars: {repo.stargazers_count}</p>
                <p>Forks: {repo.forks_count}</p>
              </li>
            ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="App">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for users"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        <select value={sortBy} onChange={handleSortChange}>
          <option value="">Sort By</option>
          <option value="stars">Stars</option>
          <option value="forks">Forks</option>
        </select>
        <button type="submit">Search</button>
      </form>
      {renderSearchResults()}
    </div>
  );
}

export default App;
