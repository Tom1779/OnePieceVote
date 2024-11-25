export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
      timeout: 10000, // 10-second timeout
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        // Add more headers if needed
        Accept: "image/*",
        Referer: "https://example.com", // Sometimes helps bypass restrictions
      },
    });

    // Validate content type
    const contentType = response.headers["content-type"];
    if (!contentType || !contentType.startsWith("image/")) {
      return res.status(400).json({ error: "Not an image" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Optional: cache images for a day
    response.data.pipe(res);
  } catch (error) {
    console.error("Image proxy error:", error);

    // More detailed error logging
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }

    // Send a 500 status with the original image URL to help debug
    res.status(500).json({
      error: "Failed to fetch image",
      originalUrl: url,
      details: error.message,
    });
  }
}
