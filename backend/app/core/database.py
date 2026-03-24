import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/purezone")
DB_NAME = os.getenv("DB_NAME", "purezone")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

