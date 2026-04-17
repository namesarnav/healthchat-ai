#!/bin/bash

git clone git@github.com:namesarnav/healthchat-ai.git
cp .env.example .env

echo " # Required — Gemini 2.5 Flash \
GEMINI_API_KEY=AIzaSyADRuz90-dq-ffVXWJkkCineOD5Q8aCbS0 \

# Required — Google Places API (Nearby Search) \
# Enable "Places API" in Google Cloud Console → APIs & Services \
GOOGLE_PLACES_API_KEY=AIzaSyDp1t88TrU4oar1wiyzIgqTbwrtuIguS4o \

# Set automatically by docker-compose; override for external MongoDB \
MONGO_URI=mongodb://mongo:27017/healthchat \

# CORS origins (comma-separated) \
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173 " >> .env

docker-compose up --build