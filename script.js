"use strict";

const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const cityName = document.querySelector("#city-name");
const currentTime = document.querySelector("#current-time");
const tempNumber = document.querySelector("#temp-number");
const highTemp = document.querySelector("#high-temp");
const lowTemp = document.querySelector("#low-temp");
const gifImage = document.querySelector("#gif-image");
const iconImage = document.querySelector("#icon-image");
const windSpeed = document.querySelector("#windspeed-text");
const windDirection = document.querySelector("#wind-direction");
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
  sortWeatherData("imperial");
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

async function getAllWeatherData(unit) {
  const coordinates = await getLatAndLon();
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${coordinates[0]}&lon=${coordinates[1]}&units=${unit}&appid=${APIkey}`,
    { mode: "cors" }
  );
  const data = await response.json();
  console.log(data);
  return data;
}

async function sortWeatherData(unit) {
  const response = await getAllWeatherData(unit);
  const timeOffset = response.timezone_offset;
  const currentWeather = response.current;
  const dailyForecast = response.daily;
  const hourlyForecast = response.hourly;
  const sunset = new Date(response.current.sunset).getHours();
  const currentData = {
    currentWeather,
    dailyForecast,
    hourlyForecast,
    sunset,
    timeOffset,
  };
  return updateDisplay(currentData);
}

function getHighsAndLows(data, unit = "F") {
  const highs = [];
  const lows = [];
  for (const day of data) {
    highs.push(Math.round(day.temp.max));
    lows.push(Math.round(day.temp.min));
  }
  highTemp.textContent = `${highs[0]}°${unit}`;
  lowTemp.textContent = `${lows[0]}°${unit}`;
  return { highs, lows };
}

function renderCurrent(dataSet) {
  let weatherName =
    dataSet.currentWeather.weather[0].description.charAt(0).toUpperCase() +
    dataSet.currentWeather.weather[0].description.substring(1);
  iconImage.classList.remove("hidden");
  iconImage.src = `./assets/${dataSet.currentWeather.weather[0].main}.svg`;
  weatherDescription.textContent = weatherName;
  tempNumber.textContent = Math.round(dataSet.currentWeather.temp);
}

function renderHourly(dataSet, unit = "F") {
  //get current timezone offset * 60 because 60 seconds in a minute and add the offset for the city in question
  let offsetDifference =
    new Date().getTimezoneOffset() * 60 + dataSet.timeOffset;
  console.log(offsetDifference);
  hourlyForecastDiv.innerHTML = "";
  for (let i = 1; i < 25; i++) {
    const time = new Date(
      (dataSet.hourlyForecast[i].dt + offsetDifference) * 1000
    ).getHours();
    // console.log(time);
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
    <img class='weather-icons' src='./assets/${
      dataSet.hourlyForecast[i].weather[0].main == "Clear" &&
      time > dataSet.sunset
        ? "Night"
        : dataSet.hourlyForecast[i].weather[0].main
    }.svg'>
    <br />
    ${Math.round(dataSet.hourlyForecast[i].temp)}°${unit}`;
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
    div.innerHTML = `${formattedDay} <img class='weather-icons' src='./assets/${dataSet[i].weather[0].main}.svg'> -- Lo ${highsLows.lows[i]}°${unit} -- Hi ${highsLows.highs[i]}°${unit}`;
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

function updateWeatherDetails(data, unit = "F") {
  sunrise.textContent = convertTime(data.sunrise);
  sunset.textContent = convertTime(data.sunset);
  feelsLike.textContent = Math.round(data.feels_like) + "°" + unit;
  windSpeed.textContent = data.wind_speed + "mph";
  windDirection.style.transform = `rotate(${
    data.wind_deg >= 180 ? data.wind_deg - 180 : data.wind_deg + 180
  }deg)`;
  humidity.textContent = data.humidity + "%";
  uvi.textContent = data.uvi;
}

async function renderGiphy(dataSet) {
  const response = await fetch(
    `https://api.giphy.com/v1/gifs/translate?api_key=3A7xFS24s0gdo0dYMg0jp3LtHYoVVEs1&s=${dataSet.currentWeather.weather[0].description
      .split(" ")
      .join("+")}`,
    { mode: "cors" }
  );
  const data = await response.json();
  gifImage.src = data.data.images.original.url;
}

async function updateDisplay(dataSet, unit = "F") {
  getCurrentTime();
  updateWeatherDetails(dataSet.currentWeather);
  //   const highsAndLows = await getHighsAndLows();
  renderHourly(dataSet);
  renderWeekly(dataSet.dailyForecast, getHighsAndLows(dataSet.dailyForecast));
  renderCurrent(dataSet);
  renderGiphy(dataSet);

  //   const response = await fetch(
  //     `https://api.giphy.com/v1/gifs/translate?api_key=3A7xFS24s0gdo0dYMg0jp3LtHYoVVEs1&s=${dataSet.currentWeather.weather[0].description
  //       .split(" ")
  //       .join("+")}`,
  //     { mode: "cors" }
  //   );
  //   const data = await response.json();
  //   gifImage.src = data.data.images.original.url;
  //Capitalize first letter of the description

  //   let weatherName =
  //     dataSet.currentWeather.weather[0].description.charAt(0).toUpperCase() +
  //     dataSet.currentWeather.weather[0].description.substring(1);
  //   iconImage.classList.remove("hidden");
  //   iconImage.src = `./assets/${dataSet.currentWeather.weather[0].main}.svg`;
  //   weatherDescription.textContent = weatherName;
  //   tempNumber.textContent = Math.round(dataSet.currentWeather.temp);
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
