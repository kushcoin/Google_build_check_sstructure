from app import db, bcrypt
import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)

    def verify_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(255), nullable=False)
    business_address = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    bank_name = db.Column(db.String(255), nullable=False)
    bank_account_number = db.Column(db.String(20), nullable=False)
    bank_routing_number = db.Column(db.String(9), nullable=False)
    ein = db.Column(db.String(9), nullable=False)
    incorporation_date = db.Column(db.Date, nullable=False)

class Check(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    payer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    memo = db.Column(db.String(255))
    date_issued = db.Column(db.Date, nullable=False, default=datetime.date.today)
    is_signed = db.Column(db.Boolean, default=False)
    is_confirmed = db.Column(db.Boolean, default=False)
    ipfs_hash = db.Column(db.String(255))
