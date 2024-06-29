from PIL import Image, ImageDraw, ImageFont
import datetime
import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.asymmetric import utils

def generate_check(payer, recipient, amount, memo, date, check_number):
    img = Image.new('RGB', (800, 400), color = (255, 255, 255))
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype("arial.ttf", 20)
    draw.text((50, 50), f"Payer: {payer}", font=font, fill=(0, 0, 0))
    draw.text((50, 100), f"Recipient: {recipient}", font=font, fill=(0, 0, 0))
    draw.text((50, 150), f"Amount: ${amount}", font=font, fill=(0, 0, 0))
    draw.text((50, 200), f"Date: {date}", font=font, fill=(0, 0, 0))
    draw.text((50, 250), f"Check Number: {check_number}", font=font, fill=(0, 0, 0))
    draw.text((50, 300), f"Memo: {memo}", font=font, fill=(0, 0, 0))
    img.save("digital_check.png")

def sign_check(data):
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    signature = private_key.sign(
        data,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return signature, private_key

def verify_signature(signature, data, public_key):
    public_key.verify(
        signature,
        data,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )

def send_check(api_key, api_secret, recipient_email, amount, description):
    url = "https://sandbox.checkbook.io/v3/check/digital"
    payload = {
        "recipient": recipient_email,
        "amount": amount,
        "description": description
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Basic {api_key}:{api_secret}"
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

payer = "John Doe"
recipient = "Jane Smith"
amount = "123.45"
memo = "Payment for services"
date = datetime.datetime.now().strftime("%Y-%m-%d")
check_number = "000123"
generate_check(payer, recipient, amount, memo, date, check_number)

with open("digital_check.png", "rb") as f:
    check_data = f.read()

signature, private_key = sign_check(check_data)
public_key = private_key.public_key()

api_key = "your_api_key"
api_secret = "your_api_secret"
recipient_email = "recipient@example.com"
description = "Payment for services"
response = send_check(api_key, api_secret, recipient_email, amount, description)
print(response)
