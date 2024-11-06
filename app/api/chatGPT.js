// app/api/chatGPT.js

export async function fetchChatGPTResponse(question, artistName, artworkTitle, messages = []) {

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
  