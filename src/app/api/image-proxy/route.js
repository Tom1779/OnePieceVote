import axios from "axios";

export default async function handler(req, res) {
  const { url } = req.query;

  try {
    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Set the content type from the original image
    res.setHeader("Content-Type", response.headers["content-type"]);

    // Pipe the image stream directly to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Image proxy error:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
}
