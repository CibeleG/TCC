import os
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from collections import defaultdict
from models import Movie

current_dir = os.path.dirname(os.path.abspath(__file__))
cf_model = os.path.join(current_dir, "cf_model.joblib")
cnn_model = os.path.join(current_dir, "cnn_model.h5")
user_map_dir = os.path.join(current_dir, "user_map.pkl")
movie_map_dir = os.path.join(current_dir, "movie_map.pkl")


# Classe CNNRecommender
class CNNRecommender:
    def __init__(self, cf_model, cnn_model_path=cnn_model, user_map_path=user_map_dir, movie_map_path=movie_map_dir):
        self.cf_model = cf_model
        self.cnn_model = None
        self.user_map = None
        self.movie_map = None
        
        # Carregar o modelo CNN pré-treinado
        self.load_cnn_model(cnn_model_path)
        
        # Carregar os mapeamentos de usuário e filme
        self.load_maps(user_map_path, movie_map_path)

    def load_cnn_model(self, model_path):
        # Carregar o modelo salvo
        self.cnn_model = load_model(model_path)

    def load_maps(self, user_map_path, movie_map_path):
        # Carregar os mapeamentos de usuário e filme
        self.user_map = joblib.load(user_map_path)
        self.movie_map = joblib.load(movie_map_path)

    def predict(self, userId, movieId):
        user_idx = self.user_map[userId]
        movie_idx = self.movie_map[movieId]
        return self.cnn_model.predict([[user_idx, movie_idx]]).flatten()[0]

    # def recommend_movies_for_new_user(self, preferred_genres, n=10):
    #     # Este método pode ser chamado diretamente sem precisar de base de dados
    #     # As recomendações ainda se baseiam na pontuação calculada pelos gêneros
    #     data = self.cf_model.train_data
    #     data['score'] = data['genres'].apply(lambda x: self.calculate_score(x, set(preferred_genres)))
    #     filtered_movies = data[data['score'] > 0]
    #     average_ratings = filtered_movies.groupby(['movieId', 'title', 'score'])['rating'].mean().reset_index()
    #     sorted_movies = average_ratings.sort_values(by=['score', 'rating'], ascending=[False, False])
    #     top_n_movies = sorted_movies.head(n)
    #     recommendations = [(row['title'], row['movieId'], row['rating']) for _, row in top_n_movies.iterrows()]
    #     return recommendations

    def recommend_movies_for_new_user(self, preferred_genres, n=10):
        """
        Recomenda filmes para um novo usuário com base em gêneros preferidos.
        
        :param preferred_genres: Lista de gêneros preferidos pelo usuário.
        :param n: Número de filmes a recomendar.
        :return: Lista de tuplas com (título, ID do filme, pontuação).
        """ 

        # Lista para armazenar filmes com seus gêneros e títulos
        movies_data = []

        # Presumindo que você tem um dicionário `movie_details` com detalhes dos filmes
        # O dicionário movie_details deve ser algo como: {movie_id: {'title': 'Movie Title', 'genres': 'Action|Comedy'}}
        
        for movie_id in self.movie_map.keys():  # Itera sobre os IDs de filmes presentes no movie_map
            movie_details = Movie.find_by_movie_id(movie_id)
            if movie_details:
                title = movie_details['title']
                genres = movie_details['genres']
                movies_data.append({'movieId': movie_id, 'title': title, 'genres': genres})

        # Calcular a pontuação de cada filme com base nos gêneros preferidos
        for movie in movies_data:
            movie['score'] = self.calculate_score(movie['genres'], set(preferred_genres))
        
        # Filtrar os filmes com pontuação positiva
        filtered_movies = [movie for movie in movies_data if movie['score'] > 0]

        # Ordenar os filmes pela pontuação e, secundariamente, por título para desempate
        sorted_movies = sorted(filtered_movies, key=lambda x: (-x['score'], x['title']))

        # Selecionar os top-n filmes
        top_n_movies = sorted_movies[:n]

        # Retornar tuplas (título, ID do filme, pontuação)
        recommendations = [(movie['title'], movie['movieId'], movie['score']) for movie in top_n_movies]
        return recommendations

    def recommend(self, userId, n=10):
        all_movies = list(self.movie_map.keys())
        predictions = [(movie_id, self.predict(userId, movie_id)) for movie_id in all_movies]
        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:n]

    def calculate_score(self, genres, preferred_genres):
        movie_genres = set(genres.split('|'))
        common_genres = movie_genres.intersection(preferred_genres)
        return len(common_genres)


# Classe ColaborativeFilteringRecommender
class ColaborativeFilteringRecommender:
    def __init__(self, cf_model_path=cf_model, user_map_path=user_map_dir, movie_map_path=movie_map_dir):
        self.algo = None
        self.user_map = None
        self.movie_map = None
        self.load_cf_model(cf_model_path)
        self.load_maps(user_map_path, movie_map_path)

    def load_cf_model(self, model_path):
        # Carregar o modelo colaborativo salvo
        self.algo = joblib.load(model_path)

    def load_maps(self, user_map_path, movie_map_path):
        # Carregar os mapeamentos de usuário e filme
        self.user_map = joblib.load(user_map_path)
        self.movie_map = joblib.load(movie_map_path)

    def predict(self, userId, movieId):
        return self.algo.predict(userId, movieId).est

    def recommend(self, userId, n=10):
        predictions = []
        for movieId in self.movie_map.keys():
            if movieId not in self.movie_map:
                continue
            predictions.append((movieId, self.predict(userId, movieId)))
        
        predictions.sort(key=lambda x: x[1], reverse=True)
        return predictions[:n]
