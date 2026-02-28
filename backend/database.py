import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# Get the connection string from .env
# Example: mysql+pymysql://root:password@localhost/doctor_patient_room
DATABASE_URL = os.getenv("DATABASE_URL")

# 1. Create the Engine
# 'pool_pre_ping=True' checks if the connection is alive before using it
engine = create_engine(
    DATABASE_URL, 
    pool_pre_ping=True
)

# 2. Create a Session Factory
# Each instance of SessionLocal will be a database session
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# 3. Create the Base Class
# Our models (Users, Chats, Reports) will inherit from this
Base = declarative_base()

# 4. Dependency to get DB session
# This is used in routes like: @app.post("/login") def login(db = Depends(get_db)):
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()