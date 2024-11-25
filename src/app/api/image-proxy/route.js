import axios from "axios";

export default async function handler(req, res) {
  // CORS and preflight handling
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { url } = req.query;

  console.log("Image proxy request received for URL:", url);

  if (!url) {
    console.error("No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  try {
    console.log("Attempting to fetch image from:", url);

    const response = await axios({
      method: "get",
      url: url,
      responseType: "arraybuffer",
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/*",
        Referer: new URL(url).origin,
        Origin: new URL(url).origin,
        // Add additional headers to mimic a browser request
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
      },
    });

    // More robust content type checking
    const contentType = response.headers["content-type"]?.toLowerCase();
    console.log("Received Content Type:", contentType);

    // Validate content type more flexibly
    if (
      !contentType ||
      (!contentType.startsWith("image/") && !contentType.includes("image"))
    ) {
      console.error("Invalid content type:", contentType);
      return res.status(400).json({ error: "Not a valid image" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.status(200).send(response.data);
  } catch (error) {
    console.error("Proxy Error Details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Failed to fetch image",
      details: error.message,
    });
  }
}
