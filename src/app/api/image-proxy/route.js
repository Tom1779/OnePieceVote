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
    // Try multiple URL variations
    const urlVariations = [
      url, // Original URL
      url.replace(/\/revision\/latest\/scale-to-width-down\/\d+/, ""), // Remove scaling
      url.split("?")[0], // Remove query parameters
    ];

    let successfulResponse = null;

    for (const tryUrl of urlVariations) {
      try {
        console.log("Attempting to fetch image from:", tryUrl);

        const response = await axios({
          method: "get",
          url: tryUrl,
          responseType: "arraybuffer",
          timeout: 15000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          },
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "image/*",
            Referer: "https://onepiece.fandom.com/",
            Origin: "https://onepiece.fandom.com",
          },
        });

        // Check if it's a valid image
        const contentType = response.headers["content-type"];
        if (contentType && contentType.startsWith("image/")) {
          successfulResponse = response;
          break;
        }
      } catch (attemptError) {
        console.log(`Attempt with URL ${tryUrl} failed:`, attemptError.message);
        continue;
      }
    }

    if (!successfulResponse) {
      throw new Error("Could not fetch image from any variation of the URL");
    }

    const contentType = successfulResponse.headers["content-type"];
    console.log("Received Content Type:", contentType);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.status(200).send(successfulResponse.data);
  } catch (error) {
    console.error("Proxy Error Details:", {
      message: error.message,
      name: error.name,
      code: error.code,
    });

    res.status(500).json({
      error: "Failed to fetch image",
      details: error.message,
    });
  }
}
