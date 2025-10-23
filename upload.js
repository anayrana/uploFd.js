import fetch from "node-fetch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY;
const SHEET_URL = process.env.SHEET_URL;

async function getSheetData() {
  const csvUrl = SHEET_URL.replace("/pubhtml", "/pub?output=csv");
  const res = await fetch(csvUrl);
  const text = await res.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows.shift();
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => (obj[h.trim()] = row[i]?.trim()));
    return obj;
  });
}

async function uploadToMeili(data) {
  const response = await fetch(`${MEILISEARCH_HOST}/indexes/MANHWA/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MEILISEARCH_MASTER_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error("Failed to upload:", await response.text());
  } else {
    console.log("✅ Successfully uploaded", data.length, "documents!");
  }
}

(async () => {
  console.log("🚀 Upload script started...");
  const data = await getSheetData();
  console.log("Fetched rows:", data.length);
  await uploadToMeili(data);
})();
