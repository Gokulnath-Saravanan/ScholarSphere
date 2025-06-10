import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv
import requests
from typing import Dict, List

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

def init_db():
    """Initialize database connection and verify credentials."""
    try:
        # Test connection by making a simple query
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        }
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/faculty?select=count",
            headers=headers
        )
        response.raise_for_status()
        logger.info("Successfully connected to Supabase")
    except Exception as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        raise

def store_faculty_data(faculty_data):
    """Store faculty data in Supabase."""
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
        
        # First, store or update faculty information
        faculty_payload = {
            'name': faculty_data['name'],
            'designation': faculty_data['designation'],
            'department': faculty_data['department'],
            'email': faculty_data['email'],
            'expertise': faculty_data['expertise'],
            'profile_url': faculty_data['profile_url'],
            'updated_at': datetime.now().isoformat()
        }
        
        # Check if faculty already exists
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/faculty?profile_url=eq.{faculty_data['profile_url']}",
            headers=headers
        )
        response.raise_for_status()
        existing_faculty = response.json()
        
        if existing_faculty:
            # Update existing faculty
            faculty_id = existing_faculty[0]['id']
            response = requests.patch(
                f"{SUPABASE_URL}/rest/v1/faculty?id=eq.{faculty_id}",
                headers=headers,
                json=faculty_payload
            )
        else:
            # Insert new faculty
            faculty_payload['created_at'] = datetime.now().isoformat()
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/faculty",
                headers=headers,
                json=faculty_payload
            )
        response.raise_for_status()
        
        # Get faculty ID for publications
        if existing_faculty:
            faculty_id = existing_faculty[0]['id']
        else:
            # Get the ID of the newly inserted faculty
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/faculty?profile_url=eq.{faculty_data['profile_url']}",
                headers=headers
            )
            response.raise_for_status()
            faculty_id = response.json()[0]['id']
        
        # Store publications
        for pub in faculty_data.get('publications', []):
            pub_payload = {
                'faculty_id': faculty_id,
                'title': pub['title'],
                'authors': pub['authors'],
                'year': pub['year'],
                'journal': pub['journal'],
                'url': pub['url'],
                'updated_at': datetime.now().isoformat()
            }
            
            # Check if publication already exists
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/publications?title=eq.{pub['title']}&faculty_id=eq.{faculty_id}",
                headers=headers
            )
            response.raise_for_status()
            existing_pub = response.json()
            
            if existing_pub:
                # Update existing publication
                pub_id = existing_pub[0]['id']
                response = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/publications?id=eq.{pub_id}",
                    headers=headers,
                    json=pub_payload
                )
            else:
                # Insert new publication
                pub_payload['created_at'] = datetime.now().isoformat()
                response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/publications",
                    headers=headers,
                    json=pub_payload
                )
            response.raise_for_status()
            
        logger.info(f"Successfully stored data for faculty: {faculty_data['name']}")
        
    except Exception as e:
        logger.error(f"Error storing faculty data: {str(e)}")
        raise

class Database:
    def __init__(self):
        """Initialize database connection"""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY environment variables.")
            
        # Set up headers for Supabase REST API
        self.headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
        
        logger.info("Database connection initialized")
        
    def store_faculty(self, faculty_data: Dict) -> str:
        """Store faculty data and return the faculty ID"""
        try:
            # Prepare faculty record
            faculty_record = {
                'name': faculty_data['name'],
                'department': faculty_data['department'],
                'institution': 'MSRIT',
                'position': faculty_data.get('designation', ''),
                'email': faculty_data.get('email', ''),
                'research_areas': faculty_data.get('expertise', []),
                'profile_url': faculty_data.get('profile_url', ''),
                'updated_at': datetime.now().isoformat()
            }
            
            # Upsert faculty record using REST API
            response = requests.post(
                f"{self.supabase_url}/rest/v1/faculty",
                headers=self.headers,
                json=faculty_record
            )
            
            if response.status_code not in [200, 201]:
                logger.error(f"Failed to store faculty data for {faculty_data['name']}: {response.text}")
                return None
                
            return response.json()[0]['id']
            
        except Exception as e:
            logger.error(f"Error storing faculty {faculty_data['name']}: {str(e)}")
            return None
            
    def store_publications(self, faculty_id: str, publications: List[Dict]) -> None:
        """Store publications for a faculty member"""
        try:
            for pub in publications:
                # Extract year from publication text if possible
                year = None
                text = pub['title']
                # Look for 4-digit year between 1900-2024
                import re
                year_match = re.search(r'\b(19|20)\d{2}\b', text)
                if year_match:
                    year = int(year_match.group(0))
                
                # Try to extract authors if they're in a standard format
                authors = []
                # Look for common author patterns like "Author1, Author2, and Author3" or "Author1; Author2"
                author_match = re.search(r'^(.*?)[\.|\(]', text)
                if author_match:
                    author_text = author_match.group(1)
                    # Split on common author separators
                    authors = [a.strip() for a in re.split(r'[,;]|\sand\s', author_text) if a.strip()]
                
                # Prepare publication record
                pub_record = {
                    'title': pub['title'],
                    'authors': authors if authors else [],
                    'year': year,
                    'faculty_id': faculty_id,
                    'updated_at': datetime.now().isoformat()
                }
                
                # Upsert publication using REST API
                response = requests.post(
                    f"{self.supabase_url}/rest/v1/publications",
                    headers=self.headers,
                    json=pub_record
                )
                
                if response.status_code not in [200, 201]:
                    logger.error(f"Failed to store publication for faculty {faculty_id}: {response.text}")
                
        except Exception as e:
            logger.error(f"Error storing publications for faculty {faculty_id}: {str(e)}")
            
    def update_faculty_counts(self, faculty_id: str) -> None:
        """Update publication count and other metrics for a faculty member"""
        try:
            # Get publication count using REST API
            response = requests.get(
                f"{self.supabase_url}/rest/v1/publications",
                headers=self.headers,
                params={'faculty_id': f'eq.{faculty_id}', 'select': 'id,citation_count'}
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to get publications for faculty {faculty_id}: {response.text}")
                return
                
            publications = response.json()
            publications_count = len(publications)
            citations = sum(p.get('citation_count', 0) for p in publications)
            
            # Update faculty record using REST API
            update_response = requests.patch(
                f"{self.supabase_url}/rest/v1/faculty",
                headers=self.headers,
                params={'id': f'eq.{faculty_id}'},
                json={
                    'publications_count': publications_count,
                    'citations': citations,
                    'updated_at': datetime.now().isoformat()
                }
            )
            
            if update_response.status_code != 200:
                logger.error(f"Failed to update counts for faculty {faculty_id}: {update_response.text}")
            
        except Exception as e:
            logger.error(f"Error updating counts for faculty {faculty_id}: {str(e)}") 