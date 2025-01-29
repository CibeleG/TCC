import logging
from flask import Blueprint, request, jsonify
from controllers import SRController, RecommendationController, UserController
from exceptions import UserNotFound, RecommendationNotFound

bp = Blueprint("transference", __name__)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

@bp.route("/health", methods=["GET"])
def health_check():
    return {"status":"ok", "message":"Service is healthy"}

@bp.route("/user", methods=["POST"])
def create_user():
    try:
        payload = request.get_json()
        user_id = UserController.create_user(payload)

        return jsonify({"status": "success", "message": f"Usuário criada com sucesso. ID: {user_id}", "id": {user_id}})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400

@bp.route("/login", methods=["POST"])
def login():
    try:
        payload = request.get_json()
        user = UserController.login(payload)
        return jsonify({"status": "success", "message": f"Usuário logado com sucesso.", "user_id": user["user_id"], "status": user["status"]})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400

@bp.route("/genres/<user_id>", methods=["POST"])
def update_genres(user_id):
    try:
        payload = request.get_json()
        user_id = UserController.update_user_genres(payload["genres"], user_id)
        return jsonify({"status": "success", "message": f"Usuário atualizado com sucesso.", "user_id": user})
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400

@bp.route("/user", methods=["GET"])
def get_users():
    try:
        users = UserController.get_users()
        return {"result": users}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400
    
@bp.route("/user/<user_id>", methods=["GET"])
def get_user_by_id(user_id):
    try:
        user = UserController.get_user_by_id(user_id)
        return {"result": user}
    except UserNotFound as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 404, "message": str(e)}), 404
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400

@bp.route("/user-email/<user_email>", methods=["GET"])
def get_user_by_email(user_email):
    try:
        user = UserController.get_user_by_email(user_email)
        return {"result": user}
    except UserNotFound as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 404, "message": str(e)}), 404
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400
    
@bp.route("/recommendation/<user_id>", methods=["GET"])
def recommendation(user_id):
    try:
        recommendations = SRController.recommend(user_id)
        return {"result": recommendations}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400

@bp.route("/recommendation/<user_id>", methods=["POST"])
def recommendation_new_user(user_id):
    try:
        payload = request.get_json()
        recommendations = SRController.recommend_new_user(payload["genres"], user_id)
        return {"result": recommendations}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"status": 400, "message": str(e)}), 400