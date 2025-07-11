import { NextRequest, NextResponse } from "next/server";
import { saveOnboardingQuizResults, getOnboardingQuizResults } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userUid, apClassId, quizData, answers } = await request.json();

    if (!userUid || !apClassId || !quizData || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse quiz results to extract structured data
    const quizResults = Object.entries(answers).map(([questionIndex, userAnswer]) => {
      const question = quizData.questions[parseInt(questionIndex)];
      const correctAnswer = question?.correct_answer || "";
      
      return {
        question: question?.question || "",
        unit_title: question?.unit || "",
        skill: question?.skill || "",
        user_answer: userAnswer as string,
        correct_answer: correctAnswer,
        is_correct: userAnswer === correctAnswer
      };
    });

    const savedResults = await saveOnboardingQuizResults(userUid, apClassId, quizResults);

    return NextResponse.json({ 
      success: true, 
      results: savedResults 
    });
  } catch (error) {
    console.error("Error saving onboarding quiz results:", error);
    return NextResponse.json(
      { error: "Failed to save quiz results" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userUid = searchParams.get("userUid");
    const apClassId = searchParams.get("apClassId");

    if (!userUid || !apClassId) {
      return NextResponse.json(
        { error: "Missing userUid or apClassId" },
        { status: 400 }
      );
    }

    const results = await getOnboardingQuizResults(userUid, apClassId);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching onboarding quiz results:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz results" },
      { status: 500 }
    );
  }
}