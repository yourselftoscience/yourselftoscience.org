// src/pages/api/fetchMeta.js (example)
export default async function handler(req, res) {
  const { doi } = req.query;
  const response = await fetch(`https://api.crossref.org/works/${doi}`);
  const data = await response.json();
  res.status(200).json(data.message);
}