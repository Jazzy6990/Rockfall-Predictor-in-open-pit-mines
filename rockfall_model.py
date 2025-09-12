from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import random
import requests
import io
import base64
import matplotlib.pyplot as plt

app = Flask(__name__)

# Load your trained model
model = joblib.load("model.pkl")

# Example Indian mines
mines = [
    {"name": "Bailadila Iron Ore Mine", "lat": 18.7167, "lon": 81.2333},
    {"name": "Jharia Coal Mine", "lat": 23.7402, "lon": 86.4145},
    {"name": "Singrauli Coalfield", "lat": 24.1992, "lon": 82.6754},
]

@app.route("/")
def index():
    return render_template("index.html", mines=mines)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    lat = data.get("lat")
    lon = data.get("lon")
    name = data.get("name", "Selected Location")
    
    # Check if user provided custom values or use random/default values
    if "rainfall" in data:
        # User provided custom values
        rainfall = data.get("rainfall")
        slope_angle = data.get("slope_angle")
        rock_type = data.get("rock_type", "Other")
        rock_type_granite = 1 if rock_type.lower() == "granite" else 0
    else:
        # Use random values (for map clicks)
        try:
            resp = requests.get(
                f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=precipitation",
                timeout=6
            )
            rainfall = resp.json().get("hourly", {}).get("precipitation", [0])[0]
        except:
            rainfall = random.randint(0, 100)
        
        slope_angle = random.randint(5, 60)
        rock_type_granite = random.choice([0, 1])
        rock_type = "Granite" if rock_type_granite else "Other"

    X = pd.DataFrame([{
        "slope_angle": slope_angle,
        "rainfall": rainfall,
        "rock_type_granite": rock_type_granite
    }])

    try:
        risk_pred = int(model.predict(X)[0])
        prob = float(model.predict_proba(X)[0][1] * 100)
    except:
        risk_pred = 0
        prob = random.uniform(0, 100)

    # --- Probability graph ---
    fig1, ax1 = plt.subplots(figsize=(4,2))
    ax1.bar(["Probability"], [prob], color="red" if risk_pred else "green")
    ax1.set_ylim(0,100)
    ax1.set_ylabel("Risk %")
    ax1.set_title("Rockfall Risk Probability")
    buf1 = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf1, format="png")
    buf1.seek(0)
    graph_prob = base64.b64encode(buf1.read()).decode("ascii")
    plt.close(fig1)

    # --- Feature graph ---
    fig2, ax2 = plt.subplots(figsize=(4,2))
    ax2.bar(["Slope Angle","Rainfall"], [slope_angle, rainfall], color=["blue","orange"])
    ax2.set_title("Mine Feature Values")
    buf2 = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf2, format="png")
    buf2.seek(0)
    graph_feat = base64.b64encode(buf2.read()).decode("ascii")
    plt.close(fig2)

    return jsonify({
        "name": name,
        "lat": lat,
        "lon": lon,
        "slope_angle": slope_angle,
        "rainfall": rainfall,
        "rock_type": rock_type,
        "risk": "High" if risk_pred else "Low",
        "probability": round(prob,2),
        "graph_prob": f"data:image/png;base64,{graph_prob}",
        "graph_feat": f"data:image/png;base64,{graph_feat}"
    })




if __name__ == "__main__":
    app.run(debug=True)