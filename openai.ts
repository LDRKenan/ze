import OpenAI from "openai";
import { Course, Progress } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CourseRecommendation {
  courseId: number;
  confidence: number;
  reason: string;
}

interface LearningAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ContentPersonalization {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  suggestedPace: string;
}

export async function getPersonalizedRecommendations(
  completedCourses: Course[],
  availableCourses: Course[],
  userProgress: Progress[]
): Promise<CourseRecommendation[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational AI assistant that provides personalized course recommendations. Analyze the user's completed courses and suggest the most relevant next courses from the available options."
        },
        {
          role: "user",
          content: JSON.stringify({
            completed: completedCourses,
            available: availableCourses.filter(c => !completedCourses.find(cc => cc.id === c.id)),
            progress: userProgress
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations as CourseRecommendation[];
  } catch (error) {
    console.error("Failed to get course recommendations:", error);
    throw new Error("Failed to generate course recommendations");
  }
}

export async function analyzeLearningProgress(
  userId: number,
  completedCourses: Course[],
  progress: Progress[]
): Promise<LearningAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the user's learning progress and provide insights on strengths, weaknesses, and recommendations for improvement."
        },
        {
          role: "user",
          content: JSON.stringify({
            completedCourses,
            progress
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as LearningAnalysis;
  } catch (error) {
    console.error("Failed to analyze learning progress:", error);
    throw new Error("Failed to analyze learning progress");
  }
}

export async function personalizeContent(
  courseId: number,
  userId: number,
  previousProgress: Progress[]
): Promise<ContentPersonalization> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Based on the user's learning history and progress, provide personalized content recommendations and learning pace suggestions."
        },
        {
          role: "user",
          content: JSON.stringify({
            courseId,
            previousProgress
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as ContentPersonalization;
  } catch (error) {
    console.error("Failed to personalize content:", error);
    throw new Error("Failed to generate personalized content recommendations");
  }
}

export async function generateAdaptiveFeedback(
  courseId: number,
  userId: number,
  currentProgress: Progress,
  recentActivity: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate personalized feedback and encouragement based on the user's current progress and recent activity in the course."
        },
        {
          role: "user",
          content: JSON.stringify({
            courseId,
            progress: currentProgress,
            recentActivity
          })
        }
      ]
    });

    return response.choices[0].message.content || "Keep up the good work!";
  } catch (error) {
    console.error("Failed to generate adaptive feedback:", error);
    throw new Error("Failed to generate personalized feedback");
  }
}

export async function suggestLearningPath(
  userId: number,
  interests: string[],
  currentSkillLevel: string
): Promise<Course[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Create a personalized learning path based on the user's interests and current skill level."
        },
        {
          role: "user",
          content: JSON.stringify({
            interests,
            skillLevel: currentSkillLevel
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.suggestedCourses as Course[];
  } catch (error) {
    console.error("Failed to suggest learning path:", error);
    throw new Error("Failed to generate learning path suggestions");
  }
}

export default {
  chat: openai.chat,
  getPersonalizedRecommendations,
  analyzeLearningProgress,
  personalizeContent,
  generateAdaptiveFeedback,
  suggestLearningPath
};