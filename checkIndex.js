import fetch from "node-fetch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY;

async function checkIndex() {
  const response = await fetch(`${MEILISEARCH_HOST}/indexes/manhwa/stats`, {
    headers: {
      "Authorization": `Bearer ${MEILISEARCH_MASTER_KEY}`
    }
  });

  if (!response.ok) {
    console.error("Failed to fetch index stats:", await response.text());
  } else {
    const data = await response.json();
    console.log("✅ Index Stats:", data);
  }
}

checkIndex();
