import os
import logging
import uuid
import pandas as pd
from models import User, Recommendation, Movie
from utils import default_datetime
from exceptions import UserNotFound, RecommendationNotFound
from settings import settings
import numpy as np
from keras.models import load_model
import joblib
from recommender import CNNRecommender, ColaborativeFilteringRecommender

# Os arquivos cf_model.joblib, cnn_model.h5, user_map.pkl, movie_map.pkl não foram carregados por 
# passarem do tamanho aceito pelo git, mas podem se encontrar no drive: 
# https://drive.google.com/drive/folders/1W6dx4nsWQuu-dx71O_m7m3AmRTbzgdEU?usp=sharing
# Carregar o modelo de filtro colaborativo
current_dir = os.path.dirname(os.path.abspath(__file__))
cf_model = os.path.join(current_dir, "cf_model.joblib")
cnn_model = os.path.join(current_dir, "cnn_model.h5")
user_map = os.path.join(current_dir, "user_map.pkl")
movie_map = os.path.join(current_dir, "movie_map.pkl")

# cf_model = joblib.load(cf_model_path)

cf_model = ColaborativeFilteringRecommender(cf_model_path=cf_model, user_map_path=user_map, movie_map_path=movie_map)
recommender = CNNRecommender(cf_model, cnn_model_path=cnn_model, user_map_path=user_map, movie_map_path=movie_map)

# Inicializando o recomendador com o modelo de filtro colaborativo
# recommender = CNNRecommender(cf_model, train_data)

# Carregar o modelo CNN treinado
# recommender.cnn_model = load_model(cnn_model_path)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class UserController:
    @staticmethod
    def login(payload):
        status = "novo"
        try:
            user = UserController.get_user_by_email(payload["email"])
            if user.get("dataset_id"):
                status = "existente"
        except UserNotFound:
            user = UserController.create_user(payload)
        return {"status": status, "user_id": user}

    @staticmethod
    def create_user(user):
        new_user = User(
            email=user.get("email"),
            genres=user.get("genres", []),
            dataset_id=user.get("dataset_id", ""),
            recommendations=user.get("recommendations", [])
        )

        user_id = new_user.save()

        return str(user_id)
    
    @staticmethod
    def update_user_recommendations(recommendation_ids, user_id):
        user_id = User.update_recommendations(recommendation_ids, user_id)

        return str(user_id)
    
    @staticmethod
    def update_user_genres(genres, user_id):
        user_id = User.update_genres(genres, user_id)

        return str(user_id)

    @staticmethod
    def get_users():
        users = User.find()
        users = list(users)

        for user in users:
            user["_id"] = str(user["_id"])
        return users
    
    @staticmethod
    def get_user_by_id(user_id):
        user = User.find_by_id(user_id)

        if not user:
            raise UserNotFound("Usuário não encontrado")
        user["_id"] = str(user["_id"])
        return user
    
    @staticmethod
    def get_user_by_email(user_email):
        user = User.find_by_email(user_email)

        if not user:
            raise UserNotFound("Usuário não encontrado")
        user["_id"] = str(user["_id"])
        return user

class RecommendationController:
    @staticmethod
    def create_recommendation(recommendations, user_id):
        new_recommendation = Recommendation(
            user_id=user_id,
            movie_id=recommendations["movie_id"],
            sets=recommendations["sets"],
            title=recommendations["title"],
            score=recommendations["score"],
        )

        recommendation_id = new_recommendation.save()

        return str(recommendation_id)
    
    @staticmethod
    def create_multiple_recommendations(recommendations):
        recommendation_ids = Recommendation.save_many(recommendations)

        for recommendation_id in recommendation_ids:
            recommendation_id = str(recommendation_id)

        return recommendation_ids

    @staticmethod
    def get_recommendations():
        recommendations = Recommendation.find()
        recommendations = list(recommendations)

        for recommendation in recommendations:
            recommendation["_id"] = str(recommendation["_id"])
        return recommendations
    
    @staticmethod
    def get_recommendation_by_id(recommendation_id):
        recommendation = Recommendation.find_by_id(recommendation_id)

        if not recommendation:
            raise RecommendationNotFound("Recomendação não encontrado")
        recommendation["_id"] = str(recommendation["_id"])
        return recommendation

class SRController:
    @staticmethod
    def map_recommendations_new_user(recommendations, user_id, sets):
        common_data = {
            "created_at": default_datetime(),
            "updated_at": default_datetime(),
            "user_id": user_id,
            "set": sets
        }
        recommendations_list = []

        for recommendation in recommendations:
            recommendation_data = {
                "title": recommendation[0],
                "movie_id": str(recommendation[1]),
                "score": recommendation[2],
                **common_data
            }
            recommendations_list.append(recommendation_data)
        return recommendations_list
    
    @staticmethod
    def map_recommendations_old_user(recommendations, user_id, sets):
        common_data = {
            "created_at": default_datetime(),
            "updated_at": default_datetime(),
            "user_id": user_id,
            "set": sets
        }
        recommendations_list = []

        for recommendation in recommendations:
            movie = Movie.find_by_movie_id(recommendation[0])
            recommendation_data = {
                "title": movie["title"],
                "movie_id": str(recommendation[0]),
                **common_data
            }
            recommendations_list.append(recommendation_data)
        return recommendations_list

    @staticmethod
    def recommend_new_user(genres, user_id):
        recommendations = recommender.recommend_movies_for_new_user(genres, n=5)
        sets = "primeira recomendação"
        recommendations = SRController.map_recommendations_new_user(recommendations, user_id, sets)
        recommendation_ids = RecommendationController.create_multiple_recommendations(recommendations)
        UserController.update_user_recommendations(recommendation_ids, user_id)
        for item in recommendations:
            item["_id"] = str(item["_id"])
        return recommendations
    
    @staticmethod
    def recommend(user_id):
        user = UserController.get_user_by_id(user_id)
        recommendations = recommender.recommend(user["dataset_id"], n=5)
        sets = "segunda recomendação"
        recommendations = SRController.map_recommendations_old_user(recommendations, user_id, sets)
        recommendation_ids = RecommendationController.create_multiple_recommendations(recommendations)
        UserController.update_user_recommendations(recommendation_ids, user_id)
        for item in recommendations:
            item["_id"] = str(item["_id"])

        return recommendations
