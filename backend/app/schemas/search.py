from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SearchResult(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class FacultyResult(SearchResult):
    name: str
    title: str
    department: str
    institution: str
    research_interests: List[str]
    email: Optional[str] = None
    profile_image: Optional[str] = None

class PublicationResult(SearchResult):
    authors: List[str]
    abstract: str
    journal: Optional[str] = None
    year: int
    doi: Optional[str] = None
    citations: Optional[int] = None

class ResearchResult(SearchResult):
    researcher: str
    domain: str
    status: str
    keywords: List[str]
    funding: Optional[str] = None 