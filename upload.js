import fetch from "node-fetch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY;
const SHEET_URL = process.env.SHEET_URL;

async function getSheetData() {
  const csvUrl = SHEET_URL;
  const res = await fetch(csvUrl);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows.shift().map(h => h.trim());

  return rows
    .map(row => {
      let obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]?.trim()));
      return obj;
    })
    .filter(item => item.id && item.title); // only valid entries
}

async function uploadToMeili(data) {
  // 1️⃣ Create index (if not already exists)
  await fetch(`${MEILISEARCH_HOST}/indexes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MEILISEARCH_MASTER_KEY}`,
    },
    body: JSON.stringify({
      uid: "manhwa",
      primaryKey: "id",
    }),
  });

  // 2️⃣ Upload documents
  const response = await fetch(`${MEILISEARCH_HOST}/indexes/manhwa/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MEILISEARCH_MASTER_KEY}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error("❌ Upload failed:", await response.text());
  } else {
    console.log("✅ Successfully uploaded", data.length, "documents!");
  }

  // 3️⃣ Set searchable and displayed attributes
  await fetch(`${MEILISEARCH_HOST}/indexes/manhwa/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MEILISEARCH_MASTER_KEY}`,
    },
    body: JSON.stringify({
      searchableAttributes: ["title", "tags", "description", "genre"],
      displayedAttributes: ["id", "title", "coverImage", "description", "tags", "genre"],
    }),
  });

  console.log("⚙️ Index settings updated!");
}

(async () => {
  console.log("🚀 Upload script started...");
  const data = await getSheetData();
  console.log("📄 Fetched rows:", data.length);
  await uploadToMeili(data);
})();
