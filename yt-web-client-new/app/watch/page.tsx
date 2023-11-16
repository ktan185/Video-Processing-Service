'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { VideoPlayer } from '../video/video';
import { getVideoMetadata } from '../firebase/functions';
import styles from "./page.module.css"

export default function Watch() {
  const videoPrefix = 'https://storage.googleapis.com/snupsb-yt-processed-videos/';
  const videoSrc = useSearchParams().get('v');
  
  let videoId = '';
  if (typeof videoSrc === 'string') {
    videoId = videoSrc.replace("processed-", "");
    videoId = videoId.split(".")[0];
  }

  console.log(videoId);
  const [payload, setVideoMetadata] = useState<any | null>(null);
  
  useEffect(() => {
    if (videoId) {
      getVideoMetadata(videoId).then(video => {
        setVideoMetadata(video);
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [videoId]);

  let title = "";
  let desc = "";
  let date = { seconds: 0, nanoseconds: 0 };

  if (payload && payload.data && payload.data.date && typeof payload.data.date === 'object') {
    console.log("file name is: ", payload.data.title);
    title = payload.data.title;
    desc = payload.data.description;
    date = payload.data.date;
  }
   
  return (
    <div>
        <h1 className={styles.title}>Watch Page</h1>
        {/* TO DO: ADD cloud function to get the user who uploaded the video! */}
      <VideoPlayer title={title} desc={desc} date={date} videoPrefix={videoPrefix} videoSrc={videoSrc} />
    </div>
  );
}
