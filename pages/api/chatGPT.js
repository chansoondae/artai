import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // req.body 확인용 로그 추가
  console.log("Request body received at server:", req.body);

  const { question, artistName, artworkTitle, imageUrl, messages = [] } = req.body;

  // messages가 실제로 있는지 확인
  console.log("messages in request body:", messages);

  try {
    // 기존 대화 히스토리를 포함하여 새 메시지 생성
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable exhibition docent. Provide a detailed responses in Korean, ideally between 3 and 15 sentences. Then, provide exactly three related questions as examples. Please mark '++##++' between the answer and the expected questions and make 3 questions with <1>, <2>, and <3>."
        },
        ...messages, // 기존 대화 히스토리를 추가합니다.
        {
          role: "user",
          content: question,
          // content: `작가: ${artistName}, 작품: ${artworkTitle}, 이미지 URL: ${imageUrl ? imageUrl : "없음"}. 이 작품 이미지 URL을 보고 작품에 대한 설명을 부탁드립니다. ${question}`
        },
      ],
      max_tokens: 1028,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content.trim();

    // ChatGPT 응답을 파싱하여 답변과 질문 예시 3개를 추출
    const [answer, rawQuestions] = responseText.split("++##++").map(text => text.trim());

    // Process rawQuestions by splitting based on <1>, <2>, <3> markers to form the array
    const questionExamples = rawQuestions
      ? rawQuestions.split(/<\d+>/).filter(Boolean).map(question => question.trim())
      : []; // If rawQuestions is empty or undefined, default to an empty array

    res.status(200).json({ answer, questionExamples });
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
    res.status(500).json({ message: "Error fetching response from ChatGPT" });
  }
}
