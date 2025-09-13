// Parse mines safely
let mines = [];
try {
  const raw = document.getElementById("mines-data").textContent;
  mines = JSON.parse(raw);
  console.log("Loaded mines:", mines);
} catch (err) {
  console.error("Failed to parse mines JSON:", err);
}

// synced inputs and ranges
const rainfallInput = document.getElementById("rainfall");
const rainfallRange = document.getElementById("rainfall-range");
const slopeAngleInput = document.getElementById("slope-angle");
const slopeAngleRange = document.getElementById("slope-angle-range");
const rockTypeSelect = document.getElementById("rock-type");
const calculateBtn = document.getElementById("calculate-btn");

rainfallRange.value = rainfallInput.value;
slopeAngleRange.value = slopeAngleInput.value;

rainfallInput.addEventListener("input", () => {
  rainfallRange.value = rainfallInput.value;
  updateResults();
});

rainfallRange.addEventListener("input", () => {
  rainfallInput.value = rainfallRange.value;
  updateResults();
});

// Sync slope angle input and range
slopeAngleInput.addEventListener("input", () => {
  slopeAngleRange.value = slopeAngleInput.value;
  updateResults();
});

slopeAngleRange.addEventListener("input", () => {
  slopeAngleInput.value = slopeAngleRange.value;
  updateResults();
});

// Update results when rock type changes
rockTypeSelect.addEventListener("change", updateResults);

function updateResults() {
  document
    .querySelectorAll(".feature")[0]
    .querySelector(".feature-value").textContent =
    rainfallInput.value + " mm/hr";

  document
    .querySelectorAll(".feature")[1]
    .querySelector(".feature-value").textContent =
    rockTypeSelect.options[rockTypeSelect.selectedIndex].text;

  document
    .querySelectorAll(".feature")[2]
    .querySelector(".feature-value").textContent = slopeAngleInput.value + "°";
}

// Calculate button handler
calculateBtn.addEventListener("click", function () {
  // Get values from inputs
  const rainfall = rainfallInput.value;
  const slopeAngle = slopeAngleInput.value;
  const rockType = rockTypeSelect.value;

  // Create a mock mine object with the input data
  const userInputMine = {
    name: "User Input Location",
    lat: map.getCenter().lat, // Use current map center
    lon: map.getCenter().lng, // Use current map center
    rainfall: rainfall,
    slope_angle: slopeAngle,
    rock_type: rockType,
  };

  // Call prediction API
  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userInputMine),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Display results in the info box
      document.getElementById("info-box").innerHTML = `
            <div class="info-container">
                <h3>${data.name}</h3>
                <p><b>Coordinates:</b> ${data.lat.toFixed(
                  4
                )}, ${data.lon.toFixed(4)}</p>
                <p><b>Slope Angle:</b> ${data.slope_angle}°</p>
                <p><b>Rainfall:</b> ${data.rainfall} mm</p>
                <p><b>Rock Type:</b> ${data.rock_type}</p>
                <p><b>Risk:</b> <span class="${
                  data.risk === "High" ? "risk-high" : "risk-low"
                }">${data.risk}</span></p>
                <p><b>Probability:</b> ${data.probability}%</p>
                <h4>Probability Graph</h4>
                <img src="${data.graph_prob}" class="graph"/>
                <h4>Feature Values</h4>
                <img src="${data.graph_feat}" class="graph"/>
            </div>`;
    })
    .catch((err) => {
      console.error("Prediction error:", err);
      document.getElementById(
        "info-box"
      ).innerHTML = `<p style="color:red">Prediction failed: ${err.message}</p>`;
    });
});

