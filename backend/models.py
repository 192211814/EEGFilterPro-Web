from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    reset_otp = Column(String(6), nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    phone = Column(String(20), nullable=True)
    institution = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    subject_id = Column(String(100))
    session = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner = relationship("User", back_populates="projects")
    eeg_files = relationship("EEGFile", back_populates="project", cascade="all, delete-orphan")

class EEGFile(Base):
    __tablename__ = "eeg_files"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # NEW: Track owner
    file_path = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50)) # .edf, .bdf, .set
    sampling_rate = Column(Float)
    duration = Column(Float)
    channels = Column(JSON) # List of channel names
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="eeg_files")
    owner = relationship("User") # Relationship to owner
    analysis_results = relationship("AnalysisResult", back_populates="eeg_file", cascade="all, delete-orphan")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    id = Column(Integer, primary_key=True, index=True)
    eeg_file_id = Column(Integer, ForeignKey("eeg_files.id"))
    quality_score = Column(Float)
    interference_detected = Column(JSON) # e.g. {"50Hz": true, "60Hz": false}
    snr_improvement = Column(Float)
    filter_settings = Column(JSON) # Parameters used
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)
    eeg_file = relationship("EEGFile", back_populates="analysis_results")
