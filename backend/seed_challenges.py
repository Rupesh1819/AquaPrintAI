import uuid
from app.database import SessionLocal
from app.models.gamification import Challenge, ChallengeDifficulty

def seed_challenges():
    db = SessionLocal()
    try:
        # Check if challenges already exist
        if db.query(Challenge).count() > 0:
            print("Challenges already exist. Skipping seed.")
            return

        challenges = [
            Challenge(
                id=uuid.uuid4(),
                title="First Scan",
                description="Scan your first product to start your sustainability journey.",
                target_count=1,
                reward_xp=50,
                difficulty=ChallengeDifficulty.EASY,
                is_active=True
            ),
            Challenge(
                id=uuid.uuid4(),
                title="Water Saver",
                description="Scan 5 products with a water score of 70 or higher.",
                target_count=5,
                reward_xp=150,
                difficulty=ChallengeDifficulty.MEDIUM,
                is_active=True
            ),
            Challenge(
                id=uuid.uuid4(),
                title="Eco Explorer",
                description="Scan 10 different products.",
                target_count=10,
                reward_xp=300,
                difficulty=ChallengeDifficulty.HARD,
                is_active=True
            )
        ]
        
        db.add_all(challenges)
        db.commit()
        print(f"Successfully seeded {len(challenges)} challenges.")
    except Exception as e:
        print(f"Error seeding challenges: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_challenges()
