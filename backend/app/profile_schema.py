from __future__ import annotations
 
from datetime import date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
 
class SocialLink(BaseModel):
    platform: str  # e.g. "GitHub", "LinkedIn", "Twitter"
    url: str
 
 
class Skill(BaseModel):
    name: str
 
 
class Experience(BaseModel):
    company: str
    title: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None  # None = current role
    is_current: bool = False
    summary: str  # short blurb for quick answers
    achievements: list[str] = Field(default_factory=list)
    tech_stack: list[str] = Field(default_factory=list)
 
 
class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    gpa: Optional[float] = None
 
 
class Project(BaseModel):
    name: str
    description: str
    role: Optional[str] = None
    tech_stack: list[str] = Field(default_factory=list)
    url: Optional[str] = None
    repo_url: Optional[str] = None
    highlights: list[str] = Field(default_factory=list)

class OpenSourceContribution(BaseModel):
    project_name: str
    role: Optional[str] = None  # e.g. "Maintainer", "Contributor", "Core Team"
    description: str
    repo_url: Optional[str] = None
    contributions: list[str] = Field(default_factory=list)  # e.g. "Added dark mode support", "Fixed memory leak in parser"
 
 
class Certification(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[date] = None
 
 
class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
 
 
class CandidateProfile(BaseModel):
    full_name: str
    headline: str  # e.g. "Full-Stack Developer | 5 yrs experience"
    summary: str  # 2-4 sentence bio the bot can lean on for general questions
    contact: ContactInfo
    social_links: list[SocialLink] = Field(default_factory=list)
 
    skills: list[Skill] = Field(default_factory=list)
    experience: list[Experience] = Field(default_factory=list)
    education: list[Education] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    open_source_contributions: list[OpenSourceContribution] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
 
    languages_spoken: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
 
    # Optional: canned answers for common recruiter questions
    faq: dict[str, str] = Field(default_factory=dict)