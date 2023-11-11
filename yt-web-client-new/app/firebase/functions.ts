import {httpsCallable} from 'firebase/functions';
import { functions } from './firebase';


const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');
const generateMetadata = httpsCallable(functions, 'storeVideoMetadata');
const getMetaDataFunction = httpsCallable(functions, 'getVideoMetaData');

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: 'processing' | 'processed',
  title?: string,
  description?: string
}

export async function uploadVideo(file: File, title: string, description: string) {
  
  const response: any = await generateUploadUrl({
    fileExtension: file.name.split('.').pop()
  });

  // Upload the file via the signed URL.
  await fetch(response?.data?.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  // Now that the file is uploaded, store its metadata
  const fileName = response?.data?.fileName;
  
  // Generate the metadata for this specific video,
  // Add this data to metadata collection.
  await generateMetadata({
    title: title,
    description: description,
    filename: fileName
  });

  return;
}

export async function getVideos() {
  const response = await getVideosFunction();
  return response.data as Video[];
}

// Function to get information about the video
export async function getVideoMetaData(videoId: string) {
  try {
    const response: any = await getMetaDataFunction({
      videoId: videoId
    });
    return response.data as Video;
  } catch (error) {
    console.error("Error fetching video metadata: ", error);
    throw error;
  }
}
