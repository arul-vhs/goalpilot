import base64
import hashlib
import os
from cryptography.fernet import Fernet

def get_encryption_key() -> bytes:
    """
    Retrieves the encryption key from ENCRYPTION_KEY environment variable.
    If not set, derives a stable key from SUPABASE_KEY to ensure keys remain consistent
    across application restarts.
    """
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # Derive a stable 32-byte key from SUPABASE_KEY
        sb_key = os.getenv("SUPABASE_KEY", "default-fallback-secret-key-12345")
        hashed = hashlib.sha256(sb_key.encode()).digest()
        key = base64.urlsafe_b64encode(hashed).decode()
    
    return key.encode()

def encrypt_data(data: str) -> str:
    """
    Encrypts plain text string using Fernet AES encryption.
    """
    if not data:
        return ""
    key = get_encryption_key()
    f = Fernet(key)
    return f.encrypt(data.encode()).decode()

def decrypt_data(ciphertext: str) -> str:
    """
    Decrypts encrypted ciphertext using Fernet AES decryption.
    """
    if not ciphertext:
        return ""
    key = get_encryption_key()
    f = Fernet(key)
    try:
        return f.decrypt(ciphertext.encode()).decode()
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}")
