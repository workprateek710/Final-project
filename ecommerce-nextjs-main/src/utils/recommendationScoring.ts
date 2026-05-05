export type RecommendationProductSource = {
  name: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  description?: string;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function productText(product: RecommendationProductSource) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.brand,
    product.description,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildTfIdfVectors(products: RecommendationProductSource[]) {
  const documents = products.map((product) => tokenize(productText(product)));
  const docFreq = new Map<string, number>();

  for (const tokens of documents) {
    for (const token of new Set(tokens)) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }

  const totalDocs = Math.max(1, documents.length);
  return documents.map((tokens) => {
    const counts = new Map<string, number>();
    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }

    const vector = new Map<string, number>();
    for (const [token, count] of counts) {
      const tf = count / Math.max(1, tokens.length);
      const idf = Math.log((1 + totalDocs) / (1 + (docFreq.get(token) ?? 0))) + 1;
      vector.set(token, tf * idf);
    }
    return vector;
  });
}

export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;
  for (const [token, value] of a) {
    dot += value * (b.get(token) ?? 0);
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
