import json
from supabase import create_client
import os
from dotenv import load_dotenv
import time

# Load environment variables from .env.local
load_dotenv('.env.local')

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in .env.local file")

supabase = create_client(supabase_url, supabase_key)
user = supabase.auth.sign_in_with_password({"email":"tom.arad.2001@gmail.com", "password":"@Ronaldo1779"})

def verify_connection():
    """Verify connection to Supabase"""
    try:
        # Try to fetch one row to verify connection
        result = supabase.table('one_piece_characters').select("*").limit(1).execute()
        print("✅ Successfully connected to Supabase")
        return True
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")
        return False

def load_characters_to_supabase():
    """
    Load One Piece characters data from JSON file to Supabase
    """
    if not verify_connection():
        return

    # Read the JSON file
    with open('../One Piece Script/one_piece_characters.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    characters = data['characters']
    batch_size = 25  # Reduced batch size
    total_characters = len(characters)
    
    print(f"Starting to load {total_characters} characters...")
    
    successful_inserts = 0
    failed_inserts = 0

    # Process in batches
    for i in range(0, total_characters, batch_size):
        batch = characters[i:i + batch_size]
        
        # Prepare batch data
        characters_data = [
            {
                'name': char['name'],
                'image_url': char['image_url'],
                'image_status': char['image_status'] if char['image_status'] in ['success', 'no_image_found', 'page_error'] else 'page_error',
                'wiki_url': char['wiki_url'],
                'gender': char['gender'],
                'is_canon': char['is_canon']
            }
            for char in batch
        ]
        
        try:
            # Insert batch into Supabase
            result = supabase.table('one_piece_characters').insert(characters_data).execute()
            successful_inserts += len(batch)
            print(f"✅ Processed {i + len(batch)}/{total_characters} characters")
            
            # Verify the insert by counting total rows
            if (i + len(batch)) % 100 == 0:
                count = supabase.table('one_piece_characters').select("*", count='exact').execute()
                print(f"Current total rows in database: {count.count}")
            
            # Add a small delay
            time.sleep(1.5)
            
        except Exception as e:
            failed_inserts += len(batch)
            print(f"❌ Error processing batch starting at index {i}")
            print(f"Error message: {str(e)}")
            # Print the first problematic record for debugging
            if characters_data:
                print("First record in failed batch:", characters_data[0])
            continue

    # Final verification
    try:
        final_count = supabase.table('one_piece_characters').select("*", count='exact').execute()
        print("\nFinal Statistics:")
        print(f"Total characters processed: {total_characters}")
        print(f"Successful inserts: {successful_inserts}")
        print(f"Failed inserts: {failed_inserts}")
        print(f"Total rows in database: {final_count.count}")
    except Exception as e:
        print(f"Error getting final count: {str(e)}")

if __name__ == "__main__":
    try:
        load_characters_to_supabase()
        print("\nScript execution completed!")
    except Exception as e:
        print(f"An error occurred: {str(e)}")