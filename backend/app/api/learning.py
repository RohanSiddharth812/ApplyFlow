from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.models import User, LearningPath, LearningItem
from app.schemas.schemas import LearningHubOverview, LearningPathResponse, LearningItemResponse, SkillGapItem
from app.api.deps import get_current_user

router = APIRouter(prefix="/learning", tags=["Learning Hub"])

@router.get("/roadmap", response_model=LearningHubOverview)
def get_learning_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    paths = db.query(LearningPath).filter(LearningPath.user_id == current_user.id).all()
    
    skill_gaps = [
        SkillGapItem(skill=p.target_skill, gap_percentage=p.gap_percentage)
        for p in paths
    ]
    if not skill_gaps:
        skill_gaps = [
            SkillGapItem(skill="Docker", gap_percentage=30),
            SkillGapItem(skill="FastAPI", gap_percentage=25),
            SkillGapItem(skill="AWS", gap_percentage=20),
            SkillGapItem(skill="Kubernetes", gap_percentage=15)
        ]

    roadmap_resp = []
    for p in paths:
        items_resp = [
            LearningItemResponse(
                id=item.id,
                week_number=item.week_number,
                week_title=item.week_title,
                topic=item.topic,
                description=item.description,
                resource_url=item.resource_url,
                is_completed=item.is_completed
            )
            for item in p.items
        ]
        # Calculate dynamic progress
        total = len(items_resp)
        completed = sum(1 for i in items_resp if i.is_completed)
        progress = round((completed / total * 100)) if total > 0 else 0

        roadmap_resp.append(LearningPathResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            target_skill=p.target_skill,
            gap_percentage=p.gap_percentage,
            progress_percentage=progress,
            items=items_resp
        ))

    return LearningHubOverview(skill_gaps=skill_gaps, roadmap=roadmap_resp)

@router.put("/roadmap/{item_id}", response_model=LearningItemResponse)
def toggle_learning_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(LearningItem).filter(LearningItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning item not found")

    item.is_completed = not item.is_completed
    db.commit()
    db.refresh(item)

    # Update parent path progress
    parent_path = item.path
    if parent_path:
        total = len(parent_path.items)
        completed = sum(1 for i in parent_path.items if i.is_completed)
        parent_path.progress_percentage = round((completed / total * 100)) if total > 0 else 0
        db.commit()

    return LearningItemResponse(
        id=item.id,
        week_number=item.week_number,
        week_title=item.week_title,
        topic=item.topic,
        description=item.description,
        resource_url=item.resource_url,
        is_completed=item.is_completed
    )
