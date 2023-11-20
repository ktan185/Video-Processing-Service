'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { VideoPlayer } from '../video/video';
import { getUserMetadata, getVideoMetadata } from '../firebase/functions';
import styles from "../page.module.css"

export default function Watch() {
  const videoPrefix = 'https://storage.googleapis.com/snupsb-yt-processed-videos/';
  const videoSrc = useSearchParams().get('v');
  
  let videoId = '';
  if (typeof videoSrc === 'string') {
    videoId = videoSrc.replace("processed-", "");
    videoId = videoId.split(".")[0];
  }
  const userId = videoId.split("-")[0];
  const [payload, setVideoMetadata] = useState<any | null>(null);
  const [uploader, setUploaderMetadata] = useState<any | null>(null);
  
  useEffect(() => {
    if (videoId) {
      getVideoMetadata(videoId).then(video => {
        setVideoMetadata(video);
      }).catch((err) => {
        console.error(err);
      });
      getUserMetadata(userId).then(uploader => {
        setUploaderMetadata(uploader);
      }).catch((err2) => {
        console.error(err2);
      })
    }
  }, [videoId]);

  let title = "";
  let desc = "";
  let date = { seconds: 0, nanoseconds: 0 };

  if (payload && payload.data && payload.data.date && typeof payload.data.date === 'object') {
    title = payload.data.title;
    desc = payload.data.description;
    date = payload.data.date;
  }
  let user = uploader && uploader.data ? uploader.data : null;
  return (
    <div>
        <h1 className={styles.title}>Watch Page</h1>
        {/* TO DO: ADD cloud function to get the user who uploaded the video! */}
      <VideoPlayer user={user} title={title} desc={desc} date={date} videoPrefix={videoPrefix} videoSrc={videoSrc} />
    </div>
  );
}
