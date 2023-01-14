"use strict";

const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const cityName = document.querySelector("#city-name");
const currentTime = document.querySelector("#current-time");
const tempNumber = document.querySelector("#temp-number");
const highTemp = document.querySelector("#high-temp");
const lowTemp = document.querySelector("#low-temp");
const iconImage = document.querySelector("#icon-image");
const weatherDescription = document.querySelector("#weather-description");
const APIkey = "5943b09bd72402e9560b276898d410f0";

//When search button is clicked

searchBtn.addEventListener("click", () => {
  updateCurrentWeatherDisplay();
});

searchInput.value = "Oakland";

//first get coordinates based on input
async function getLatAndLon() {
  let cityName = searchInput.value.trim();
  //first use this to get the latitude and longitude of the city
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},us&appid=5943b09bd72402e9560b276898d410f0`,
    { mode: "cors" }
  );
  const data = await response.json();
  let cityCoordinates = [data[0].lat, data[0].lon];
  //extract out the lat & lon and store it into an object?
  console.log(cityCoordinates);
  return cityCoordinates;
}

async function getAllWeatherData() {
  const coordinates = await getLatAndLon();
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${APIkey}`,
    { mode: "cors" }
  );
  const data = await response.json();
  console.log(data);
  return data;
}

async function getCurrentWeatherData() {
  const response = await getAllWeatherData();
  const data = await response.current;
  console.log(data);
  return data;
}

async function updateWeatherDetails(data) {
  let newData = {
    sunrise: data.sunrise,
    sunset: data.sunset,
    feels_like: data.feels_like,
    wind_speed: data.wind_speed,
    wind_deg: data.wind_deg,
    humidity: data.humidity,
    uvi: data.uvi,
  };

  console.log(newData);
  return newData;
}

async function updateCurrentWeatherDisplay() {
  const currentData = await getCurrentWeatherData();
  updateWeatherDetails(currentData);

  cityName.textContent = currentData.name; //change to user input

  //Capitalize first letter of the description
  let weatherName =
    currentData.weather[0].description.charAt(0).toUpperCase() +
    currentData.weather[0].description.substring(1);
  iconImage.src = `http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
  weatherDescription.textContent = weatherName;
  tempNumber.textContent = Math.round(currentData.temp * (9 / 5) - 459.67);
  //move this to details
  //   highTemp.textContent = Math.round(data.main.temp_max * (9 / 5) - 459.67);
  //   lowTemp.textContent = Math.round(data.main.temp_min * (9 / 5) - 459.67);
}

/*http://api.openweathermap.org/geo/1.0/direct?q=
{city name},{state code},{country code}&limit={limit}&appid={API key}



onst response = await fetch("./city.list.json");
  // `http://api.openweathermap.org/geo/1.0/direct?q=${cityName[0]},${cityName[1]},us&appid=5943b09bd72402e9560b276898d410f0`,
  // { mode: "cors" }

  //use this to get list of cities to display, find way to destructure into input value
  const data = await response.json();
  console.log(response.json);
  let newCityList = data.filter((obj) => obj.name.includes(cityName));
  console.log(newCityList);

Lookup later: debouncing to make autocomplete wait some milliseconds before starting the search





*/
