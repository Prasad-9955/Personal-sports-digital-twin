from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DbSession
from app.database import get_db
from app.models import User, Athlete
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.dependencies import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: DbSession = Depends(get_db)):
    """Registers a new user and creates their associated athlete profile."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 1. Create User
    new_user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password)
    )
    db.add(new_user)
    db.flush()

    # 2. Create Athlete profile
    athlete = Athlete(
        user_id=new_user.id,
        display_name=user_in.display_name,
        sport=user_in.sport,
        experience_level=user_in.experience_level,
        height_cm=user_in.height_cm,
        weight_kg=user_in.weight_kg
    )
    db.add(athlete)
    db.commit()
    db.refresh(new_user)
    db.refresh(athlete)

    # 3. Issue JWT Token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
        athlete_id=athlete.id,
        display_name=athlete.display_name
    )

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: DbSession = Depends(get_db)):
    """Authenticates user with email and password and returns JWT token."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    athlete = db.query(Athlete).filter(Athlete.user_id == user.id).first()
    if not athlete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete profile not found"
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        athlete_id=athlete.id,
        display_name=athlete.display_name
    )
