'use client'

import styles from '../page.module.css';
import { useEffect, useState } from 'react';
import { Thumbnail, Video } from '../video/video';

function display(videos : Video[] | null) {

  if (!videos) 
    return <p className={styles.results}>searching...</p>
  
  if (videos.length > 0) {
    return videos.map(video => (
      <Thumbnail key={video.id} video={video}/>
    ))
  } else {
    return <p className={styles.results}>No results...</p>
  }
}

export default function Search() {
  const [videos, setVideos] = useState<Video[] | null>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem('searchArray');
    setVideos(storedValue ? JSON.parse(storedValue) : []);
  }, []);

 

  return (
    <div>
      <h1 className={styles.title}>Search Results</h1>
      <div className={styles.videosGrid}>
        {display(videos)}
      </div>
    </div>
  );
}

