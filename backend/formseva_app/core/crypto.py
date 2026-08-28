import os
import base64
import hmac
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from formseva_app.core.config import settings

def get_master_key() -> bytes:
    """
    Returns the 32-byte master encryption key from the environment.
    If not set, uses a hardcoded one ONLY for local dev.
    In production, this MUST be set to a secure 32-byte base64 encoded string.
    """
    key_b64 = os.getenv("ENCRYPTION_MASTER_KEY", "bW9jay1tYXN0ZXIta2V5LWZvci1kZXYtcHVycG9zZXM=")
    key = base64.b64decode(key_b64)
    if len(key) != 32:
        # Pad or truncate to 32 bytes for AES-256
        key = hashlib.sha256(key).digest()
    return key

def generate_dek() -> bytes:
    """Generates a random 32-byte Data Encryption Key (DEK)."""
    return AESGCM.generate_key(bit_length=256)

def encrypt_dek(dek: bytes, master_key: bytes) -> str:
    """Encrypts the DEK using the Master Key (Envelope Encryption)."""
    aesgcm = AESGCM(master_key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, dek, None)
    # Return nonce + ciphertext as base64 string
    return base64.b64encode(nonce + ciphertext).decode('utf-8')

def decrypt_dek(wrapped_dek_b64: str, master_key: bytes) -> bytes:
    """Decrypts the wrapped DEK using the Master Key."""
    encrypted_data = base64.b64decode(wrapped_dek_b64)
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    aesgcm = AESGCM(master_key)
    return aesgcm.decrypt(nonce, ciphertext, None)

def encrypt_data(plaintext: str, dek: bytes) -> str:
    """Encrypts plaintext using the Data Encryption Key."""
    if not plaintext:
        return ""
    aesgcm = AESGCM(dek)
    nonce = os.urandom(12)
    data_bytes = plaintext.encode('utf-8')
    ciphertext = aesgcm.encrypt(nonce, data_bytes, None)
    return base64.b64encode(nonce + ciphertext).decode('utf-8')

def decrypt_data(ciphertext_b64: str, dek: bytes) -> str:
    """Decrypts ciphertext using the Data Encryption Key."""
    if not ciphertext_b64:
        return ""
    try:
        encrypted_data = base64.b64decode(ciphertext_b64)
        nonce = encrypted_data[:12]
        ciphertext = encrypted_data[12:]
        aesgcm = AESGCM(dek)
        plaintext_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext_bytes.decode('utf-8')
    except Exception as e:
        print(f"[Crypto] Decryption failed: {e}")
        return "***DECRYPTION_ERROR***"

def blind_index(value: str, master_key: bytes) -> str:
    """
    Creates a deterministic hash of the value using HMAC-SHA256 and the master key.
    Used for exact-match lookups on encrypted columns (e.g. email).
    """
    if not value:
        return ""
    value = value.lower().strip()
    h = hmac.new(master_key, value.encode('utf-8'), hashlib.sha256)
    return h.hexdigest()
