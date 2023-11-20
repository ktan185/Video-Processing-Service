'use client'

import styles from '../page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Assuming each video is an array of strings
type Video = string[];

export default function Search() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const storedValue = localStorage.getItem('searchArray');
    setVideos(storedValue ? JSON.parse(storedValue) : []);
  }, []);

  const SearchList: React.FC<{ videos: Video[] }> = ({ videos }) => {
    return (
      <>
        {videos.map((video) => (
          <Link key={video[0]} href={`/watch?v=${video[0]}`} className={styles.link}>
            <Image priority 
              src='/thumbnail.png' 
              alt='Thumbnail' 
              width={256} 
              height={144} 
              className={styles.thumbnail} />
            <p className={styles.thumbnailTitle}>{video[1]}</p>
          </Link>
        ))}
      </>
    );
  };

  return (
    <div>
      <h1 className={styles.title}>Search Results</h1>
      <div className={styles.videosGrid}>
        <SearchList videos={videos} />
      </div>
    </div>
  );
}
