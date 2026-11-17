#!/usr/bin/env python3
"""
Demo Flask API - Simple REST API to demonstrate the Speculative Engine

This is a simple Flask API that we'll use as the target for our speculative engine demo.
The engine will add authentication to this API using 3 different strategies.
"""

from flask import Flask, request, jsonify
from functools import wraps
import os

app = Flask(__name__)

# In-memory "database"
users_db = {
    "alice": {"id": 1, "username": "alice", "email": "alice@example.com", "password_hash": "hashed_password_1"},
    "bob": {"id": 2, "username": "bob", "email": "bob@example.com", "password_hash": "hashed_password_2"},
}

posts_db = [
    {"id": 1, "title": "First Post", "content": "Hello World!", "author_id": 1},
    {"id": 2, "title": "Second Post", "content": "Building APIs with Flask", "author_id": 2},
]

# Simple in-memory auth (no auth yet - the engine will add this!)
def get_current_user():
    """Placeholder - the speculative engine will replace this with real auth"""
    return None


# Public endpoints
@app.route('/')
def index():
    return jsonify({
        "name": "Demo API",
        "version": "1.0.0",
        "description": "Simple Flask API for Speculative Engine demo",
        "endpoints": {
            "GET /": "This page",
            "GET /posts": "List all posts",
            "GET /posts/<id>": "Get a specific post",
            "POST /posts": "Create a new post (requires auth)",
            "GET /users": "List users (requires auth)",
            "POST /login": "Login endpoint (to be implemented)",
        }
    })


@app.route('/posts', methods=['GET'])
def get_posts():
    return jsonify({"posts": posts_db})


@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = next((p for p in posts_db if p['id'] == post_id), None)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    return jsonify(post)


# Protected endpoints (will require auth after engine adds it)
@app.route('/posts', methods=['POST'])
def create_post():
    # TODO: Add auth middleware here
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({"error": "Title and content required"}), 400

    new_post = {
        "id": len(posts_db) + 1,
        "title": data['title'],
        "content": data['content'],
        "author_id": 1,  # Would come from auth
    }
    posts_db.append(new_post)
    return jsonify(new_post), 201


@app.route('/users', methods=['GET'])
def get_users():
    # TODO: Add auth middleware here
    return jsonify({"users": [
        {"id": u["id"], "username": u["username"], "email": u["email"]}
        for u in users_db.values()
    ]})


# Auth endpoints (to be implemented by the engine)
@app.route('/login', methods=['POST'])
def login():
    """Login endpoint - will be implemented by the speculative engine"""
    return jsonify({
        "message": "Login endpoint - will be implemented by speculative engine",
        "note": "The speculative engine will add authentication strategies here"
    }), 501


@app.route('/health')
def health():
    return jsonify({"status": "healthy"})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)