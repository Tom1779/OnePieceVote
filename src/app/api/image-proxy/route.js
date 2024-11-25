import axios from "axios";

export default async function handler(req, res) {
  // CORS and preflight handling (same as previous version)
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
    // Special handling for Wikia URLs
    const isWikiaUrl = url.includes("wikia.nocookie.net");

    const requestConfig = {
      method: "get",
      url,
      responseType: "arraybuffer",
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/*",
        Referer: isWikiaUrl ? "https://onepiece.fandom.com/" : url,
        ...(isWikiaUrl && {
          Origin: "https://onepiece.fandom.com",
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "cross-site",
        }),
      },
    };

    console.log("Request Config:", JSON.stringify(requestConfig, null, 2));

    const response = await axios(requestConfig);

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    const contentType = response.headers["content-type"];
    console.log("Received Content Type:", contentType);

    if (!contentType || !contentType.startsWith("image/")) {
      console.error("Not an image. Content Type:", contentType);
      return res.status(400).json({
        error: "Not an image",
        contentType,
        headers: response.headers,
      });
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
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data,
    });

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
