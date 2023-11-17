'use client';

import styles from './page.module.css'
import React from 'react';

export default function Search() {

  // Retrieve the videos that you need to query the db with.
  const storedValue = localStorage.getItem('searchArray');
  const videosToDisplay = storedValue ? JSON.parse(storedValue) : [];
 
  return (
    <div>
        <h1 className={styles.title}>Search Results</h1>
    </div>
  );
}
