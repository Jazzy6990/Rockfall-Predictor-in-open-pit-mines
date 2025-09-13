Rockfall Risk Assessment System - README
📋 Project Overview
The Rockfall Risk Assessment System is a web application that analyzes and predicts rockfall risks in mining areas using geological and environmental factors. It provides real-time risk assessments, visualizations, and alerts for high-risk mining locations.

🚀 Features
Interactive Map: Visualize mine locations with Leaflet.js

Risk Prediction: Machine learning-based risk assessment using slope angle, rainfall, and rock type

Real-time Data: Fetches current rainfall data from Open-Meteo API

Alert System: Notifications for high-risk mines

User Input: Custom risk assessment with adjustable parameters

Data Visualization: Probability graphs and feature value charts

🛠️ Technology Stack
Backend
Flask: Python web framework

Scikit-learn: Machine learning model

Pandas: Data manipulation

Matplotlib: Graph generation

Requests: API calls for weather data

Frontend
HTML5/CSS3: Structure and styling

JavaScript: Interactive functionality

Leaflet.js: Interactive maps

Font Awesome: Icons

🎯 Usage Guide
Viewing Mine Information
The map displays mine locations with markers

Click on any mine marker to see its risk assessment

Risk information includes probability graphs and feature values

Custom Risk Assessment
Adjust the parameters using sliders and dropdowns:

Rainfall Intensity (mm/hr)

Rock Type (Granite, Limestone, Sandstone, etc.)

Slope Angle (degrees)

Click "Calculate Risk" to see the assessment

Understanding Results
Risk Level: High or Low risk classification

Probability: Percentage likelihood of rockfall

Graphs: Visual representations of risk probability and feature values

Recommendations: Actionable advice based on risk level

Alert System
The system automatically checks all mines for high risk

High-risk mines (probability > 70%) appear in the alert panel

Alerts update in real-time as you interact with the map
