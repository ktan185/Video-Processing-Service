'use client'

import Link from "next/link";
import React from "react";
import Image from 'next/image'; 
import styles from "./video.module.css";
import { UserProfile } from "../navbar/user";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string
}

interface VideoDetailsProps {
  user: any;
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
    <Link href={`/watch?v=${video.filename}`} className={styles.link}>
        <Image 
          src='/thumbnail.png' 
          alt='Thumbnail' 
          width={285} 
          height={160}
          className={styles.thumbnail} />
        <p className={styles.thumbnailTitle}>{video.title}</p>
    </Link>
  );
};


export const VideoPlayer = (props: any) => {
  const user = props.user;
  const title = props.title;
  const date = props.date
  const desc = props.desc;

  const uploadDate = convertTimestampToDate(date._seconds, date._nanoseconds)

  return (
    <div className={styles.videoBackground}>
      <video 
        controls 
        src={props.videoPrefix + props.videoSrc} 
        className={styles.videoWrapper}
        />
      <VideoDetails user={user} title={title} description={desc} date={uploadDate} />
    </div>
  );
};


export const VideoDetails: React.FC<VideoDetailsProps> = (props) => {

  const user = props.user;
  let displayName = user && user.displayName ? user.displayName : '';
  let profilePicture = user && user.photoUrl ? user.photoUrl : '';
   
  return (
    <div className="videoDetails">
      <h2 className={styles.title}>{props.title}</h2>
      <div className={styles.description}>
          <p className={styles.line}>
          <UserProfile 
            displayName={displayName} 
            profilePicture={profilePicture}/>
            Date Uploaded: {props.date}
          </p>
          <p>Description: <br/>{props.description}</p>
      </div>
    </div>
  );
}

function convertTimestampToDate(seconds: number, nanoseconds: number) {

  // If the time is yet to be loaded, don't call function.
  if (!seconds || !nanoseconds) return '';
  // Validate input
  if (typeof seconds !== 'number' || typeof nanoseconds !== 'number') {
    console.error('Invalid timestamp values:', { seconds, nanoseconds });
    return 'Invalid date'; // Return a default message or handle as needed
  }

  try {
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return 'Invalid date'; // Return a default message or handle as needed
  }
}



