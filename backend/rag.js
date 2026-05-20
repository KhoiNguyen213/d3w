import { ChromaClient } from "chromadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const chroma = new ChromaClient({
  path: "http://localhost:8000",
});

let collection = null;

// =========================
// KHỞI TẠO RAG
// =========================

export const initRAG = async () => {
  try {
    collection = await chroma.getOrCreateCollection({
      name: "family_psychology_tips",
    });

    const count = await collection.count();

    // tránh add lặp khi restart

    if (count === 0) {
      const tips = [
        {
          id: "1",
          text: "Khi nói về điểm số, hãy ghi nhận nỗ lực của con trước khi đánh giá kết quả.",
        },

        {
          id: "2",
          text: "Cha mẹ nên lắng nghe trước khi đưa lời khuyên.",
        },

        {
          id: "3",
          text: "Tuổi dậy thì cần sự riêng tư và tôn trọng.",
        },

        {
          id: "4",
          text: "Quy tắc dùng điện thoại nên được thống nhất hai chiều.",
        },
      ];

      await collection.add({
        ids: tips.map((t) => t.id),

        documents: tips.map((t) => t.text),

        metadatas: tips.map(() => ({ source: "expert" })),
      });

      console.log("Added RAG knowledge");
    }

    console.log("RAG initialized");
  } catch (err) {
    console.log("RAG init failed:", err.message);
  }
};

// =========================
// AI TƯ VẤN
// =========================

export const generateAdvice = async (
  question,
  parentAns,
  parentEmo,
  childAns,
  childEmo,
) => {
  try {
    let retrievedTips = "";

    // ---------- RAG SEARCH ----------

    if (collection) {
      const result = await collection.query({
        queryTexts: [
          `${question}
${parentAns}
${childAns}`,
        ],

        nResults: 2,
      });

      retrievedTips = result.documents[0]?.join(" | ") || "";
    }

    // ---------- SUMMARY ----------

    const summaryPrompt = `

Câu hỏi:

${question}

Cha mẹ:
${parentAns}

Con:
${childAns}

Tóm tắt vấn đề trong 1 câu.

`;

    const summary = await model.generateContent(summaryPrompt);

    const problemSummary = summary.response.text();

    // ---------- ADVICE ----------

    const prompt = `

Bạn là chuyên gia tâm lý gia đình.

KHÔNG phán xét.

Vấn đề:

${problemSummary}

Cha mẹ cảm xúc:

${parentEmo}

Con cảm xúc:

${childEmo}

Kiến thức:

${retrievedTips}



Trả về HTML:

<p>
<strong>
💡 Nhận định:
</strong>
...
</p>

<div>

<b>Cha mẹ:</b>

...

</div>

<div>

<b>Con:</b>

...

</div>

<div>

<ul>

<li>
Lời khuyên cha mẹ
</li>

<li>
Lời khuyên con
</li>

</ul>

</div>

`;

    const response = await model.generateContent(prompt);

    return response.response
      .text()
      .replace(/```html|```/g, "")
      .trim();
  } catch (err) {
    console.log(err);

    return `
<p>
Lỗi AI.
Vui lòng thử lại.
</p>
`;
  }
};
