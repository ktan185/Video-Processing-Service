'use client';

import React, { useEffect, useState } from 'react';
import { getSearchResults } from '../firebase/functions';
import styles from '../page.module.css'
import { Thumbnail, Video } from '../video/video';

export default function Search() {

  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const storedValue = localStorage.getItem('searchArray');
    const videosToDisplay = storedValue ? JSON.parse(storedValue) : [];
    if (videosToDisplay.length > 0) {
      getSearchResults(videosToDisplay)
        .then(result => {
          if (Array.isArray(result)) {
            setVideos(result);
          } else {
            // Handle the case where result is not an array
            console.error('Unexpected result format:', result);
          }
        })
        .catch(error => {
          console.error('Failed to fetch search results:', error);
        });
    }
  }, []);
  

  return (
    <div>
      <h1 className={styles.title}>Search Results</h1>
        <div className={styles.videosGrid}>
          {videos.map(video => (
            <Thumbnail key={video.id} video={video} />
          ))}
        </div>
    </div>
  );
}
