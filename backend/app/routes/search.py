from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging
from supabase import create_client, Client
from ..ml.domain_classifier import classify_research_domain
from ..schemas.search import SearchResult, FacultyResult, PublicationResult, ResearchResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter(prefix="/api/search", tags=["search"])

# Initialize Supabase client
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("Supabase credentials not found")
    
    supabase: Client = create_client(supabase_url, supabase_key)
    logger.info("Supabase client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {str(e)}")
    raise

class SearchQuery(BaseModel):
    query: str
    filters: Optional[dict] = None
    page: int = 1
    limit: int = 10

@router.post("/all")
async def search_all(search_query: SearchQuery):
    """
    Search across faculty, profiles, and publications
    """
    try:
        query = search_query.query.lower()
        logger.info(f"Processing search query: {query}")

        # Search faculty
        faculty = []
        try:
            logger.info("Searching faculty...")
            faculty_response = supabase.table("faculty") \
                .select("*") \
                .or_(
                    f"name.ilike.%{query}%,"
                    f"department.ilike.%{query}%,"
                    f"institution.ilike.%{query}%,"
                    f"expertise.cs.{{{query}}}"
                ) \
                .limit(search_query.limit) \
                .execute()
            
            faculty = faculty_response.data if hasattr(faculty_response, 'data') else []
            logger.info(f"Found {len(faculty)} faculty results")
        except Exception as e:
            logger.error(f"Error searching faculty: {str(e)}")
            faculty = []

        # Search profiles
        profiles = []
        try:
            logger.info("Searching profiles...")
            profiles_response = supabase.table("profiles") \
                .select("*") \
                .or_(
                    f"full_name.ilike.%{query}%,"
                    f"department.ilike.%{query}%,"
                    f"institution.ilike.%{query}%,"
                    f"research_interests.cs.{{{query}}}"
                ) \
                .limit(search_query.limit) \
                .execute()
            
            profiles = profiles_response.data if hasattr(profiles_response, 'data') else []
            logger.info(f"Found {len(profiles)} profile results")
        except Exception as e:
            logger.error(f"Error searching profiles: {str(e)}")
            profiles = []

        # Search publications with faculty information
        publications = []
        try:
            logger.info("Searching publications...")
            publications_response = supabase.table("publications") \
                .select("""
                    *,
                    faculty_publications (
                        faculty_id,
                        author_position,
                        is_corresponding,
                        faculty (
                            name,
                            department,
                            institution
                        )
                    )
                """) \
                .or_(
                    f"title.ilike.%{query}%,"
                    f"abstract.ilike.%{query}%,"
                    f"venue.ilike.%{query}%,"
                    f"publisher.ilike.%{query}%"
                ) \
                .limit(search_query.limit) \
                .execute()
            
            publications = publications_response.data if hasattr(publications_response, 'data') else []
            logger.info(f"Found {len(publications)} publication results")
        except Exception as e:
            logger.error(f"Error searching publications: {str(e)}")
            publications = []

        # Format the results
        formatted_results = {
            "faculty": [{
                "id": str(f.get("id")),
                "type": "faculty",
                "title": f.get("name", ""),
                "description": f"{f.get('department', '')} at {f.get('institution', '')}",
                "expertise": f.get("expertise", []),
                "photo_url": f.get("photo_url"),
                "citations": f.get("citations"),
                "h_index": f.get("h_index"),
                "google_scholar_url": f.get("google_scholar_url"),
                "orcid_id": f.get("orcid_id")
            } for f in faculty],
            
            "profiles": [{
                "id": str(p.get("id")),
                "type": "profile",
                "title": p.get("full_name", ""),
                "description": f"{p.get('position', '')} at {p.get('institution', '')}",
                "department": p.get("department", ""),
                "research_interests": p.get("research_interests", []),
                "bio": p.get("bio", ""),
                "avatar_url": p.get("avatar_url")
            } for p in profiles],
            
            "publications": [{
                "id": str(p.get("id")),
                "type": "publication",
                "title": p.get("title", ""),
                "description": p.get("abstract", "")[:200] + "..." if p.get("abstract") else "",
                "year": p.get("year"),
                "publication_type": p.get("publication_type"),
                "doi": p.get("doi"),
                "venue": p.get("venue"),
                "publisher": p.get("publisher"),
                "citation_count": p.get("citation_count", 0),
                "impact_factor": p.get("impact_factor"),
                "paper_url": p.get("paper_url"),
                "authors": [
                    {
                        "name": fp.get("faculty", {}).get("name"),
                        "department": fp.get("faculty", {}).get("department"),
                        "institution": fp.get("faculty", {}).get("institution"),
                        "position": fp.get("author_position"),
                        "is_corresponding": fp.get("is_corresponding")
                    } for fp in p.get("faculty_publications", [])
                ] if p.get("faculty_publications") else []
            } for p in publications]
        }

        # Add research trends if available
        try:
            trends_response = supabase.table("research_trends") \
                .select("*") \
                .or_(f"topic.ilike.%{query}%,category.ilike.%{query}%") \
                .order("trending_score.desc") \
                .limit(5) \
                .execute()
            
            trends = trends_response.data if hasattr(trends_response, 'data') else []
            if trends:
                formatted_results["trends"] = [{
                    "id": str(t.get("id")),
                    "type": "trend",
                    "title": t.get("topic", ""),
                    "description": f"Category: {t.get('category', '')} | Growth Rate: {t.get('growth_rate')}",
                    "year": t.get("year"),
                    "quarter": t.get("quarter"),
                    "publication_count": t.get("publication_count"),
                    "citation_count": t.get("citation_count"),
                    "faculty_count": t.get("faculty_count"),
                    "trending_score": t.get("trending_score")
                } for t in trends]
        except Exception as e:
            logger.error(f"Error searching trends: {str(e)}")

        logger.info(f"Returning formatted results with counts - Faculty: {len(formatted_results['faculty'])}, "
                   f"Profiles: {len(formatted_results['profiles'])}, "
                   f"Publications: {len(formatted_results['publications'])}")

        return formatted_results

    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/faculty")
