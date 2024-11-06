// app/api/chatGPT.js

export async function fetchChatGPTResponse(question, artistName, artworkTitle, messages = []) {
    console.log("Request payload:", { question, artistName, artworkTitle, messages }); // messages 확인용 로그 추가

    try {
      const response = await fetch('/api/chatGPT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          artistName,
          artworkTitle,
          messages, 
        }),
      });
  
      const data = await response.json();
      return {
        answer: data.answer || "I'm sorry, I couldn't retrieve a proper response.",
        questionExamples: data.questionExamples || [],
      };
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
      return { answer: "I'm sorry, I couldn't retrieve the response.", questionExamples: [] };
    }
  }
  