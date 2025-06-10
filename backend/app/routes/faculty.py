from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Dict
from ..ml.domain_classifier import DomainClassifier
from ..database.supabase import supabase_client
from ..auth.deps import get_current_active_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

classifier = DomainClassifier()

# Global variable to track scraping progress
scraping_status = {
    "is_running": False,
    "total_faculty": 0,
    "processed_faculty": 0,
    "current_faculty": "",
    "error": None
}

@router.get("/faculty", response_model=List[Dict])
async def get_faculty_list(current_user = Depends(get_current_active_user)):
    """Get list of all faculty members"""
    try:
        response = supabase_client.table('faculty').select('*').execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching faculty list: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching faculty list")

@router.get("/faculty/{faculty_id}", response_model=Dict)
async def get_faculty_detail(faculty_id: str, current_user = Depends(get_current_active_user)):
    """Get detailed information for a specific faculty member"""
    try:
        response = supabase_client.table('faculty').select('*').eq('id', faculty_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Faculty not found")
        return response.data
    except Exception as e:
        logger.error(f"Error fetching faculty detail: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching faculty detail")

@router.post("/faculty/scrape")
async def scrape_faculty_data(background_tasks: BackgroundTasks, current_user = Depends(get_current_active_user)):
    """Trigger faculty data scraping from IRINS"""
    global scraping_status
    
    if scraping_status["is_running"]:
        return {
            "message": "Scraping already in progress",
            "status": scraping_status
        }
        
    try:
        scraping_status = {
            "is_running": True,
            "total_faculty": 0,
            "processed_faculty": 0,
            "current_faculty": "",
            "error": None
        }
        
        background_tasks.add_task(scrape_and_store_faculty_data)
        return {
            "message": "Faculty data scraping started",
            "status": scraping_status
        }
    except Exception as e:
        logger.error(f"Error initiating faculty scraping: {str(e)}")
        scraping_status["error"] = str(e)
        scraping_status["is_running"] = False
        raise HTTPException(status_code=500, detail="Error starting faculty scraping")

@router.get("/faculty/scrape/status")
async def get_scraping_status(current_user = Depends(get_current_active_user)):
    """Get current scraping status"""
    return scraping_status

async def scrape_and_store_faculty_data():
    """Background task to scrape and store faculty data"""
    global scraping_status
    
    try:
        # Scrape faculty data
        data = scraper.scrape_all()
        scraping_status["total_faculty"] = len(data['faculty'])
        
        # Process each faculty member
        for i, faculty in enumerate(data['faculty']):
            try:
                scraping_status["processed_faculty"] = i + 1
                scraping_status["current_faculty"] = faculty['name']
                
                # Classify publications
                if 'publications' in faculty:
                    faculty['publications'] = classifier.batch_classify_publications(faculty['publications'])
                
                # Store faculty data
                response = supabase_client.table('faculty').upsert({
                    'name': faculty['name'],
                    'department': faculty['department'],
                    'designation': faculty.get('designation', ''),
                    'email': faculty.get('email', ''),
                    'research_interests': faculty.get('research_interests', []),
                    'image_url': faculty.get('image_url', None)
                }).execute()
                
                faculty_id = response.data[0]['id']
                
                # Store publications
                if 'publications' in faculty:
                    for pub in faculty['publications']:
                        supabase_client.table('publications').upsert({
                            'title': pub['title'],
                            'authors': pub['authors'],
                            'journal': pub.get('journal', ''),
                            'year': pub.get('year', ''),
                            'doi': pub.get('doi', None),
                            'research_domains': pub.get('research_domains', ['Other']),
                            'faculty_id': faculty_id
                        }).execute()
                        
            except Exception as e:
                logger.error(f"Error processing faculty {faculty.get('name', 'unknown')}: {str(e)}")
                continue
                
        scraping_status["is_running"] = False
        scraping_status["current_faculty"] = "Completed"
        
    except Exception as e:
        logger.error(f"Error in scrape_and_store_faculty_data: {str(e)}")
        scraping_status["error"] = str(e)
        scraping_status["is_running"] = False

@router.get("/faculty/{faculty_id}/publications", response_model=List[Dict])
async def get_faculty_publications(faculty_id: str, current_user = Depends(get_current_active_user)):
    """Get publications for a specific faculty member"""
    try:
        response = supabase_client.table('publications').select('*').eq('faculty_id', faculty_id).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching faculty publications: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching faculty publications")

@router.get("/faculty/search/{query}", response_model=List[Dict])
async def search_faculty(query: str, current_user = Depends(get_current_active_user)):
    """Search faculty by name, department, or research interests"""
    try:
        # First try exact domain match in publications
        pub_response = supabase_client.table('publications').select('faculty_id').contains('research_domains', [query]).execute()
        faculty_ids = list(set([p['faculty_id'] for p in pub_response.data]))
        
        # Then search other faculty fields
        response = supabase_client.table('faculty').select('*').or_(
            f"id.in.({','.join(faculty_ids)})" if faculty_ids else "id.is.null",
            f"name.ilike.%{query}%",
            f"department.ilike.%{query}%",
            f"research_interests.cs.{{{query}}}"
        ).execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error searching faculty: {str(e)}")
        raise HTTPException(status_code=500, detail="Error searching faculty") 