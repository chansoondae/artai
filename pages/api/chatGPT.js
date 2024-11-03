// pages/api/chatGPT.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { question, artistName, artworkTitle } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a knowledgeable exhibition docent. Provide brief responses in Korean and include exactly three related questions as examples, without any introductory text, numbering, or leading characters." 
        },
        { 
          role: "user", 
          content: `작가: ${artistName}, 작품: ${artworkTitle}에 대한 전시해설을 부탁드립니다. ${question}` 
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    

    const responseText = completion.choices[0]?.message?.content.trim();

    // ChatGPT 응답을 파싱하여 답변과 질문 예시 3개를 추출
    const [answer, ...questionExamples] = responseText.split("\n").filter(Boolean);

    res.status(200).json({ answer, questionExamples });
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
    res.status(500).json({ message: "Error fetching response from ChatGPT" });
  }
}
