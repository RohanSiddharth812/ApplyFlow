from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import User, Interview, InterviewQuestion, Job
from app.schemas.schemas import (
    InterviewCreate, InterviewResponse, InterviewAnswerRequest,
    InterviewQuestionResponse
)
from app.api.deps import get_current_user
from app.services.ai.factory import get_ai_provider

router = APIRouter(prefix="/interviews", tags=["Mock Interviews"])

@router.post("", response_model=InterviewResponse)
def start_interview(
    int_in: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_provider = get_ai_provider()
    raw_questions = ai_provider.generate_interview_questions(role=int_in.role, difficulty=int_in.difficulty)

    interview = Interview(
        user_id=current_user.id,
        job_id=int_in.job_id,
        role=int_in.role,
        difficulty=int_in.difficulty,
        overall_score=0,
        status="In Progress"
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    for q_data in raw_questions:
        q_obj = InterviewQuestion(
            interview_id=interview.id,
            question=q_data["question"],
            question_type=q_data.get("question_type", "Technical"),
            user_answer=None,
            feedback=None,
            score=None
        )
        db.add(q_obj)

    db.commit()
    db.refresh(interview)
    return _build_interview_response(interview)

@router.post("/{interview_id}/answer", response_model=InterviewQuestionResponse)
def answer_question(
    interview_id: str,
    ans_in: InterviewAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found")

    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == ans_in.question_id,
        InterviewQuestion.interview_id == interview.id
    ).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    # Evaluate answer with AI
    ai_provider = get_ai_provider()
    eval_result = ai_provider.evaluate_interview_answer(
        question=question.question,
        user_answer=ans_in.answer,
        role=interview.role
    )

    question.user_answer = ans_in.answer
    question.score = eval_result.get("score", 80)
    question.feedback = eval_result.get("feedback", "Good explanation. Keep practicing STAR format.")
    db.commit()
    db.refresh(question)

    # Recalculate overall interview score
    answered = [q.score for q in interview.questions if q.score is not None]
    if answered:
        interview.overall_score = round(sum(answered) / len(answered))
        if len(answered) == len(interview.questions):
            interview.status = "Completed"
            interview.feedback_summary = f"Mock session complete. Average technical precision score: {interview.overall_score}%."
        db.commit()

    return InterviewQuestionResponse(
        id=question.id,
        question=question.question,
        question_type=question.question_type,
        user_answer=question.user_answer,
        feedback=question.feedback,
        score=question.score
    )

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        # If specific id not found, look for latest interview or return first
        interview = db.query(Interview).filter(Interview.user_id == current_user.id).first()
        if not interview:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return _build_interview_response(interview)

def _build_interview_response(interview: Interview) -> InterviewResponse:
    qs = [
        InterviewQuestionResponse(
            id=q.id,
            question=q.question,
            question_type=q.question_type,
            user_answer=q.user_answer,
            feedback=q.feedback,
            score=q.score
        )
        for q in interview.questions
    ]
    return InterviewResponse(
        id=interview.id,
        role=interview.role,
        difficulty=interview.difficulty,
        overall_score=interview.overall_score,
        feedback_summary=interview.feedback_summary,
        status=interview.status,
        created_at=interview.created_at,
        questions=qs
    )
