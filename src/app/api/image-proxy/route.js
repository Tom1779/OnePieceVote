import axios from "axios";
import { URL } from "url";

export default async function handler(req, res) {
  // Enhanced CORS handling
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight CORS handling
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
    // Validate URL
    const parsedUrl = new URL(url);

    // Optional: Add domain whitelist
    const allowedDomains = [
      "static.wikia.nocookie.net",
      "your-other-allowed-domain.com",
    ];
    if (!allowedDomains.some((domain) => parsedUrl.hostname.includes(domain))) {
      return res.status(403).json({ error: "Domain not allowed" });
    }

    console.log("Attempting to fetch image from:", url);

    const response = await axios({
      method: "get",
      url,
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/*",
        Referer: parsedUrl.origin,
        // Add custom headers for specific domains if needed
        ...(parsedUrl.hostname.includes("wikia.nocookie.net") && {
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
        }),
      },
    });

    const contentType = response.headers["content-type"];
    console.log("Content Type:", contentType);

    if (!contentType || !contentType.startsWith("image/")) {
      console.error("Not an image. Content Type:", contentType);
      return res.status(400).json({ error: "Not an image", contentType });
    }

    // Cache control and other headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Send the image data
    res.status(200).send(response.data);
  } catch (error) {
    console.error("Full Image Proxy Error:", {
      message: error.message,
      name: error.name,
      code: error.code,
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data,
    });

    // Comprehensive error handling
    if (error.response) {
      res.status(error.response.status).json({
        error: "Failed to fetch image",
        status: error.response.status,
        details: error.response.data,
      });
    } else if (error.request) {
      res.status(500).json({
        error: "No response received",
        details: "The image URL did not respond",
      });
    } else {
      res.status(500).json({
        error: "Error setting up request",
        details: error.message,
      });
    }
  }
}
