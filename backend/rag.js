import { ChromaClient } from "chromadb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// =========================
// CHROMA (optional)
// =========================

let chroma = null;
let collection = null;

try {
  chroma = new ChromaClient({
    path: "http://localhost:8000",
  });
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
      name: "family_psychology_tips",
    });

    const count = await collection.count();

    if (count === 0) {
      const tips = [
        {
          id: "1",
          text: "Khi nói về điểm số, hãy ghi nhận nỗ lực của con.",
        },

        {
          id: "2",
          text: "Cha mẹ nên lắng nghe trước khi đưa lời khuyên.",
        },

        {
          id: "3",
          text: "Tuổi dậy thì cần sự riêng tư.",
        },

        {
          id: "4",
          text: "Quy tắc dùng điện thoại nên thống nhất.",
        },
      ];

      await collection.add({
        ids: tips.map((t) => t.id),

        documents: tips.map((t) => t.text),

        metadatas: tips.map(() => ({ source: "expert" })),
      });

      console.log("RAG knowledge added");
    }

    console.log("RAG initialized");
  } catch (err) {
    console.log("RAG disabled:", err.message);

    collection = null;
  }
};

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
    let retrievedTips = "";

    // -------- RAG SEARCH -------

    if (collection) {
      try {
        const result = await collection.query({
          queryTexts: [
            `${question}
${parentAns}
${childAns}`,
          ],

          nResults: 2,
        });

        retrievedTips = result.documents[0]?.join(" | ") || "";
      } catch {
        retrievedTips = "";
      }
    }

    // -------- ONE GEMINI CALL -----

    const prompt = `

Bạn là chuyên gia tâm lý gia đình.

Không phán xét.

Câu hỏi:
${question}

Cha mẹ:
${parentAns}

Con:
${childAns}

Cảm xúc cha mẹ:
${parentEmo}

Cảm xúc con:
${childEmo}

Kiến thức:
${retrievedTips}

Trả về HTML:

<p><strong>
💡 Nhận định:
</strong></p>

<div>
<b>Cha mẹ:</b>
...
</div>

<div>
<b>Con:</b>
...
</div>

<ul>
<li>Lời khuyên cha mẹ</li>
<li>Lời khuyên con</li>
</ul>

`;

    const response = await model.generateContent(prompt);

    return response.response
      .text()
      .replace(/```html|```/g, "")
      .trim();
  } catch (err) {
    console.log("Gemini error:", err.message);

    // fallback khi hết quota

    return `
<p>
⚠️ AI hiện tạm thời quá tải.
</p>

<div>
<b>Gợi ý:</b>

<ul>
<li>
Hãy lắng nghe trước khi phản hồi.
</li>

<li>
Tránh phán xét cảm xúc.
</li>

<li>
Trao đổi khi cả hai bình tĩnh.
</li>

</ul>

</div>
`;
  }
};
