import os
from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions

def get_supabase_client(auth_header: str = None) -> Client:
    """
    Creates and returns a Supabase client. If a JWT token (from Authorization header)
    is provided, it configures the client to run with that user's permissions.
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        options = SyncClientOptions(headers={"Authorization": f"Bearer {token}"})
        return create_client(url, key, options=options)
        
    return create_client(url, key)
