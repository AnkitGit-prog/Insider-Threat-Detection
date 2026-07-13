FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory (including the models/best_random_forest.pkl)
COPY . .

# Expose the API port
EXPOSE 5000

# Start the Flask server
CMD ["python", "app.py"]
