from dotenv import load_dotenv
import os
from supabase import create_client, Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    load_dotenv()
    
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found")
        
        supabase: Client = create_client(supabase_url, supabase_key)
        logger.info("Connected to Supabase")
        
        # Try to query different possible table names
        possible_tables = [
            "profiles",
            "users",
            "faculty",
            "publications",
            "research_works",
            "research",
            "departments",
            "institutions"
        ]
        
        for table in possible_tables:
            try:
                response = supabase.table(table).select("*").limit(1).execute()
                if response and hasattr(response, 'data'):
                    logger.info(f"\nFound table: {table}")
                    logger.info(f"Sample data structure: {response.data}")
                    if response.data:
                        logger.info(f"Columns: {list(response.data[0].keys())}")
            except Exception as e:
                logger.info(f"Table {table} not found or not accessible: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")

if __name__ == "__main__":
    main() 