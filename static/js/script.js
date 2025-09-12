 // Parse mines safely
        let mines = [];
        try {
            const raw = document.getElementById("mines-data").textContent;
            mines = JSON.parse(raw);
            console.log("Loaded mines:", mines);
        } catch (err) {
            console.error("Failed to parse mines JSON:", err);
        }

        // Initialize Leaflet map
        var map = L.map('map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Add markers
        if (Array.isArray(mines) && mines.length > 0) {
            mines.forEach((mine, idx) => {
                if (mine && typeof mine.lat === "number" && typeof mine.lon === "number") {
                    const marker = L.marker([mine.lat, mine.lon]).addTo(map).bindPopup(mine.name || `Mine ${idx + 1}`);

                    marker.on("click", function () {
                        fetch("/predict", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(mine)
                        })
                            .then(r => r.json())
                            .then(data => {
                                document.getElementById("info-box").innerHTML = `
                                <div class="info-container">
                                <h3>${data.name}</h3>
                                <p><b>Coordinates:</b> ${data.lat}, ${data.lon}</p>
                                <p><b>Slope Angle:</b> ${data.slope_angle}°</p>
                                <p><b>Rainfall:</b> ${data.rainfall} mm</p>
                                <p><b>Rock Type:</b> ${data.rock_type}</p>
                                <p><b>Risk:</b> <span class="${data.risk === 'High' ? 'risk-high' : 'risk-low'}">${data.risk}</span></p>
                                <p><b>Probability:</b> ${data.probability}%</p>
                                <h4>Probability Graph</h4>
                                <img src="${data.graph_prob}" class="graph"/>
                                <h4>Feature Values</h4>
                                <img src="${data.graph_feat}" class="graph"/>
                                </div>
                            `;
                            })
                            .catch(err => {
                                console.error("Prediction error:", err);
                                document.getElementById("info-box").innerHTML = `<p style="color:red">Prediction failed: ${err.message}</p>`;
                            });
                    });
                } else {
                    console.warn("Skipping mine with invalid coordinates:", mine);
                }
            });
        } else {
            console.warn("No mines data to display on map.");
        }