#!/bin/bash

echo "Setting up VibeTrack..."

# Backend setup
echo "Setting up backend..."
cd backend
pip install -r requirements.txt
cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo "Setup complete!"
echo ""
echo "To run the backend:"
echo "  cd backend && uvicorn main:app --reload"
echo ""
echo "To run the frontend:"
echo "  cd frontend && npm run dev"
