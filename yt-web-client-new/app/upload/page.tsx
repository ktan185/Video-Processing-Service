'use client'

import { uploadVideo } from "@/app/firebase/functions";
import styles from "../page.module.css"
import formStyles from "./page.module.css"
import { useState } from "react";

export default function Upload() {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  // This handler is for the file input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.item(0) ?? null; // Fallback to null if no files
    setFile(newFile);
  };

  // This handler is for the form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // You can now use the file from the state and the title/description to handle the upload
    if (file && title && description) {
      handleUpload(file, title, description);
    } else {
      alert("Missing title/description or file");
    }
  };

  const handleUpload = async (file: File, title: string, description: string) => {
    try {
      // You might need to modify uploadVideo to accept and handle title and description.
      const response = await uploadVideo(file, title, description);
      console.log(`File uploaded successfully. Response: ${JSON.stringify(response)}`);
    } catch (error) {
      alert(`Failed to upload file: ${error}`);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Upload Video</h1> 
      <div className={formStyles.formContainer}>
        <form onSubmit={handleSubmit}>
          <h2>Please select a video to upload</h2>
          <input
            id="videoFile"
            className={formStyles.fileInput}
            type="file"
            accept="video/*"
            required
            onChange={handleFileChange}
          />
          {/* TODO: add progress bar for video and thumbnail upload */}
          <progress id="uploadProgress" value={uploadProgress} max="100"></progress>
          <br />
          <h3>*Optional: select a thumbnail</h3>
          <input
            id="thumbnailFile"
            className={formStyles.fileInput}
            type="file"
            accept="image/*"
          />
          <br />
          <h2>Provide a title for the video</h2>
          <input
            id="title"
            className={formStyles.titleInput}
            type="text"
            placeholder="Enter video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <br />
          <h2>Provide a description for the video</h2>
          <textarea
            id="description"
            className={formStyles.textInput}
            placeholder="Enter video description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <button type="submit" className={formStyles.uploadButton}>
            Upload
          </button>
        </form>
      </div>
    </div>
  );


}