async def search_faculty(search_query: SearchQuery):
    """
    Search faculty profiles
    """
    try:
        query = search_query.query.lower()
        logger.info(f"Searching faculty with query: {query}")
        
        response = supabase.table("profiles") \
            .select("*") \
            .or_(f"full_name.ilike.%{query}%,department.ilike.%{query}%") \
            .limit(search_query.limit) \
            .execute()
        
        profiles = response.data if hasattr(response, 'data') else []
        
        results = [{
            "id": str(f.get("id")),
            "type": "faculty",
            "name": f.get("full_name", ""),
            "position": f.get("position"),
            "department": f.get("department"),
            "email": f.get("email"),
            "avatar_url": f.get("avatar_url")
        } for f in profiles]
        
        logger.info(f"Returning {len(results)} faculty results")
        return {"results": results}
    except Exception as e:
        logger.error(f"Faculty search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/publications")
async def search_publications(search_query: SearchQuery):
    """
    Search publications
    """
    try:
        query = search_query.query.lower()
        logger.info(f"Searching publications with query: {query}")
        
        response = supabase.table("publications") \
            .select("*") \
            .or_(f"title.ilike.%{query}%,abstract.ilike.%{query}%") \
            .limit(search_query.limit) \
            .execute()
        
        publications = response.data if hasattr(response, 'data') else []
        
        results = [{
            "id": str(p.get("id")),
            "type": "publication",
            "title": p.get("title"),
            "abstract": p.get("abstract"),
            "year": p.get("year"),
            "publication_type": p.get("publication_type"),
            "doi": p.get("doi"),
            "venue": p.get("venue"),
            "publisher": p.get("publisher"),
            "citation_count": p.get("citation_count", 0),
            "impact_factor": p.get("impact_factor"),
            "paper_url": p.get("paper_url"),
            "pdf_url": p.get("pdf_url")
        } for p in publications]
        
        logger.info(f"Returning {len(results)} publication results")
        return {"results": results}
    except Exception as e:
        logger.error(f"Publications search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/research")
async def search_research(search_query: SearchQuery):
    """
    Search research works
    """
    try:
        query = search_query.query.lower()
        logger.info(f"Searching research works with query: {query}")
        
        response = supabase.table("research_works") \
            .select("*") \
            .or_(f"title.ilike.%{query}%, description.ilike.%{query}%, domain.ilike.%{query}%, keywords.cs.{{{query}}}") \
            .limit(search_query.limit) \
            .execute()
        
        research = response.data
        logger.info(f"Found {len(research)} research results")
        
        results = [{
            "id": r["id"],
            "type": "research",
            "title": r["title"],
            "description": r.get("description"),
            "researcher": r.get("researcher"),
            "domain": r.get("domain"),
            "status": r.get("status"),
            "keywords": r.get("keywords", [])
        } for r in research]
        
        return {"results": results}
    except Exception as e:
        logger.error(f"Research search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classify-domain")
async def classify_domain(texts: List[str]):
    """
    Classify research domains for given texts
    """
    try:
        logger.info(f"Classifying {len(texts)} texts")
        domains = await classify_research_domain(texts)
        logger.info(f"Successfully classified domains")
        return {"domains": domains}
    except Exception as e:
        logger.error(f"Domain classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 