// Initialize Leaflet map
var map = L.map("map", {
  minZoom: 4,
  maxZoom: 15,
}).setView([20.5937, 78.9629], 5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Add markers
if (Array.isArray(mines) && mines.length > 0) {
  mines.forEach((mine, idx) => {
    if (mine && typeof mine.lat === "number" && typeof mine.lon === "number") {
      const marker = L.marker([mine.lat, mine.lon])
        .addTo(map)
        .bindPopup(mine.name || `Mine ${idx + 1}`);

      marker.on("click", function () {
        fetch("/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mine),
        })
          .then((r) => r.json())
          .then((data) => {
            document.getElementById("info-box").innerHTML = `
             <div class="info-container">
            <h3>${data.name}</h3>
            <p><b>Coordinates:</b> ${data.lat}, ${data.lon}</p>
            <p><b>Slope Angle:</b> ${data.slope_angle}°</p>
            <p><b>Rainfall:</b> ${data.rainfall} mm</p>
            <p><b>Rock Type:</b> ${data.rock_type}</p>
            <p><b>Risk:</b> <span class="${
              data.risk === "High" ? "risk-high" : "risk-low"
            }">${data.risk}</span></p>
            <p><b>Probability:</b> ${data.probability}%</p>
            <h4>Probability Graph</h4>
            <img src="${data.graph_prob}" class="graph"/>
            <h4>Feature Values</h4>
            <img src="${data.graph_feat}" class="graph"/>
            </div>`;

            // Update risk alerts with the new data
            updateRiskAlerts(mine, data);
          })
          .catch((err) => {
            console.error("Prediction error:", err);
            document.getElementById(
              "info-box"
            ).innerHTML = `<p style="color:red">Prediction failed: ${err.message}</p>`;
          });
      });
    } else {
      console.warn("Skipping mine with invalid coordinates:", mine);
    }
  });
} else {
  console.warn("No mines data to display on map.");
}

// Risk Alert System
let highRiskMines = [];


function showRiskAlerts() {
  
  const alertContent = document.getElementById("risk-alert-content");
  alertContent.innerHTML = "";

  if (highRiskMines.length === 0) {
    alertContent.innerHTML =
      '<div class="no-high-risk">No high risk mines detected</div>';
  } else {
    highRiskMines.forEach((mine) => {
      const mineElement = document.createElement("div");
      mineElement.className = "alert-mine-item";
      mineElement.innerHTML = `
                <div class="alert-mine-name">${mine.name}</div>
                <div class="alert-mine-details">
                    <p><b>Risk:</b> ${mine.risk} (${mine.probability}%)</p>
                    <p><b>Location:</b> ${mine.lat.toFixed(
                      4
                    )}, ${mine.lon.toFixed(4)}</p>
                </div>
            `;
      alertContent.appendChild(mineElement);
    });
  }

  document.getElementById("risk-alert-container").style.display = "block";
}


function checkAllMinesRisk() {
  highRiskMines = [];
  let checked = 0;


  if (!mines || mines.length === 0) {
    const alertContent = document.getElementById("risk-alert-content");
    alertContent.innerHTML =
      '<div class="no-high-risk">No mines data available</div>';
    return;
  }

  mines.forEach((mine, idx) => {
    if (mine && typeof mine.lat === "number" && typeof mine.lon === "number") {
      fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mine),
      })
        .then((r) => r.json())
        .then((data) => {
          checked++;

          if (data.risk === "High" && data.probability > 70) {
            highRiskMines.push({
              name: mine.name || `Mine ${idx + 1}`,
              lat: mine.lat,
              lon: mine.lon,
              risk: data.risk,
              probability: data.probability,
            });
          }

    
          if (checked === mines.length) {
            showRiskAlerts();
          }
        })
        .catch((err) => {
          console.error("Error checking mine risk:", err);
          checked++;
     
          if (checked === mines.length) {
            showRiskAlerts();
          }
        });
    } else {
      checked++; 
    }
  });
}


function updateRiskAlerts(mine, data) {
  if (data.risk === "High" && data.probability > 60) {

    const existingIndex = highRiskMines.findIndex(
      (m) => m.lat === mine.lat && m.lon === mine.lon
    );

    if (existingIndex === -1) {
  
      highRiskMines.push({
        name: mine.name || "Unknown Mine",
        lat: mine.lat,
        lon: mine.lon,
        risk: data.risk,
        probability: data.probability,
      });

  
      showRiskAlerts();
    }
  }
}


document.addEventListener("DOMContentLoaded", function () {

  setTimeout(checkAllMinesRisk, 1000);
});
