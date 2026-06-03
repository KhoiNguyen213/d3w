import { ChromaClient } from "chromadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
console.log(
  "GEMINI KEY:",
  process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.slice(0, 10)
    : "UNDEFINED",
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// =========================
// GEMINI MODELS
// =========================

const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

// =========================
// CHROMA
// =========================

let chroma = null;
let collection = null;

try {
  chroma = new ChromaClient({
    path: "http://localhost:8000",
  });

  console.log("Chroma connected");
} catch {
  console.log("Chroma disabled");
}

// =========================
// INIT RAG
// =========================

export const initRAG = async () => {
  try {
    if (!chroma) return;

    collection = await chroma.getOrCreateCollection({
      name: "family_psychology",
    });

    const count = await collection.count();

    if (count > 0) {
      console.log("RAG exists");
      return;
    }

    const docs = [
      "Cha mẹ nên ghi nhận nỗ lực thay vì chỉ điểm số.",
      "Tuổi dậy thì cần được tôn trọng cảm xúc.",
      "So sánh con với người khác dễ tạo áp lực.",
      "Lắng nghe trước khi góp ý giúp tăng kết nối.",
      "Thiếu giao tiếp lâu dài tạo khoảng cách gia đình.",
      "Áp lực học tập kéo dài ảnh hưởng tâm lý.",
      "Kỷ luật hiệu quả cần đi kèm giải thích.",
      "Con cái thường muốn được thấu hiểu hơn bị kiểm soát.",
      "Quy tắc điện thoại nên thống nhất hai bên.",
      "Cha mẹ nên hỏi cảm xúc trước khi hỏi kết quả.",
    ];

    const embeddings = await Promise.all(
      docs.map(async (doc) => {
        const e = await embeddingModel.embedContent(doc);

        return e.embedding.values;
      }),
    );

    await collection.add({
      ids: docs.map((_, i) => `${i}`),

      documents: docs,

      embeddings,

      metadatas: docs.map(() => ({
        source: "expert",
      })),
    });

    console.log("RAG initialized");
  } catch (err) {
    console.log("Init RAG error:", err.message);

    collection = null;
  }
};

// =========================
// SEARCH KNOWLEDGE
// =========================

async function searchKnowledge(question, parentAns, childAns) {
  try {
    if (!collection) return "";

    const query = `
${question}

Cha mẹ:
${parentAns}

Con:
${childAns}
`;

    const embedding = await embeddingModel.embedContent(query);

    const result = await collection.query({
      queryEmbeddings: [embedding.embedding.values],

      nResults: 3,
    });

    return result.documents[0]?.join("\n") || "";
  } catch {
    return "";
  }
}

// =========================
// GENERATE ADVICE
// =========================

export const generateAdvice = async (
  question,

  parentAns,
  parentEmo,

  childAns,
  childEmo,
) => {
  try {
    const knowledge = await searchKnowledge(question, parentAns, childAns);

    const prompt = `

Bạn là chuyên gia tâm lý gia đình.

Mục tiêu:

- tăng thấu hiểu
- không phán xét
- phát hiện khoảng cách cảm xúc
- đưa lời khuyên thực tế

Thông tin:

Câu hỏi:
${question}

Cha mẹ:
${parentAns}

Cảm xúc:
${parentEmo}

Con:
${childAns}

Cảm xúc:
${childEmo}

Kiến thức:

${knowledge}


Phân tích:

1. Điểm giống nhau
2. Khác biệt suy nghĩ
3. Mức độ thấu hiểu (0-100)
4. Điểm tin tưởng (0-100)
5. Nguy cơ xung đột (0-100)
6. Lời khuyên cha mẹ
7. Lời khuyên con
8. Hành động cả hai nên làm

Trả JSON:

{

"similarity":"",
"understanding":0,

"trust":0,

"conflict":0,

"parentAdvice":"",

"childAdvice":"",

"action":""

}

Chỉ trả JSON.

`;

    const response = await chatModel.generateContent(prompt);

    const text = response.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);

    return {
      success: true,

      similarity: parsed.similarity,

      understanding: parsed.understanding,

      trust: parsed.trust,

      conflict: parsed.conflict,

      parentAdvice: parsed.parentAdvice,

      childAdvice: parsed.childAdvice,

      action: parsed.action,
    };
  } catch (err) {
    console.error("GEMINI ERROR FULL:");
    console.error(err);

    // fallback thông minh

    let advice = "Hãy dành thời gian lắng nghe.";

    if (childEmo?.includes("buồn")) {
      advice = "Con có thể đang cần được chia sẻ nhiều hơn.";
    }

    if (parentEmo?.includes("giận")) {
      advice = "Phản hồi sau khi bình tĩnh thường hiệu quả hơn.";
    }

    return {
      success: false,

      similarity: "Chưa đủ dữ liệu",

      understanding: 50,

      trust: 50,

      conflict: 50,

      parentAdvice: advice,

      childAdvice: "Thử diễn đạt cảm xúc thay vì im lặng.",

      action: "Dành 10 phút nói chuyện không phán xét.",
    };
  }
};
