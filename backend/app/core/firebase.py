"""
Firebase Admin SDK setup.

This is DIFFERENT from the web/client config you use in your React frontend
(the apiKey/authDomain/etc. object). The backend needs a **service account
key** with elevated privileges to read/write Firestore directly and to
verify user auth tokens.

How to get your service account key:
  1. Go to https://console.firebase.google.com/
  2. Select your project: leetcod-cec3f
  3. Project settings (gear icon) -> Service accounts
  4. Click "Generate new private key" -> downloads a JSON file
  5. Save it as `serviceAccountKey.json` in the backend root
     (NEVER commit this file to git — it's already in .gitignore)

Alternatively, set the path via the FIREBASE_CREDENTIALS_PATH env var.
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from dotenv import load_dotenv

load_dotenv()

_CRED_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")

_db = None
_initialized = False


def init_firebase():
    global _db, _initialized
    if _initialized:
        return _db

    if not os.path.exists(_CRED_PATH):
        raise FileNotFoundError(
            f"Firebase service account key not found at '{_CRED_PATH}'.\n"
            f"Download it from Firebase Console -> Project Settings -> "
            f"Service Accounts -> Generate new private key."
        )

    cred = credentials.Certificate(_CRED_PATH)
    firebase_admin.initialize_app(cred, {
        "projectId": "leetcod-cec3f",
    })
    _db = firestore.client()
    _initialized = True
    return _db


def get_db():
    if not _initialized:
        return init_firebase()
    return _db


def verify_token(id_token: str) -> dict:
    """Verifies a Firebase Auth ID token sent from the frontend
    (e.g. in an Authorization: Bearer <token> header) and returns
    the decoded claims (includes 'uid', 'email', etc.)."""
    if not _initialized:
        init_firebase()
    return firebase_auth.verify_id_token(id_token)
