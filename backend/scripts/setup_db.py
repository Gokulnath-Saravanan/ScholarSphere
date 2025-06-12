import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def read_sql_file(file_path):
    with open(file_path, 'r') as file:
        return file.read()

def main():
    try:
        # Initialize Supabase client
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment variables")
        
        supabase: Client = create_client(supabase_url, supabase_key)
        logger.info("Connected to Supabase")

        # Get the current directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        base_dir = os.path.dirname(current_dir)

        # Execute schema migrations
        schema_path = os.path.join(base_dir, 'app', 'database', 'migrations', '001_initial_schema.sql')
        schema_sql = read_sql_file(schema_path)
        logger.info("Executing schema migrations...")
        
        # Split the SQL into separate statements and execute each one
        statements = schema_sql.split(';')
        for statement in statements:
            if statement.strip():
                try:
                    supabase.db.execute(statement)
                except Exception as e:
                    logger.error(f"Error executing statement: {statement}")
                    logger.error(f"Error details: {str(e)}")

        # Insert sample data
        sample_data_path = os.path.join(base_dir, 'app', 'database', 'seeds', 'sample_data.sql')
        sample_data_sql = read_sql_file(sample_data_path)
        logger.info("Inserting sample data...")
        
        statements = sample_data_sql.split(';')
        for statement in statements:
            if statement.strip():
                try:
                    supabase.db.execute(statement)
                except Exception as e:
                    logger.error(f"Error executing statement: {statement}")
                    logger.error(f"Error details: {str(e)}")

        logger.info("Database setup completed successfully!")

    except Exception as e:
        logger.error(f"Database setup failed: {str(e)}")
        raise

if __name__ == "__main__":
    main() 