import Link from "next/link";
import React, { Fragment } from "react";
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
  date: string;
}

// Component for thumbnails for users to click on to take them to video.
export const Thumbnail = ({ video }: { video: Video }) => {
  if (!video || video.status !== "processed") {
    return null; // Renders nothing if video is not available or not processed
  }

  return (
    <Link className = {styles.link} href={`/watch?v=${video.filename}`}>
        <Image src='/thumbnail.png' alt='Thumbnail' width={120} height={80}
          className={styles.thumbnail} />
        <p className={styles.thumbnailTitle}>{video.title}</p>
    </Link>
  );
}

export const VideoPlayer = (props: any) => {
  const title = props.title;
  const date = props.date
  const desc = props.desc;

  const uploadDate = convertTimestampToDate(date.seconds, date.nanoseconds)

  return (
    <div className={styles.videoBackground}>
      <video controls src={props.videoPrefix + props.videoSrc} />
      <VideoDetails title={title} description={desc} date={uploadDate} />
    </div>
  );
};


export const VideoDetails: React.FC<VideoDetailsProps> = ({ title, description, date }) => {
  return (
    <div className="videoDetails">
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.description}>
        <p>
          Date Uploaded: <strong>{date}</strong>
        </p>
        <p>
          {description}
        </p>
      </div>
    </div>
  );
}

function convertTimestampToDate(seconds: number, nanoseconds: number): string {
  const milliseconds = seconds * 1000 + nanoseconds / 1000000;
  const date = new Date(milliseconds);
  return date.toString();
}


