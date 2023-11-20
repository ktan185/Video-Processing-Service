import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import styles from './searchbar.module.css';
import { Video } from '@/app/video/video';

interface AlgoliaHit {
  objectID: string; // Ensure this matches the property name from Algolia
  _highlightResult?: {}; // Assuming these are optional, hence the '?'
  _snippetResult?: {};
  _distinctSeqID?: number;
}

const path = '/search';

export const SearchBar: React.FC = () => {
	const [query, setQuery] = useState('');
	const client = algoliasearch('LIMUGMY693', '6537ecd6e45f54c5eee3f4ada28f842b');
	const index = client.initIndex('videos');

	const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Locally store the searched videos.
		await search();
		//Navigate to search page.
		window.location.href = path;
	};
	
	const search = async () => {
		if (!query) return;
		try {
			const result = await index.search(query);
			const videoArray = result.hits as Array<Video>;
			// Get the video URLs
      const URLArray = videoArray.map((video) => [video.filename, video.title]);
			console.log(URLArray)
      
			// Store the array locally in the browser.
      if (URLArray !== null) {
        localStorage.setItem('searchArray', JSON.stringify(URLArray));
      }
		} catch (error) {
			console.error('Search error:', error);
		}
	}

	return (
		<div className={styles.search}>
			<form className={styles.searchContainer} onSubmit={handleSearch}>
				<input className={styles.searchInput}
					type="text"
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder="Search..."
				/>
				<button className={styles.searchButton} type="submit">Search</button>
			</form>
		</div>
	);
};

export default SearchBar;
