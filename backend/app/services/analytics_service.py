from typing import Dict, List
from ..database.supabase import get_supabase_client

class AnalyticsService:
    def __init__(self):
        self.supabase = get_supabase_client()

    async def get_research_analytics(self) -> Dict:
        """Get research analytics data including metrics, trends, and department statistics"""
        try:
            # Get publication trends and research areas
            trends_response = await self.supabase.table('research_trends').select(
                'year, publication_count, citation_count, trending_score, topic, growth_rate'
            ).order('year', desc=False).execute()
            
            if not trends_response.data:
                raise ValueError("No research trends data found")

            # Get faculty metrics
            faculty_response = await self.supabase.table('faculty').select(
                'department, citations, h_index'
            ).execute()
            
            if not faculty_response.data:
                raise ValueError("No faculty data found")

            # Process trends data
            years_data = {}
            for trend in trends_response.data:
                year = trend.get('year')
                if year not in years_data:
                    years_data[year] = {
                        'publications': 0,
                        'citations': 0
                    }
                years_data[year]['publications'] += trend.get('publication_count', 0)
                years_data[year]['citations'] += trend.get('citation_count', 0)

            # Process department statistics
            department_stats = {}
            total_citations = 0
            total_h_index = 0
            faculty_count = len(faculty_response.data)

            for faculty in faculty_response.data:
                dept = faculty.get('department')
                if dept:
                    if dept not in department_stats:
                        department_stats[dept] = {'count': 0, 'citations': 0}
                    department_stats[dept]['count'] += 1
                    department_stats[dept]['citations'] += faculty.get('citations', 0)
                total_citations += faculty.get('citations', 0)
                total_h_index += faculty.get('h_index', 0)

            # Get top research areas
            top_research_response = await self.supabase.table('research_trends').select(
                'topic, trending_score, growth_rate'
            ).order('trending_score', desc=True).limit(10).execute()

            return {
                'facultyByDepartment': [
                    {
                        'department': dept,
                        'count': stats['count'],
                        'citations': stats['citations']
                    }
                    for dept, stats in department_stats.items()
                ],
                'publicationTrends': [
                    {
                        'year': year,
                        'publications': data['publications'],
                        'citations': data['citations']
                    }
                    for year, data in sorted(years_data.items())
                ],
                'topResearchAreas': [
                    {
                        'topic': area.get('topic'),
                        'score': area.get('trending_score'),
                        'growth_rate': area.get('growth_rate')
                    }
                    for area in (top_research_response.data or [])
                ],
                'metrics': {
                    'totalCitations': total_citations,
                    'averageHIndex': round(total_h_index / faculty_count if faculty_count else 0, 1),
                    'totalPublications': sum(data['publications'] for data in years_data.values()),
                    'totalFaculty': faculty_count
                }
            }

        except Exception as e:
            print(f"Error fetching analytics data: {str(e)}")
            raise
