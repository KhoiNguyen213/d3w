import { ChromaClient } from 'chromadb';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chroma = new ChromaClient();
let collection = null;

// Khởi tạo ChromaDB và nhúng các nguyên tắc tâm lý học mẫu
export const initRAG = async () => {
  try {
    collection = await chroma.getOrCreateCollection({
      name: "family_psychology_tips",
    });

    // Dữ liệu mẫu (kiến thức chuyên gia)
    const tips = [
      { id: "1", text: "Khi nói về điểm số, hãy ghi nhận sự nỗ lực của con trước khi phân tích kết quả. Tránh so sánh con với người khác." },
      { id: "2", text: "Về thời gian sử dụng điện thoại, hãy thảo luận quy tắc chung thay vì cấm đoán cực đoan. Phụ huynh cũng nên làm gương." },
      { id: "3", text: "Tuổi dậy thì cần không gian riêng tư. Việc cha mẹ can thiệp quá sâu sẽ gây phản tác dụng và tạo rào cản." },
      { id: "4", text: "Giao tiếp hiệu quả bắt đầu bằng việc lắng nghe không ngắt lời. Đừng đưa ra giải pháp ngay, hãy hỏi con cảm thấy thế nào." }
    ];

    // Tạo vector embeddings bằng OpenAI và lưu vào Chroma
    for (const tip of tips) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: tip.text,
      });

      await collection.add({
        ids: [tip.id],
        embeddings: [embeddingResponse.data[0].embedding],
        metadatas: [{ source: "expert_guideline" }],
        documents: [tip.text],
      });
    }
    console.log("RAG system initialized with psychological tips.");
  } catch (error) {
    console.error("Error initializing RAG:", error);
  }
};

export const generateAdvice = async (question, parentAns, parentEmo, childAns, childEmo) => {
  try {
    // 1. Phân tích ngữ cảnh & Phân loại vấn đề bằng OpenAI
    const contextPrompt = `
      Chủ đề đối thoại gia đình.
      Câu hỏi: "${question}"
      Cha mẹ trả lời: "${parentAns}" (Cảm xúc: ${parentEmo})
      Con cái trả lời: "${childAns}" (Cảm xúc: ${childEmo})
      Hãy tóm tắt ngắn gọn vấn đề cốt lõi đang xảy ra (1 câu).
    `;

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: contextPrompt }],
    });

    const problemSummary = summaryResponse.choices[0].message.content;

    // 2. RAG - Truy vấn ChromaDB để tìm lời khuyên phù hợp
    let retrievedTips = "";
    if (collection) {
      const queryEmbedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: problemSummary,
      });

      const results = await collection.query({
        queryEmbeddings: [queryEmbedding.data[0].embedding],
        nResults: 2,
      });

      retrievedTips = results.documents[0].join(' | ');
    }

    // 3. Tạo lời khuyên chữa lành từ OpenAI (Đầu ra dạng HTML như Frontend yêu cầu)
    const advicePrompt = `
      Bạn là chuyên gia tâm lý học gia đình thấu cảm, đóng vai trò hòa giải trung lập, KHÔNG TRÁCH CỨ.
      Vấn đề cốt lõi: ${problemSummary}
      Cha mẹ cảm thấy: ${parentEmo} - Trả lời: "${parentAns}"
      Con cái cảm thấy: ${childEmo} - Trả lời: "${childAns}"
      Tài liệu tham khảo (Expert tips): ${retrievedTips}

      Nhiệm vụ: Trả về ĐÚNG định dạng HTML sau (không dùng markdown code block, chỉ trả về chuỗi HTML):
      
      <p style="margin-bottom: 12px;"><strong>💡 Nhận định từ AI:</strong> [Nhận định chung 1 câu về sự bất đồng hoặc đồng điệu]</p>
      
      <div style="margin-bottom: 14px; padding-left: 12px; border-left: 3px solid var(--secondary);">
        <span style="font-weight: 600; font-size: 13px; color: var(--secondary); display: block; text-transform: uppercase;">Góc nhìn của Cha mẹ:</span>
        <p style="font-size: 14px; font-style: italic;">"[Lý giải thấu cảm động cơ của cha mẹ]"</p>
      </div>

      <div style="margin-bottom: 14px; padding-left: 12px; border-left: 3px solid var(--primary);">
        <span style="font-weight: 600; font-size: 13px; color: var(--primary); display: block; text-transform: uppercase;">Góc nhìn của Con cái:</span>
        <p style="font-size: 14px; font-style: italic;">"[Lý giải thấu cảm động cơ của con]"</p>
      </div>

      <div style="background-color: var(--accent-light); padding: 12px; border-radius: 12px; margin-top: 10px;">
        <span style="font-weight: 700; color: var(--accent); display: block; font-size: 14px; margin-bottom: 6px;">🌱 Cùng Thay Đổi Để Gần Nhau Hơn:</span>
        <ul style="padding-left: 18px; margin: 0; font-size: 13.5px; display: flex; flex-direction: column; gap: 4px;">
          <li><strong>Dành cho Cha mẹ:</strong> [1 Lời khuyên cụ thể, hành động nhỏ]</li>
          <li><strong>Dành cho Con cái:</strong> [1 Lời khuyên cụ thể, hành động nhỏ]</li>
        </ul>
      </div>
    `;

    const adviceResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: advicePrompt }],
      temperature: 0.7
    });

    return adviceResponse.choices[0].message.content.replace(/```html|```/g, '').trim();

  } catch (error) {
    console.error("Error generating advice:", error);
    return `<p>Lỗi kết nối AI. Vui lòng thử lại sau.</p>`;
  }
};
