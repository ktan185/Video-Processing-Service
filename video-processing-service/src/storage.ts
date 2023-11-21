import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "snupsb-yt-raw-videos";
const processedVideoBucketName = "snupsb-yt-processed-videos";
const thumbnailBucketName = "snupsb-yt-thumbnails";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";
const localThumbnailPath = "./thumbnails";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
  ensureDirectoryExistence(localThumbnailPath);
}

/** 
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promis that resolves when the video has been converted. 
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") // Convert to 360p
      .on("end", () => {
        console.log("Video processing finished successfully");
        resolve();
      })
      .on("error", (err) => {
        console.log(`An error occured: ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
  await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({ destination: `${localRawVideoPath}/${fileName}` });

  console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);

}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName
  });
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
  );

  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localThumbnailPath} folder into the {@link thumbnailBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadThumbnail(thumbnailPath: string) {
  const bucket = storage.bucket(thumbnailBucketName);

  const destination = thumbnailPath.split('./thumbnails/')[1];

  await bucket.upload(thumbnailPath, {
    destination: destination
  });
  console.log(
    `${thumbnailPath} uploaded to gs://${thumbnailBucketName}/${destination}.`
  );
  await bucket.file(destination).makePublic();
}

/**
 * Generates a thumbnail for a video at a random time interval.
 * @param fileName - The name of the video file.
 * @param thumbnailName - The name of the thumbnail file to create.
 * @returns A promise that resolves when the thumbnail has been created.
 */
export async function generateRandomThumbnail(fileName: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Get the duration of the video
    ffmpeg.ffprobe(`${localProcessedVideoPath}/${fileName}`, (err, metadata) => {
      if (err) {
        reject(`Error getting video metadata: ${err.message}`);
        return;
      }

      const duration = metadata.format.duration;
      if (!duration) {
        reject("Could not determine video duration.");
        return;
      }

      // Generate a random time within the video duration
      const randomTime = Math.floor(Math.random() * duration);

      // Capture a frame at the random time
      ffmpeg(`${localProcessedVideoPath}/${fileName}`)
        .screenshots({
          timestamps: [randomTime],
          folder: localThumbnailPath,
          filename: `${fileName}.png`,
          size: '320x240'
        })
        .on('end', () => {
          const thumbnailPath = `${localThumbnailPath}/${fileName}.png`;
          console.log(`Thumbnail generated: ${thumbnailPath}`);
          resolve(thumbnailPath);
        })
        .on('error', (err) => {
          console.log(`An error occurred: ${err.message}`);
          reject(err);
        });
    });
  });
}

/** 
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted. 
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filePath}`);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping the delete.`);
      resolve();
    }
  });
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
* @param fileName - The name of the file to delete from the
* {@link localThumbnailPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteThumbnail(fileName: string) {
  return deleteFile(`${localThumbnailPath}/${fileName}`);
}

/**
 * Ensures that the directory exists, create it if necessary.
 * @param {string} direPath - The path of the directory to check.
 */
function ensureDirectoryExistence(direPath: string) {
  if (!fs.existsSync(direPath)) {
    fs.mkdirSync(direPath, { recursive: true });
    console.log(`Created directory at ${direPath}`);
  }
}