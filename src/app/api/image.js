export default async function handler(req, res) {
  const imageUrl = decodeURIComponent(req.query.url);

  const response = await fetch(imageUrl);
  const buffer = await response.buffer();

  res.setHeader("Content-Type", response.headers.get("content-type"));
  res.send(buffer);
}
