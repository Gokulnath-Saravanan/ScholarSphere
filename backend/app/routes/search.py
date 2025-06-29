from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client
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

@router.get("/filter-options")
async def get_filter_options():
    """
    Get available filter options for search
    """
    try:
        logger.info("Fetching filter options")
        
        # Get unique departments
        departments_response = supabase.table("faculty") \
            .select("department") \
            .execute()
        departments = list(set(d["department"] for d in departments_response.data if d["department"]))
        
        # Get unique institutions
        institutions_response = supabase.table("faculty") \
            .select("institution") \
            .execute()
        institutions = list(set(i["institution"] for i in institutions_response.data if i["institution"]))
        
        # Get unique cities and states
        locations_response = supabase.table("faculty") \
            .select("city, state") \
            .execute()
        cities = list(set(l["city"] for l in locations_response.data if l.get("city")))
        states = list(set(l["state"] for l in locations_response.data if l.get("state")))
        
        # Get unique domains from the domain classifier
        from ..ml.domain_classifier import DomainClassifier
        classifier = DomainClassifier()
        domains = classifier.research_domains
        
        return {
            "departments": sorted(departments),
            "institutions": sorted(institutions),
            "domains": sorted(domains),
            "cities": sorted(cities),
            "states": sorted(states)
        }
    except Exception as e:
        logger.error(f"Error fetching filter options: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/all")
