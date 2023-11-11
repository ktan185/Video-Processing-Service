'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { Video } from '../video/video';
import { getVideoMetadata } from '../firebase/functions';

export default function Watch() {
  const videoPrefix = 'https://storage.googleapis.com/snupsb-yt-processed-videos/';
  const videoSrc = useSearchParams().get('v');
  let videoId = videoSrc?.replace("processed-","");
  videoId = videoId?.replace(".mp4","");


  const [videoMetadata, setVideoMetadata] = useState<Video | null>(null);

  console.log(videoId);

  useEffect(() => {
    if (videoId) {
      getVideoMetadata(videoId).then(metadata => {
        setVideoMetadata(metadata);
      }).catch((err) =>{
        console.error(err);
      });
    }
  }, [videoId]); 

  
  return (
    <div>
      <h1>Watch Page</h1>
      <Video videoMetadata = {videoMetadata} videoPrefix = {videoPrefix} videoSrc = {videoSrc}/>
    </div>
  );
}
