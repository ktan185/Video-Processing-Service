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
    const navigateToVideo = (videoId: string) => {
      // You can use 'useRouter' from 'next/router' for client-side transitions,
      // or 'window.location.href' for a full page refresh.
      window.location.href = `/watch?v=${videoId}`;
    };

    return (
      <>
        {videos.map((video) => (
          <div key={video[0]} onClick={() => navigateToVideo(video[0])} className={styles.link} style={{ cursor: 'pointer' }}>
            <Image
              priority
              src='/thumbnail.png'
              alt='Thumbnail'
              width={310}
              height={200}
              className={styles.thumbnail} />
            <p className={styles.thumbnailTitle}>{video[1]}</p>
          </div>
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
