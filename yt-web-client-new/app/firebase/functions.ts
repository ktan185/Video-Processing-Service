import {httpsCallable} from 'firebase/functions';
import { functions } from './firebase';

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');
const getMetaDataFunction = httpsCallable(functions, 'getVideoMetaData');
const getSpecificVideosFunction = httpsCallable(functions, 'getSpecificVideos')
const getUserMetadataFunction = httpsCallable(functions, 'getUserMetaData');

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
    fileExtension: file.name.split('.').pop(),
    title: title ,
    description: description
  });

  // Upload the file via the signed URL.
  await fetch(response?.data?.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })
  return;
}

export async function getVideos() {
  const response = await getVideosFunction();
  return response.data as Video[];
}

export async function getSearchResults(data: any): Promise<Video[]> {
  try {
    const result = await getSpecificVideosFunction(data);
    if (!result) {
      throw new Error('No videos found');
    }
    return result.data as Video[]
  } catch (error) {
    console.error('Error searching for videos:', error);
    throw error;
  }
}

export async function getVideoMetadata(data: string): Promise<Video> {
  try {
    const result = await getMetaDataFunction( data ) as any;
    if (!result) {
      throw new Error('No metadata found');
    }
    return result as Video;
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    throw error;
  }
}

export async function getUserMetadata(data: string): Promise<any> {
  try {
    const result = await getUserMetadataFunction( data ) as any;
    if (!result) {
      throw new Error('No metadata found');
    }
    return result as any;
  } catch (error) {
    console.error('Error fetching video user data:', error);
    throw error;
  }
}




