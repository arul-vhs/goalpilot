import os
import json
import datetime
import pytz
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from app.utils.crypto_helper import decrypt_data, encrypt_data
from app.utils.supabase_client import get_supabase_admin_client, get_supabase_client
from supabase import Client

def get_client_secret_path() -> str:
    """
    Finds the client_secret.json or client_secret.json.json file.
    Checks the Render secrets path, backend folder, workspace root, and typical paths.
    """
    # 1. Render Secrets Path
    render_secret_path = "/etc/secrets/client_secret.json"
    if os.path.exists(render_secret_path):
        return render_secret_path

    # 2. Local development fallback paths
    # Current file is in goalpilot-backend/app/utils/
    # Parent parent is goalpilot-backend/
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    paths_to_try = [
        os.path.join(base_dir, "client_secret.json"),
        os.path.join(base_dir, "client_secret.json.json"),
        os.path.join(os.path.dirname(base_dir), "client_secret.json"),
        os.path.join(os.path.dirname(base_dir), "client_secret.json.json"),
        "client_secret.json",
        "client_secret.json.json",
    ]
    
    for path in paths_to_try:
        if os.path.exists(path):
            return path
            
    raise FileNotFoundError("Google Calendar client_secret.json file not found in search paths.")

def get_google_credentials(user_id: str, supabase_client: Client) -> Credentials:
    """
    Retrieves, decrypts, and potentially refreshes Google OAuth credentials from Supabase profiles.
    """
    res = supabase_client.table("profiles").select("google_access_token, google_refresh_token").eq("id", user_id).maybe_single().execute()
    if not res or not res.data:
        raise ValueError(f"User profile for user {user_id} not found in database.")
        
    enc_access = res.data.get("google_access_token")
    enc_refresh = res.data.get("google_refresh_token")
    
    if not enc_access:
        raise ValueError("Google account is not linked. Please connect Google Calendar first.")
        
    access_token = decrypt_data(enc_access)
    refresh_token = decrypt_data(enc_refresh) if enc_refresh else None
    
    secret_path = get_client_secret_path()
    with open(secret_path, "r") as f:
        secret_data = json.load(f)
        
    web_config = secret_data.get("web", secret_data.get("installed", {}))
    
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri=web_config.get("token_uri"),
        client_id=web_config.get("client_id"),
        client_secret=web_config.get("client_secret"),
        scopes=[
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    )
    
    # Refresh access token if it has expired and a refresh token is present
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Save the new encrypted access token back to Supabase
            new_enc_access = encrypt_data(creds.token)
            admin_client = get_supabase_admin_client()
            admin_client.table("profiles").update({"google_access_token": new_enc_access}).eq("id", user_id).execute()
        except Exception as e:
            raise ValueError(f"Failed to refresh Google access token: {str(e)}")
            
    return creds

