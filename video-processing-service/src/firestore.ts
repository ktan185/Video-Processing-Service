import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore, QuerySnapshot } from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

// Note: This requires setting an env variable in Cloud Run
/** if (process.env.NODE_ENV !== 'production') {
  firestore.settings({
      host: "localhost:8080", // Default port for Firestore emulator
      ssl: false
  });
} */

const videoCollectionId = 'videos';
const thumbnailCollectionId = 'thumbnails';

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed' | 'error', 
  title?: string,
  description?: string
}


async function getVideo(videoId: string) {
  const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
  return (snapshot.data() as Video) ?? {};
}

export function setVideo(videoID: string, video: Video) {
  return firestore
    .collection(videoCollectionId)
    .doc(videoID)
    .set(video, {merge: true});
}

export function setThumbnail(videoID: string, path: any) {
  return firestore
    .collection(thumbnailCollectionId)
    .doc(videoID)
    .set(path, {merge: true});
}

export async function isVideoNew(videoId: string) {
  const video = await getVideo(videoId);
  return video?.status === undefined;
}
