# Joint Check Service

This is a Flask-based web application for managing digital checks.

## Setup and Deployment

1. Install Google Cloud SDK: Follow the instructions [here](https://cloud.google.com/sdk/docs/install).

2. Initialize Google Cloud SDK: Run the following command and follow the prompts:

   ```bash
   gcloud init

3. Set the project:

   ```bash
   gcloud config set project [YOUR_PROJECT_ID]
   ```

4. Deploy the application:

   ```bash
   gcloud app deploy
   ```

## Local Development

1. Create a virtual environment and activate it:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:

   ```bash
   python app.py
   ```

## License

This project is licensed under the MIT License.
