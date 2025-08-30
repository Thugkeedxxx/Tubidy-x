const express = require("express");
const ytdl = require("ytdl-core");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Your YouTube API key (set in Render env)
const YT_API_KEY = process.env.YT_API_KEY || "YOUR_YOUTUBE_API_KEY";

app.use(express.static("public"));

// Search endpoint using YouTube API
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  try {
    const ytRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: YT_API_KEY,
        q: query,
        part: "snippet",
        maxResults: 10,
        type: "video"
      }
    });

    const results = ytRes.data.items.map(item => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      videoId: item.id.videoId
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "YouTube API error" });
  }
});

// Download endpoint
app.get("/download", async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).send("No videoId provided");

  try {
    const info = await ytdl.getInfo(videoId);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "").substring(0, 50);
    res.header("Content-Disposition", `attachment; filename="${title}.mp3"`);
    res.header("Content-Type", "audio/mpeg");

    ytdl(videoId, { filter: "audioonly" }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 TUBIDY-X running on port ${PORT}`));
