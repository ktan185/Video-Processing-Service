import express from "express";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  // Get the bucket and filename from the Cloud Pub/Sub message.
  let data;
  const message = Buffer.from(req.body.message.data, "base64").toString('utf8');
  data = JSON.parse(message);
  try {
    if (!data.name) {
      throw new Error('Invalid message payload recieved');
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send(`Bad Request: missing filename.`);
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split('.')[0];

  if (!isVideoNew(videoId)) {
    return res.status(400).send('Bad Request: video already processed.');
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split('-')[0],
      status: 'processing'
    });
  }

  // Download the raw video from Cloud Storage.
  await downloadRawVideo(inputFileName);

  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);

    console.error(err);
    return res.status(500).send(`Internal Server Error: video processing failed.`);
  }

  // Upload the processed video to Cloud Storage.
  await uploadProcessedVideo(outputFileName);
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ]);

  return res.status(200).send(`Video processed successfully.`);
});


const port = process.env.PORT || 3000; // Choose between ports.
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`);
});