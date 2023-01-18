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
const hourlyForecastDiv = document.querySelector(".hourly-forecast");
const weekForecastDiv = document.querySelector(".week-forecast");
const APIkey = "5943b09bd72402e9560b276898d410f0";

//When search button is clicked

searchBtn.addEventListener("click", () => {
  sortWeatherData();
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

async function sortWeatherData() {
  const response = await getAllWeatherData();
  const currentWeather = response.current;
  const dailyForecast = response.daily;
  const hourlyForecast = response.hourly;
  const currentData = { currentWeather, dailyForecast, hourlyForecast };
  return updateCurrentWeatherDisplay(currentData);
}

function getHighsAndLows(data, unit = "F") {
  const highs = [];
  const lows = [];
  for (const day of data) {
    highs.push(day.temp.max);
    lows.push(day.temp.min);
  }
  highTemp.textContent = `${Math.round(convertTemp(highs[0], unit))}°${unit}`;
  lowTemp.textContent = `${Math.round(convertTemp(lows[0], unit))}°${unit}`;
  return { highs, lows };
}

function renderHourly(dataSet, unit = "F") {
  hourlyForecastDiv.innerHTML = "";
  for (let i = 1; i < 25; i++) {
    const time = new Date(dataSet[i].dt * 1000).getHours();
    const div = document.createElement("div");
    div.innerHTML = ` ${
      time === 0
        ? time + 12 + "AM"
        : time > 12
        ? time - 12 + "PM"
        : time === 12
        ? time + "PM"
        : time + "AM"
    }
    <br />
    ${Math.round(convertTemp(dataSet[i].temp, unit))}°${unit}`;
    hourlyForecastDiv.appendChild(div);
  }
}

function renderWeekly(dataSet, highsLows, unit = "F") {
  weekForecastDiv.innerHTML = "";
  for (let i = 1; i <= 7; i++) {
    const day = new Date(dataSet[i].dt * 1000);
    let formattedDay = new Intl.DateTimeFormat("default", {
      weekday: "short",
    }).format(day);
    const div = document.createElement("div");
    div.innerHTML = `${formattedDay} ${
      dataSet[i].weather[0].main
    } -- Lo ${Math.round(
      convertTemp(highsLows.lows[i], unit)
    )}°${unit} -- Hi ${Math.round(
      convertTemp(highsLows.highs[i], unit)
    )}°${unit}`;
    weekForecastDiv.appendChild(div);
  }
}

function convertTime(time) {
  let date = new Date(time * 1000);
  return new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

function convertTemp(temp, unit) {
  if (unit === "F") {
    return temp * (9 / 5) - 459.67;
  } else if (unit === "C") {
    return temp - 273.15;
  }
}

function updateWeatherDetails(data, unit = "F") {
  sunrise.textContent = convertTime(data.sunrise);
  sunset.textContent = convertTime(data.sunset);
  feelsLike.textContent = Math.round(convertTemp(data.feels_like, unit));
  windSpeed.textContent = data.wind_speed;
  // wind_deg= data.wind_deg;
  humidity.textContent = data.humidity;
  uvi.textContent = data.uvi;
}

async function updateCurrentWeatherDisplay(dataSet, unit = "F") {
  getCurrentTime();
  updateWeatherDetails(dataSet.currentWeather);
  //   const highsAndLows = await getHighsAndLows();
  renderHourly(dataSet.hourlyForecast);
  renderWeekly(dataSet.dailyForecast, getHighsAndLows(dataSet.dailyForecast));

  //Capitalize first letter of the description
  let weatherName =
    dataSet.currentWeather.weather[0].description.charAt(0).toUpperCase() +
    dataSet.currentWeather.weather[0].description.substring(1);
  iconImage.src = `http://openweathermap.org/img/wn/${dataSet.currentWeather.weather[0].icon}@2x.png`;
  weatherDescription.textContent = weatherName;
  tempNumber.textContent = Math.round(
    convertTemp(dataSet.currentWeather.temp, unit)
  );
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
