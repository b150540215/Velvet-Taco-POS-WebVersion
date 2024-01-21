let weather = {
  apiKey: "945d955f17a82fd46ed2f60d2f777f48",
  fetchWeather: function () {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=College Station&units=imperial&appid=" +
        this.apiKey
    )
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => this.displayWeather(data));
  },
  displayWeather: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;

    const dropdownContent = `
      <h2 class="city">${name}</h2>
      <h1 class="temp">${temp}°F</h1>
      <div class="flex">
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="" class="icon" />
        <div class="description">${description}</div>
      </div>
      <div class="humidity">Humidity: ${humidity}%</div>
      <div class="wind">Wind speed: ${speed} m/hr</div>
    `;

    const weatherDropdown = document.getElementById("weatherDropdown");
    weatherDropdown.innerHTML = dropdownContent;
    weatherDropdown.classList.remove("hidden");
  },
};

document.getElementById("weatherLink").addEventListener("click", function (event) {
  // Prevent the default behavior of the link
  event.preventDefault();

  // Check if the weather dropdown is already visible
  const weatherDropdown = document.getElementById("weatherDropdown");
  const isDropdownVisible = !weatherDropdown.classList.contains("hidden");

  // Only fetch weather data if the dropdown is not already visible
  if (!isDropdownVisible) {
    weather.fetchWeather();
  }

  // Toggle the visibility of the weather dropdown
  weatherDropdown.classList.toggle("hidden");
});






