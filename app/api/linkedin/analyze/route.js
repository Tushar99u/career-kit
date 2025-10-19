import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { profileData } = await req.json();

    if (!profileData) {
      return NextResponse.json(
        { error: "Profile data is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a professional LinkedIn profile optimizer. Analyze this LinkedIn profile data and provide optimization suggestions in a structured format:

Profile Data:
Headline: ${profileData.headline}
Summary: ${profileData.summary}
Experience: ${profileData.experience.join("\n")}
Skills: ${profileData.skills.join(", ")}

Please provide your suggestions in exactly this format (do not add any additional text or explanations):

HEADLINE:
[Your optimized headline suggestion]

KEYWORDS:
- [Keyword 1]
- [Keyword 2]
- [Keyword 3]

EXPERIENCE:
- [Improved experience point 1]
- [Improved experience point 2]
- [Improved experience point 3]

SUMMARY:
[Your optimized summary suggestion]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse the response into sections
    const sections = response.split("\n\n");
    
    let parsedData = {
      headline: "",
      keywords: [],
      experience: [],
      summary: ""
    };

    sections.forEach(section => {
      const trimmedSection = section.trim();
      
      if (trimmedSection.startsWith("HEADLINE:")) {
        parsedData.headline = trimmedSection.replace("HEADLINE:", "").trim();
      } else if (trimmedSection.startsWith("KEYWORDS:")) {
        parsedData.keywords = trimmedSection
          .replace("KEYWORDS:", "")
          .split("\n")
          .filter(line => line.trim().startsWith("-"))
          .map(line => line.replace("-", "").trim());
      } else if (trimmedSection.startsWith("EXPERIENCE:")) {
        parsedData.experience = trimmedSection
          .replace("EXPERIENCE:", "")
          .split("\n")
          .filter(line => line.trim().startsWith("-"))
          .map(line => line.replace("-", "").trim());
      } else if (trimmedSection.startsWith("SUMMARY:")) {
        parsedData.summary = trimmedSection.replace("SUMMARY:", "").trim();
      }
    });

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("LinkedIn optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize LinkedIn profile" },
      { status: 500 }
    );
  }
}