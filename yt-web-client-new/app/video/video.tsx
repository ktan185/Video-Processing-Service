import Link from "next/link";
import React from "react";
import Image from 'next/image'; 
import styles from "./video.module.css";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string
}

interface VideoDetailsProps {
  title: string;
  description: string;
}

// Component for thumbnails for users to click on to take them to video.
export const Thumbnail = ({ video }: { video: Video }) => {
  if (!video || video.status !== "processed") {
    return null; // Renders nothing if video is not available or not processed
  }

  return (
    <Link className = {styles.link} href={`/watch?v=${video.filename}`}>
      <div className={styles.videoItem}>
        <Image src='/thumbnail.png' alt='Thumbnail' width={120} height={80}
          className={styles.thumbnail} />
        <p className={styles.thumbnailTitle}>{video.title}</p>
      </div>
    </Link>
  );
}

export const Video = (props: any) => {
  const video = props.videoMetadata;

  return (
    <>
      <p className={styles.videoBackground}>
        <video controls src={props.videoPrefix + props.videoSrc} />
        {video && <VideoDetails title={video.title} description={video.description} />}
      </p>
    </>
  ) 
}


export const VideoDetails: React.FC<VideoDetailsProps> = ({ title, description }) => {
  return (
    <div className="videoDetails">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
}


