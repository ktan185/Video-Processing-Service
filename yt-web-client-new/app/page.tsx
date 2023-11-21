import React from "react";
import styles from './page.module.css'
import { getVideos } from './firebase/functions'
import { Thumbnail } from "./video/video";

export default async function Home() {

  // Get an array of 10 videos to display.
  const videos = await getVideos();
  console.log(videos)

  return (
    <main>
      <h1 className={styles.title}>Home Page</h1>
        <div className={styles.videosGrid}>
          {videos.map((video, index) => (
            // Make sure to pass the video object to the Thumbnail component
            // and provide a unique key prop for each mapped item
            <Thumbnail key={index} video={video} />
          ))}
        </div>
    </main>
  )
}

