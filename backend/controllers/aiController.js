const AiDocument = require("../models/AiDocument");
const AiChat = require("../models/AiChat");
const pdfParse = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini API (Make sure GEMINI_API_KEY is in .env)
const ai = new GoogleGenAI({});

exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user._id;
    const title = req.body.title || req.file.originalname;

    // 1. Parse PDF Text
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    // 2. Generate Roadmap and Flashcards using Gemini
    const prompt = `
      You are an expert tutor. Analyze the following text extracted from a study document.
      Generate:
      1. A study roadmap (a list of topics and short descriptions).
      2. A set of 5-10 flashcards (questions and answers).
      
      Return ONLY a valid JSON object matching this schema exactly:
      {
        "roadmap": [ { "topic": "string", "description": "string" } ],
        "flashcards": [ { "question": "string", "answer": "string" } ]
      }
      
      Document text:
      ${extractedText.substring(0, 50000)} // Limit length if necessary
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let responseText = response.text;
    // Remove markdown code block if Gemini adds it
    responseText = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    
    let aiResult;
    try {
      aiResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON. Response was:", responseText);
      throw new Error("AI returned invalid data format. Please try again.");
    }

    // 3. Save to Database
    const newDoc = new AiDocument({
      user: userId,
      title,
      extractedText,
      roadmap: aiResult.roadmap,
      flashcards: aiResult.flashcards,
    });

    await newDoc.save();

    res.status(201).json(newDoc);
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Failed to process PDF: " + (error.message || error.toString()) });
  }
};

exports.chatWithDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const document = await AiDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Save user message
    const userMessage = new AiChat({
      user: userId,
      document: documentId,
      role: "user",
      text: message
    });
    await userMessage.save();

    // Retrieve previous chat history
    const history = await AiChat.find({ document: documentId }).sort({ createdAt: 1 });
    
    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Start chat session with context
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: `You are an AI study assistant. Your task is to answer the user's questions strictly based on the following document content. If the answer is not in the document, say so politely.\n\nDocument Context:\n${document.extractedText.substring(0, 30000)}`
        }
    });

    const response = await chat.sendMessage({ message: message });
    const modelText = response.text;

    // Save model response
    const modelMessage = new AiChat({
      user: userId,
      document: documentId,
      role: "model",
      text: modelText
    });
    await modelMessage.save();

    res.status(200).json(modelMessage);

  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat message." });
  }
};

exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await AiDocument.find({ user: req.user._id })
      .select('title createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents." });
  }
};

exports.getDocumentDetails = async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await AiDocument.findById(documentId).select('-extractedText'); // Exclude full text to save bandwidth
    
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    const chatHistory = await AiChat.find({ document: documentId }).sort({ createdAt: 1 });

    res.status(200).json({ document, chatHistory });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document details." });
  }
};
