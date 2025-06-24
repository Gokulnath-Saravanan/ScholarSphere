import requests
from bs4 import BeautifulSoup
import time
import logging
from typing import Dict, List, Optional
import re
from urllib.parse import urljoin
import json
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IRINSScraper:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.faculty_data = []
        self.department_counter = {}
        
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch a page and return its BeautifulSoup object"""
        try:
            response = self.session.get(url, headers=self.headers)
            response.raise_for_status()
            return BeautifulSoup(response.text, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            return None

    def extract_departments(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract department links from the main page"""
        departments = []
        try:
            # Find the departments section - updated selector for MSRIT
            dept_section = soup.select_one('div.container.content')
            if not dept_section:
                logger.error("Could not find departments section")
                return departments

            # Find the unordered list of department links - updated selector for MSRIT
            dept_list = dept_section.select_one('ul.nav.nav-sidebar')
            if not dept_list:
                logger.error("Could not find department list")
                return departments

            # Extract department links
            for link in dept_list.find_all('a'):
                dept_name = link.text.strip()
                dept_url = urljoin(self.base_url, link['href'])
                departments.append({
                    'name': dept_name,
                    'url': dept_url
                })
                logger.info(f"Found department: {dept_name}")

        except Exception as e:
            logger.error(f"Error extracting departments: {str(e)}")

        return departments

    def extract_faculty_from_department(self, dept_url: str, dept_name: str) -> List[Dict]:
        """Extract faculty information from a department page"""
        faculty_list = []
        try:
            soup = self.get_page(dept_url)
            if not soup:
                return faculty_list

            # Find the main div containing faculty profiles - updated selector for MSRIT
            faculty_container = soup.select_one('div.row.faculty-list')
            if not faculty_container:
                logger.error(f"Could not find faculty container for department: {dept_name}")
                return faculty_list

            # Extract faculty profiles
            for faculty_div in faculty_container.find_all('div', class_='col-md-4'):
                try:
                    # Extract faculty profile link
                    profile_link = faculty_div.find('a')
                    if not profile_link:
                        continue

                    profile_url = urljoin(self.base_url, profile_link['href'])
                    faculty_data = self.extract_faculty_profile(profile_url, dept_name)
                    if faculty_data:
                        faculty_list.append(faculty_data)
                        self.department_counter[dept_name] = self.department_counter.get(dept_name, 0) + 1
                        logger.info(f"Extracted faculty: {faculty_data['name']} from {dept_name}")

                except Exception as e:
                    logger.error(f"Error processing faculty div: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error extracting faculty from department {dept_name}: {str(e)}")

        return faculty_list

    def extract_faculty_profile(self, profile_url: str, department: str) -> Optional[Dict]:
        """Extract detailed information from a faculty profile page"""
        try:
            soup = self.get_page(profile_url)
            if not soup:
                return None

            # Extract basic information - updated selectors for MSRIT
            name = soup.select_one('h1.page-header')
            name = name.text.strip() if name else "Unknown"

            # Extract photo URL - updated selector for MSRIT
            photo_div = soup.select_one('div.profile-image')
            photo_url = None
            if photo_div and photo_div.find('img'):
                photo_url = urljoin(self.base_url, photo_div.find('img')['src'])

            # Extract research interests - updated selector for MSRIT
            interests_section = soup.find('div', string=re.compile('Research Interests', re.IGNORECASE))
            research_interests = []
            if interests_section:
                interests_text = interests_section.find_next('div', class_='panel-body')
                if interests_text:
                    research_interests = [interest.strip() for interest in interests_text.text.split(',')]

            # Extract publications - updated selector for MSRIT
            publications = []
            pub_section = soup.find('div', string=re.compile('Publications', re.IGNORECASE))
            if pub_section:
                pub_list = pub_section.find_next('div', class_='panel-body')
                if pub_list:
                    for pub in pub_list.find_all('div', class_='publication-item'):
                        title = pub.find('div', class_='title')
                        year = pub.find('div', class_='year')
                        venue = pub.find('div', class_='venue')
                        
                        if title:
                            publications.append({
                                'title': title.text.strip(),
                                'year': int(year.text.strip()) if year and year.text.strip().isdigit() else None,
                                'venue': venue.text.strip() if venue else None
                            })

            # Extract metrics - updated selector for MSRIT
            metrics = {}
            metrics_section = soup.find('div', class_='metrics-panel')
            if metrics_section:
                for metric in metrics_section.find_all('div', class_='metric-item'):
                    label = metric.find('div', class_='metric-label')
                    value = metric.find('div', class_='metric-value')
                    if label and value:
                        metrics[label.text.strip().lower()] = value.text.strip()

            return {
                'name': name,
                'department': department,
                'profile_url': profile_url,
                'photo_url': photo_url,
                'research_interests': research_interests,
                'publications': publications,
                'citations': int(metrics.get('citations', 0)),
                'h_index': int(metrics.get('h-index', 0)),
                'i10_index': int(metrics.get('i10-index', 0)),
                'scraped_at': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error extracting faculty profile from {profile_url}: {str(e)}")
            return None

    def scrape(self) -> Dict:
        """Main scraping function"""
        try:
            # Get the main page
            soup = self.get_page(self.base_url)
            if not soup:
                raise Exception("Could not fetch main page")

            # Extract departments
            departments = self.extract_departments(soup)
            logger.info(f"Found {len(departments)} departments")

            # Process each department
            for dept in departments:
                logger.info(f"Processing department: {dept['name']}")
                faculty_list = self.extract_faculty_from_department(dept['url'], dept['name'])
                self.faculty_data.extend(faculty_list)
                
                # Add a small delay between departments
                time.sleep(2)

            return {
                'faculty': self.faculty_data,
                'department_stats': self.department_counter,
                'total_faculty': len(self.faculty_data),
                'total_departments': len(departments)
            }

        except Exception as e:
            logger.error(f"Error in main scraping function: {str(e)}")
            return {
                'error': str(e),
                'faculty': self.faculty_data,
                'department_stats': self.department_counter
            }

def main():
    # Example usage
    base_url = "https://msrit.irins.org/"  # MSRIT IRINS URL
    scraper = IRINSScraper(base_url)
    results = scraper.scrape()
    
    # Save results to a JSON file
    with open('faculty_data.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Scraping completed. Found {results['total_faculty']} faculty members across {results['total_departments']} departments.")

if __name__ == "__main__":
    main() 