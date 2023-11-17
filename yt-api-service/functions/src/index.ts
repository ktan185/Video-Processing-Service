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

const userCollectionId = "users";
const videoCollectionId = "videos";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string,
  date?: string
}

export const createUser = functions.auth.user().onCreate((user) => {
  // Continue to add user metadata as required.
  const userInfo = {
    uid: user.uid,
    displayName: user.displayName,
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

export const getSpecificVideos = onCall({maxInstances: 1}, async (request) => {
  // request should be an array.
  const toQuery = request.data;
  if (!Array.isArray(toQuery)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Expected an array"
    );
  }
  try {
    const results =
      await Promise.all(toQuery.map((id) => firestore
        .collection(videoCollectionId).doc(id).get()));
    const videos: Video[] =
      results.map((doc) => doc.exists ? doc.data() as Video : null)
        .filter((video): video is Video => video !== null);
    return videos;
  } catch (error) {
    logger.error("Error fetching videos: ", error);
    throw new functions.https.HttpsError(
      "unknown",
      "An error occurred while fetching search results"
    );
  }
});

export const getVideoMetaData = onCall({maxInstances: 1}, async (request) => {
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
  logger.info("Received request data:", request.data);

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
        "The requested user does not exist."
      );
    }

    // Cast the data to the Video interface
    const userMetaData = doc.data() as object;

    // Check if the video metadata actually includes all necessary Video fields
    if (!userMetaData) {
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
