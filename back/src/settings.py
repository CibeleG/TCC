import os

class Settings:
    def __init__(self):
        self.MONGO_DATABASE_URI = os.getenv("MONGO_DATABASE_URI", "mongodb+srv://cibele:cibele@sr.bbs3u.mongodb.net")
        self.MONGO_DATABASE_NAME = os.getenv("MONGO_DATABASE_NAME", "sistema-recomendacao")

settings = Settings()