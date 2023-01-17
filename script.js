"use strict";

const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const cityName = document.querySelector("#city-name");
const currentTime = document.querySelector("#current-time");
const tempNumber = document.querySelector("#temp-number");
const highTemp = document.querySelector("#high-temp");
const lowTemp = document.querySelector("#low-temp");
const iconImage = document.querySelector("#icon-image");
const windSpeed = document.querySelector("#windspeed-text");
const feelsLike = document.querySelector("#feels-like-text");
const uvi = document.querySelector("#uvi-text");
const humidity = document.querySelector("#humidity-text");
const sunrise = document.querySelector("#sunrise-text");
const sunset = document.querySelector("#sunset-text");
const weatherDescription = document.querySelector("#weather-description");
const APIkey = "5943b09bd72402e9560b276898d410f0";

//When search button is clicked

searchBtn.addEventListener("click", () => {
  updateCurrentWeatherDisplay();
});

searchInput.value = "Oakland";

function getCurrentTime() {
  currentTime.textContent = new Intl.DateTimeFormat("default", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date());
}
//first get coordinates based on input
async function getLatAndLon() {
  let foundCity = searchInput.value.trim();
  //first use this to get the latitude and longitude of the city
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${foundCity},us&appid=5943b09bd72402e9560b276898d410f0`,
    { mode: "cors" }
  );
  const data = await response.json();
  let cityCoordinates = [data[0].lat, data[0].lon];
  cityName.textContent = data[0].name;
  //extract out the lat & lon and store it into an object?
  console.log(data);
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

async function getHighsAndLows() {
  const response = await getAllWeatherData();
  const data = await response.daily;
  const temps = {
    highs: [],
    lows: [],
  };
  //   const highs = [];
  //   const lows = [];
  for (const day of data) {
    temps.highs.push(day.temp.max);
    temps.lows.push(day.temp.min);
  }

  console.log(temps.highs);
  console.log(temps.lows);
  return temps;
}

function convertTime(time) {
  let date = new Date(time * 1000);
  return date.toLocaleTimeString(navigator.language, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function convertTime(time) {
  let date = new Date(time * 1000);
  return new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

function updateWeatherDetails(data) {
  sunrise.textContent = convertTime(data.sunrise);
  sunset.textContent = convertTime(data.sunset);
  feelsLike.textContent = data.feels_like;
  windSpeed.textContent = data.wind_speed;
  // wind_deg= data.wind_deg;
  humidity.textContent = data.humidity;
  uvi.textContent = data.uvi;
}

async function updateCurrentWeatherDisplay() {
  getCurrentTime();
  const currentData = await getCurrentWeatherData();
  updateWeatherDetails(currentData);
  const highsAndLows = await getHighsAndLows();

  //Capitalize first letter of the description
  let weatherName =
    currentData.weather[0].description.charAt(0).toUpperCase() +
    currentData.weather[0].description.substring(1);
  iconImage.src = `http://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
  weatherDescription.textContent = weatherName;
  tempNumber.textContent = Math.round(currentData.temp * (9 / 5) - 459.67);
  //move this to details
  console.log(highsAndLows);
  highTemp.textContent = Math.round(highsAndLows.highs[0] * (9 / 5) - 459.67);
  lowTemp.textContent = Math.round(highsAndLows.lows[0] * (9 / 5) - 459.67);
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
