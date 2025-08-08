from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import numpy as np
from typing import Optional, Dict, Any

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise ValueError("Invalid token")

def euclidean_distance(descriptor1: list, descriptor2: list) -> float:
    """Calculate Euclidean distance between two face descriptors"""
    try:
        # Validate inputs
        if not isinstance(descriptor1, list) or not isinstance(descriptor2, list):
            print(f"❌ Invalid descriptor types")
            return float('inf')
        
        if len(descriptor1) != len(descriptor2):
            print(f"❌ Descriptor length mismatch")
            return float('inf')
        
        # Convert to numpy arrays for efficient calculation
        desc1 = np.array(descriptor1, dtype=np.float32)
        desc2 = np.array(descriptor2, dtype=np.float32)
        
        # Calculate Euclidean distance
        distance = np.linalg.norm(desc1 - desc2)
        result = float(distance)
        return result
    except Exception as e:
        print(f"❌ Error calculating Euclidean distance")
        return float('inf')

def validate_face_descriptor(descriptor: list) -> bool:
    """Validate face descriptor format"""
    try:
        if not isinstance(descriptor, list):
            return False
        
        if len(descriptor) != 128:  # Standard face descriptor length
            return False
        
        # Check if all values are numeric
        if not all(isinstance(x, (int, float)) for x in descriptor):
            return False
        
        return True
    except Exception:
        return False 