from irins_scraper import get_departments, get_faculty_list, get_faculty_details
import os
import sys
import logging
import json
import time
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from database import Database

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'scraper_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)
logger = logging.getLogger(__name__)

def scrape_and_store():
    """Main function to scrape data and store in database"""
    try:
        # Initialize database
        db = Database()
        logger.info("Database connection initialized")
        
        # Create data directory for JSON backup
        data_dir = Path('data')
        data_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize results
        all_data = []
        total_faculty = 0
        total_publications = 0
        
        # Get all departments
        departments = get_departments()
        logger.info(f"Found {len(departments)} departments")
        
        # Process each department
        for dept in departments:
            try:
                logger.info(f"Processing department: {dept['name']}")
                faculty_list = get_faculty_list(dept['url'])
                logger.info(f"Found {len(faculty_list)} faculty members")
                
                # Process each faculty member
                for faculty in faculty_list:
                    try:
                        if not faculty.get('profile_url'):
                            logger.warning(f"No profile URL for faculty: {faculty.get('name', 'Unknown')}")
                            continue
                            
                        logger.info(f"Processing faculty: {faculty['name']}")
                        
                        # Get detailed faculty information
                        details = get_faculty_details(faculty['profile_url'])
                        faculty.update(details)
                        faculty['department'] = dept['name']
                        
                        # Store faculty data
                        faculty_id = db.store_faculty(faculty)
                        if faculty_id:
                            logger.info(f"Stored faculty data for {faculty['name']}")
                            
                            # Store publications
                            db.store_publications(faculty_id, faculty.get('publications', []))
                            logger.info(f"Stored {len(faculty.get('publications', []))} publications for {faculty['name']}")
                            
                            # Update faculty metrics
                            db.update_faculty_counts(faculty_id)
                            logger.info(f"Updated metrics for {faculty['name']}")
                            
                            total_faculty += 1
                            total_publications += len(faculty.get('publications', []))
                            
                        # Add to backup data
                        all_data.append(faculty)
                        
                        # Be nice to the server
                        time.sleep(1)
                        
                    except Exception as e:
                        logger.error(f"Error processing faculty {faculty.get('name')}: {str(e)}")
                        continue
                        
            except Exception as e:
                logger.error(f"Error processing department {dept['name']}: {str(e)}")
                continue
                
        # Save backup to JSON
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = data_dir / f"faculty_data_{timestamp}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total_faculty': total_faculty,
                'total_publications': total_publications,
                'faculty_data': all_data
            }, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Scraping complete!")
        logger.info(f"Total faculty processed: {total_faculty}")
        logger.info(f"Total publications found: {total_publications}")
        logger.info(f"Backup saved to: {output_file}")
        
    except Exception as e:
        logger.error(f"Error in main scraping function: {str(e)}")
        raise

def main():
    try:
        # Create necessary directories
        for directory in ['data', 'logs']:
            Path(directory).mkdir(parents=True, exist_ok=True)
            
        # Run the scraper
        scrape_and_store()
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 