async def search_all(search_query: SearchQuery):
    """
    Search across faculty, profiles, and publications
    """
    try:
        query = search_query.query.lower()
        filters = search_query.filters or {}
        logger.info(f"Processing search query: {query} with filters: {filters}")

        # Search faculty
        faculty = []
        try:
            logger.info("Searching faculty...")
            faculty_query = supabase.table("faculty") \
                .select("*") \
                .or_(
                    f"name.ilike.%{query}%,"
                    f"department.ilike.%{query}%,"
                    f"institution.ilike.%{query}%,"
                    f"expertise.cs.{{{query}}}"
                )
            
            # Apply filters
            if filters.get("department"):
                faculty_query = faculty_query.in_("department", filters["department"])
            if filters.get("institution"):
                # Handle institution variations
                normalized_institutions = [normalize_institution(inst) for inst in filters["institution"]]
                faculty_query = faculty_query.or_(
                    *[f"institution.ilike.%{inst}%" for inst in normalized_institutions]
                )
            if filters.get("domain"):
                faculty_query = faculty_query.contains("expertise", filters["domain"])
            if filters.get("city"):
                faculty_query = faculty_query.in_("city", filters["city"])
            if filters.get("state"):
                faculty_query = faculty_query.in_("state", filters["state"])
                
            faculty_response = faculty_query.limit(search_query.limit).execute()
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
            pub_query = supabase.table("publications") \
                .select("""
                    *,
                    faculty_publications (
                        faculty_id,
                        author_position,
                        is_corresponding,
                        faculty (
                            name,
                            department,
                            institution,
                            irins_profile_url,
                            email
                        )
                    )
                """) \
                .or_(
                    f"title.ilike.%{query}%,"
                    f"abstract.ilike.%{query}%,"
                    f"venue.ilike.%{query}%,"
                    f"publisher.ilike.%{query}%"
                )
            
            # Apply filters
            if filters.get("department"):
                pub_query = pub_query.in_("faculty_publications.faculty.department", filters["department"])
            if filters.get("institution"):
                normalized_institutions = [normalize_institution(inst) for inst in filters["institution"]]
                pub_query = pub_query.or_(
                    *[f"faculty_publications.faculty.institution.ilike.%{inst}%" for inst in normalized_institutions]
                )
            if filters.get("domain"):
                pub_query = pub_query.contains("research_domains", filters["domain"])
                
            publications_response = pub_query.limit(search_query.limit).execute()
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
                "description": f"{f.get('department', '')} at {normalize_institution(f.get('institution', ''))}",
                "expertise": f.get("expertise", []),
                "photo_url": f.get("photo_url"),
                "citations": f.get("citations"),
                "h_index": f.get("h_index"),
                "google_scholar_url": f.get("google_scholar_url"),
                "orcid_id": f.get("orcid_id"),
                "irins_profile_url": f.get("irins_profile_url"),
                "email": f.get("email"),
                "department": f.get("department", ""),
                "institution": normalize_institution(f.get("institution", "")),
                "city": f.get("city", ""),
                "state": f.get("state", "")
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
    Search faculty profiles with their domain-specific publications
    """
    try:
        query = search_query.query.lower()
        logger.info(f"Searching faculty with query: {query}")
        
        # First search for faculty
        faculty_response = supabase.table("faculty") \
            .select("*") \
            .or_(
                f"name.ilike.%{query}%,"
                f"department.ilike.%{query}%,"
                f"institution.ilike.%{query}%,"
                f"expertise.cs.{{{query}}}"
            ) \
            .execute()
        
        faculty = faculty_response.data if hasattr(faculty_response, 'data') else []
        enriched_results = []

        # Function to get domain-specific publications
        async def get_domain_publications(faculty_id: str, domain: str = None):
            query = supabase.table("publications") \
                .select("""
                    *,
                    faculty_publications (
                        faculty_id,
                        author_position,
                        is_corresponding
                    )
                """) \
                .eq("faculty_publications.faculty_id", faculty_id)
            
            if domain:
                query = query.contains("research_domains", [domain])
            
            publications_response = await query.execute()
            return publications_response.data if hasattr(publications_response, 'data') else []

        # Process each faculty member
        for f in faculty:
            faculty_id = f.get("id")
            # Get publications (domain-specific if query matches a domain)
            publications = await get_domain_publications(faculty_id, query if len(query) > 2 else None)
            
            faculty_result = {
                "id": str(faculty_id),
                "type": "faculty",
                "name": f.get("name", ""),
                "department": f.get("department", ""),
                "institution": f.get("institution", ""),
                "irins_profile_url": f.get("irins_profile_url"),  # IRINS profile URL
                "publications": [{
                    "id": str(p.get("id")),
                    "title": p.get("title"),
                    "year": p.get("year"),
                    "venue": p.get("venue"),
                    "citation_count": p.get("citation_count", 0),
                    "paper_url": p.get("paper_url"),
                    "research_domains": p.get("research_domains", []),
                    "is_corresponding": any(fp.get("is_corresponding") for fp in p.get("faculty_publications", []))
                } for p in publications]
            }
            
            enriched_results.append(faculty_result)
        
        # If searching by domain and no direct faculty matches, search through publications
        if not enriched_results and len(query) > 2:
            domain_publications = supabase.table("publications") \
                .select("""
                    *,
                    faculty_publications (
                        faculty_id,
                        faculty (*)
                    )
                """) \
                .contains("research_domains", [query]) \
                .execute()
            
            if hasattr(domain_publications, 'data'):
                faculty_seen = set()
                for pub in domain_publications.data:
                    for fp in pub.get("faculty_publications", []):
                        faculty_data = fp.get("faculty")
                        if faculty_data and faculty_data.get("id") not in faculty_seen:
                            faculty_seen.add(faculty_data.get("id"))
                            # Get complete faculty profile with domain-specific publications
                            faculty_result = {
                                "id": str(faculty_data.get("id")),
            "type": "faculty",
                                "name": faculty_data.get("name", ""),
                                "department": faculty_data.get("department", ""),
                                "institution": faculty_data.get("institution", ""),
                                "irins_profile_url": faculty_data.get("irins_profile_url"),
                                "publications": [{
                                    "id": str(pub.get("id")),
                                    "title": pub.get("title"),
                                    "year": pub.get("year"),
                                    "venue": pub.get("venue"),
                                    "citation_count": pub.get("citation_count", 0),
                                    "paper_url": pub.get("paper_url"),
                                    "research_domains": pub.get("research_domains", []),
                                    "is_corresponding": any(fp.get("is_corresponding") for fp in pub.get("faculty_publications", []))
                                }]
                            }
                            enriched_results.append(faculty_result)
        
        logger.info(f"Returning {len(enriched_results)} faculty results")
        return {"results": enriched_results}
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

def normalize_institution(institution: str) -> str:
    """Normalize institution names to handle variations"""
    if not institution:
        return ""
        
    # Convert to lowercase for comparison
    inst_lower = institution.lower().strip()
    
    # Define common variations
    variations = {
        "m s ramaiah institute of technology": [
            "m s ramaiah institute of technology",
            "m.s. ramaiah institute of technology",
            "ms ramaiah institute of technology",
            "ramaiah institute of technology",
            "msrit",
            "rit bangalore"
        ],
        # Add more institutions as needed
    }
    
    # Check if the institution matches any variation
    for standard_name, variants in variations.items():
        if inst_lower in variants or any(v in inst_lower for v in variants):
            return "M S Ramaiah Institute of Technology, Bangalore"
            
    return institution  # Return original if no match found 