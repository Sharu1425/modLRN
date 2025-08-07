
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

# Database connection
client = None
db = None

async def init_db():
    """Initialize database connection"""
    global client, db
    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        # Add connection pooling and timeout settings
        client = AsyncIOMotorClient(
            mongo_uri,
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=30000,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=20000
        )
        db_name = os.getenv("DB_NAME", "modlrn")
        db = client[db_name]
        
        # Test the connection
        await client.admin.command('ping')
        print(f"✅ MongoDB Connected: {client.address}")
        return db
    except Exception as e:
        print(f"❌ MongoDB Connection Error: {e}")
        raise e

async def get_db():
    """Get database instance with retry logic"""
    global db
    if db is None:
        await init_db()
    
    # Test connection before returning
    try:
        await client.admin.command('ping')
        return db
    except Exception as e:
        print(f"❌ Database connection lost, reconnecting: {e}")
        await init_db()
        return db

async def close_db():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("🔌 MongoDB Connection Closed") 