def get_busy_times(user_id: str) -> tuple[list[tuple[datetime.datetime, datetime.datetime]], pytz.BaseTzInfo]:
    """
    Fetches the user's primary calendar events for the next 7 days.
    Returns:
        - A sorted list of (start_time, end_time) tuples of busy times.
        - The user's primary calendar timezone.
    """
    admin_client = get_supabase_admin_client()
    creds = get_google_credentials(user_id, admin_client)
    
    service = build('calendar', 'v3', credentials=creds)
    
    # Get user primary calendar timezone
    try:
        calendar_info = service.calendars().get(calendarId='primary').execute()
        tz_name = calendar_info.get('timeZone', 'UTC')
    except Exception:
        tz_name = 'UTC'
        
    user_tz = pytz.timezone(tz_name)
    
    # Range: Next 7 days
    now = datetime.datetime.now(datetime.timezone.utc)
    time_min = now.isoformat()
    time_max = (now + datetime.timedelta(days=7)).isoformat()
    
    # Fetch events
    events_result = service.events().list(
        calendarId='primary',
        timeMin=time_min,
        timeMax=time_max,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    items = events_result.get('items', [])
    busy_times = []
    
    for event in items:
        start_str = event.get('start', {}).get('dateTime') or event.get('start', {}).get('date')
        end_str = event.get('end', {}).get('dateTime') or event.get('end', {}).get('date')
        
        if not start_str or not end_str:
            continue
            
        start_dt = parse_calendar_datetime(start_str, user_tz)
        end_dt = parse_calendar_datetime(end_str, user_tz)
        
        busy_times.append((start_dt, end_dt))
        
    busy_times.sort(key=lambda x: x[0])
    return busy_times, user_tz

def parse_calendar_datetime(dt_str: str, default_tz: pytz.BaseTzInfo) -> datetime.datetime:
    """
    Parses a Google Calendar date/datetime string into a timezone-aware datetime.
    """
    if len(dt_str) == 10:  # all day event 'YYYY-MM-DD'
        naive_dt = datetime.datetime.strptime(dt_str, "%Y-%m-%d")
        return default_tz.localize(naive_dt)
        
    # Standard ISO format parsing
    # Handle 'Z' suffix
    s = dt_str.replace('Z', '+00:00')
    try:
        return datetime.datetime.fromisoformat(s)
    except ValueError:
        # Fallback using dateutil parser
        from dateutil import parser
        dt = parser.parse(s)
        if dt.tzinfo is None:
            return default_tz.localize(dt)
        return dt

def find_next_free_slot(busy_times: list[tuple[datetime.datetime, datetime.datetime]], duration_minutes: int, user_tz: pytz.BaseTzInfo, start_from: datetime.datetime = None) -> datetime.datetime:
    """
    Finds the first available gap (between 9 AM and 6 PM) in the user's schedule of at least duration_minutes.
    """
    if start_from is not None:
        start_search = start_from.astimezone(user_tz)
        now_user = start_search
    else:
        now_user = datetime.datetime.now(user_tz)
        # Start checking from current time. Round up to the next 15-minute mark.
        minutes = (now_user.minute // 15 + 1) * 15
        start_search = now_user.replace(minute=0, second=0, microsecond=0) + datetime.timedelta(minutes=minutes)
    
    duration = datetime.timedelta(minutes=duration_minutes)
    
    # Scan up to 7 days ahead
    for day_offset in range(8):
        check_date = (start_search + datetime.timedelta(days=day_offset)).date()
        
        # Define working hours boundary (9:00 to 18:00) in user's timezone
        day_start = user_tz.localize(datetime.datetime.combine(check_date, datetime.time(9, 0, 0)))
        day_end = user_tz.localize(datetime.datetime.combine(check_date, datetime.time(18, 0, 0)))
        
        # Ensure we don't schedule in the past on the first day
        candidate = max(day_start, start_search)
        
        while candidate + duration <= day_end:
            candidate_end = candidate + duration
            overlap = False
            
            for busy_start, busy_end in busy_times:
                b_start = busy_start.astimezone(user_tz)
                b_end = busy_end.astimezone(user_tz)
                
                # Check overlap: max(start1, start2) < min(end1, end2)
                if max(candidate, b_start) < min(candidate_end, b_end):
                    overlap = True
                    # Move candidate window to the end of this busy event
                    candidate = b_end
                    # Round candidate to next 15-minute boundary
                    if candidate.minute % 15 != 0:
                        mins_to_add = 15 - (candidate.minute % 15)
                        candidate = candidate + datetime.timedelta(minutes=mins_to_add)
                    candidate = candidate.replace(second=0, microsecond=0)
                    break
            
            if not overlap:
                return candidate
                
    # Fallback: schedule tomorrow at 9 AM
    tomorrow = (now_user + datetime.timedelta(days=1)).date()
    return user_tz.localize(datetime.datetime.combine(tomorrow, datetime.time(9, 0, 0)))

def create_calendar_event(user_id: str, title: str, description: str, start_time: datetime.datetime, duration_minutes: int) -> str:
    """
    Creates a Calendar Event on the user's primary calendar.
    Returns the google_event_id.
    """
    admin_client = get_supabase_admin_client()
    creds = get_google_credentials(user_id, admin_client)
    service = build('calendar', 'v3', credentials=creds)
    
    end_time = start_time + datetime.timedelta(minutes=duration_minutes)
    
    event_body = {
        'summary': title,
        'description': description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': str(start_time.tzinfo),
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': str(start_time.tzinfo),
        },
        'reminders': {
            'useDefault': True,
        },
    }
    
    res = service.events().insert(calendarId='primary', body=event_body).execute()
    return res.get('id')
