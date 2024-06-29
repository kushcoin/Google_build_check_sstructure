import os
import datetime
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf.csrf import CSRFProtect
from waitress import serve
from dotenv import load_dotenv
#from utils import safe_str_cmp
load_dotenv()
# Initialize Flask app
app = Flask(__name__)

# Configure secret key and database URI
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

# Ensure that the DATABASE_URL and SECRET_KEY are set
if not app.config['SQLALCHEMY_DATABASE_URI']:
    raise ValueError("No DATABASE_URL set for Flask application. Did you forget to set it?")
if not app.config['SECRET_KEY']:
    raise ValueError("No SECRET_KEY set for Flask application. Did you forget to set it?")

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
csrf = CSRFProtect(app)

# Define your models (moved to models.py)
from models import User, Customer, Check

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.before_first_request
def create_tables():
    db.create_all()

# Define your routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.verify_password(data['password']):
        login_user(user)
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/customer', methods=['POST'])
@login_required
def add_customer():
    data = request.get_json()
    new_customer = Customer(
        user_id=current_user.id,
        business_name=data['business_name'],
        business_address=data['business_address'],
        phone_number=data['phone_number'],
        email=data['email'],
        bank_name=data['bank_name'],
        bank_account_number=data['bank_account_number'],
        bank_routing_number=data['bank_routing_number'],
        ein=data['ein'],
        incorporation_date=datetime.datetime.strptime(data['incorporation_date'], '%Y-%m-%d')
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer added successfully"}), 201

@app.route('/api/check', methods=['POST'])
@login_required
def issue_check():
    data = request.get_json()
    new_check = Check(
        payer_id=data['payer_id'],
        recipient_id=data['recipient_id'],
        amount=data['amount'],
        memo=data['memo'],
        date_issued=datetime.datetime.strptime(data['date_issued'], '%Y-%m-%d'),
        ipfs_hash=data['ipfs_hash']
    )
    db.session.add(new_check)
    db.session.commit()
    return jsonify({"message": "Check issued successfully"}), 201

from auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint)

from digcheckgen import digcheckgen as digcheckgen_blueprint
app.register_blueprint(digcheckgen_blueprint)
@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    if os.getenv('GAE_ENV', '').startswith('standard'):
        # Running on Google App Engine
        app.run(host='0.0.0.0', port=8080)
    else:
        # Running locally
        from waitress import serve
        serve(app, host='0.0.0.0', port=8080)
