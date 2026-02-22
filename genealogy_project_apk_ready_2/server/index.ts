import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";
import fs from "fs";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تهيئة OpenAI باستخدام الإعدادات الافتراضية في Manus
const client = new OpenAI();

// قراءة قاعدة البيانات لتزويد البوت بها
const dbPath = path.resolve(__dirname, "..", "dist", "public", "data", "genealogy_db_v2.json");
let genealogyData = "";
try {
    genealogyData = fs.readFileSync(dbPath, "utf-8");
} catch (err) {
    console.error("Failed to read genealogy DB:", err);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // تفعيل CORS للسماح بالاتصال من تطبيقات الهاتف (APK)
  app.use(cors());
  app.use(express.json());

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // نقطة نهاية للـ LLM (البوت mhf.ahmed)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `أنت خبير في أسرة 'أهل الطالب مختار'. تمت برمجتك وتطويرك بواسطة 'Mhf.ahmed وفريقه'.

قواعد صارمة جداً للرد (ممنوع مخالفتها):
1. أجب عن السؤال بالتحديد فقط. لا ترحب، لا تعرض المساعدة، لا تشرح، لا تزد حرفاً واحداً عما طُلب منك.
2. يمنع ذكر "قاعدة بيانات"، "فرع"، "سجلات"، "بيانات"، "مذكور في"، "JSON". المعلومات سرية وخاصة بك.
3. ابدأ إجابتك دائماً بـ: "أعلم أن..."، "أعلم أن لديه..."، "أعلم أن له..."، "ذكر لي أنه...".
4. المعلومات الوحيدة المسموحة:
${genealogyData}

5. الهوية:
   - من أنت؟ خبير في أسرة أهل الطالب مختار.
   - من برمجك؟ برمجني Mhf.ahmed وفريقه.

6. في حال عدم وجود المعلومة: قل "لا تتوفر لدي معلومات".`
          },
          {
            role: "user",
            content: message
          }
        ],
      });

      const reply = response.choices[0].message.content;
      res.json({ reply });
    } catch (error) {
      console.error("Error in LLM chat:", error);
      res.status(500).json({ error: "Failed to get response from LLM" });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
