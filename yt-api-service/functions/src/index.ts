import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();

const rawVideoBucketName = "snupsb-yt-raw-videos";

const videoCollectionId = "videos";
const userCollectionId = "users";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string,
  date?: string
}

export interface UserInfo {
  uid?: string,
  email?: string,
  photoUrl?: string
}

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  firestore.collection(userCollectionId).doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  return;
});

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // Check if the user is authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);

  // Generate a unique filename
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;
  const fileId = `${auth.uid}-${Date.now()}`;

  // Store the title and description
  const title = data.title;
  const desc = data.description;

  // Update metadata about the video.
  await firestore.collection(videoCollectionId).doc(fileId).set({
    title: title,
    description: desc,
    date: new Date(),
  }, {merge: true});

  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return {url, fileName};
});

export const getVideos = onCall({maxInstances: 1}, async () => {
  const querySnapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
    // TODO, need pagination (offset)
  return querySnapshot.docs.map((doc) => doc.data());
});

export const getVideoMetaData = onCall({maxInstances: 1}, async (request) => {
  logger.info('Received request data:', request.data);
  // request should be in the form of video id.
  const fileId = request.data;
  if (!fileId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a valid videoId."
    );
  }

  // Attempt to retrieve the video metadata from the Firestore database
  try {
    const videoRef = firestore.collection(videoCollectionId).doc(fileId);
    const doc = await videoRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "The requested video does not exist."
      );
    }

    // Cast the data to the Video interface
    const videoMetaData = doc.data() as Video;

    // Check if the video metadata actually includes all necessary Video fields
    if (!videoMetaData || !videoMetaData.title || !videoMetaData.description) {
      throw new functions.https.HttpsError(
        "data-loss",
        "The video metadata is incomplete."
      );
    }
    // Return the video metadata
    return videoMetaData;
  } catch (error) {
    logger.error("Error fetching video metadata: ", error);
    throw new functions.https.HttpsError(
      "unknown",
      "An error occurred while fetching video metadata"
    );
  }
});

export const getUserMetaData = onCall({maxInstances: 1}, async (request) => {
  logger.info('Received request data:', request.data);

  const userId = request.data;
  if (!userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "User does not exist."
    );
  }

  // Attempt to retrieve the users metadata from the Firestore database
  try {
    const userRef = firestore.collection(userCollectionId).doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "The requested video does not exist."
      );
    }

    // Cast the data to the Video interface
    const userMetaData = doc.data() as UserInfo;

    // Check if the video metadata actually includes all necessary Video fields
    if (!userMetaData ||
       !userMetaData.uid || !userMetaData.email || !userMetaData.photoUrl) {
      throw new functions.https.HttpsError(
        "data-loss",
        "The user metadata is incomplete."
      );
    }
    // Return the video metadata
    return userMetaData;
  } catch (error) {
    logger.error("Error fetching user metadata: ", error);
    throw new functions.https.HttpsError(
      "unknown",
      "An error occurred while fetching user metadata"
    );
  }
});

