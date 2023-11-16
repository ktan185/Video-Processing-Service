'use client'

import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import Image from 'next/image'; 
import styles from "./video.module.css";
import { User } from "firebase/auth";
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
  user: User;
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
      <>
        <Image src='/thumbnail.png' alt='Thumbnail' width={120} height={80}
          className={styles.thumbnail} />
        <p className={styles.thumbnailTitle}>{video.title}</p>
      </>
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
      <video controls src={props.videoPrefix + props.videoSrc} />
      <VideoDetails user={user} title={title} description={desc} date={uploadDate} />
    </div>
  );
};


export const VideoDetails: React.FC<VideoDetailsProps> = (props) => {

  const user = props.user;
  let profilePicture = ''
  if (user?.photoURL) {
    profilePicture = user.photoURL as string
  }
 
  return (
    <div className="videoDetails">
      <h2 className={styles.title}>{props.title}</h2>
      <div className={styles.description}>
        <p>
          <UserProfile profilePicture={profilePicture}/>
          Date Uploaded: {props.date}
        </p>
        <p>
          {props.description}
        </p>
      </div>
    </div>
  );
}

function convertTimestampToDate(seconds: number, nanoseconds: number) {
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



