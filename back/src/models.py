import pymongo

from bson.objectid import ObjectId
from settings import settings
from utils import default_datetime

db_client = pymongo.MongoClient(settings.MONGO_DATABASE_URI)
db = db_client.get_database(settings.MONGO_DATABASE_NAME)

class User:
    def __init__(self, email, genres, dataset_id, recommendations):
        self.email = email
        self.genres = genres
        self.dataset_id = dataset_id
        self.recommendations = recommendations
    
    def save(self):
        user = {
            "email": self.email,
            "genres": self.genres,
            "dataset_id": self.dataset_id,
            "recommendations": self.recommendations,
            "created_at": default_datetime(),
            "updated_at": default_datetime(),
        }
        result = db.users.insert_one(user)
        return result.inserted_id
    
    def update_recommendations(recommendation_ids, user_id):
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"recommendations": {"$each": recommendation_ids}}}
        )

        if result.modified_count > 0:
            return user_id
        else:
            return None
    
    def update_genres(genres, user_id):
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"genres": {"$each": genres}}}
        )

        if result.modified_count > 0:
            return user_id
        else:
            return None
    
    def find():
        result = db.users.find({})
        return result
    
    def find_by_id(user_id):
        result = db.users.find({"_id": ObjectId(user_id)})
        key = next(result, None)
        return key
    
    def find_by_email(email):
        result = db.users.find({"email": email})
        user = next(result, None)
        return user

class Recommendation:
    def __init__(self, user_id, movie_id, title, score, sets):
        self.user_id = user_id
        self.movie_id = movie_id
        self.title = title
        self.score = score
        self.sets = sets
    
    def save(self):
        recommendation = {
            "user_id": self.user_id,
            "movie_id": self.movie_id,
            "title": self.title,
            "score": self.score,
            "sets": self.sets,
            "created_at": default_datetime(),
            "updated_at": default_datetime(),
        }
        result = db.recommendations.insert_one(recommendation)
        return result.inserted_id
    
    def save_many(recommendations):
        result = db.recommendations.insert_many(recommendations)
        return result.inserted_ids
    
    def find():
        result = db.recommendation.find({})
        return result
    
    def find_by_id(recommendation_id):
        result = db.recommendation.find({"_id": ObjectId(recommendation_id)})
        key = next(result, None)
        return key

class Movie:
    def find_by_movie_id(movie_id):
        result = db.movies.find({"movieId": int(movie_id)})
        key = next(result, None)
        return key