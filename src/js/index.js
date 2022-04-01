import "regenerator-runtime/runtime";
import axios from "axios";
import { coordinates } from "./mockData";

const apikey = process.env.API_KEY;
const map = L.map("map").setView([52.402419, 16.935425], 5);
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal_content");

const tiles = L.tileLayer(
  "http://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(map);

coordinates.map(({ name, coordinates }) =>
  L.marker(coordinates)
    .addTo(map)
    .on("click", (e) => {
      try {
        getWeather(name, e);
      } catch (error) {
        console.log(error);
      }
    })
);

const getForecast = async (_city_name, { lat, lng }) => {
  const response = await axios.get(
    `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=current,minutely,hourly,alerts&appid=${apikey}&units=metric`
  );

  for (let n = 1; n <= 3; n++) {
    let forecast = response.data.daily[n].temp;
    displayForecast(forecast, n);
  }

  modal.classList.add("open");
};

modal.addEventListener("click", () => {
  modal.classList.remove("open");
  modalContent.innerHTML = "";
});

const getWeather = async (_city_name, e) => {
  const response = await axios.get(
    `http://api.openweathermap.org/data/2.5/weather?q=${_city_name}&appid=${apikey}&units=metric`
  );

  const today = new Date();
  const time =
    today.getUTCHours() +
    response.data.timezone / 3600 +
    ":" +
    ("0" + today.getMinutes()).slice(-2) +
    ":" +
    ("0" + today.getSeconds()).slice(-2);

  e.target.bindPopup(
    () =>
      `<div class="popup"><div>Current time:
        ${time}</div>
        <div>Current temperature:
        ${response.data.main.temp}
        °C </div>
        <div id="weather"></div>
        <div> Current pressure:
        ${response.data.main.pressure}
        hPa </div>
        <button>Show 3 day forecast</button></div>`
  );
  mood(response.data.main.temp);
  const button = document.querySelector("button");
  button.addEventListener("click", () => {
    try {
      getForecast(_city_name, e.latlng);
    } catch (error) {
      console.log(error);
    }
  });
};

const mood = (temperature) => {
  const weather = document.getElementById("weather");
  if (temperature >= 0) {
    weather.innerHTML =
      '<img src="https://images.pexels.com/photos/125457/pexels-photo-125457.jpeg"></img>';
  } else
    weather.innerHTML =
      '<img src="https://images.pexels.com/photos/1885809/pexels-photo-1885809.jpeg"></img>';
};

const forecastMood = (temperature) => {
  const forecastWeather =
    document.querySelector(".modal_content").lastElementChild;
  const weatherPhoto = document.createElement("div");
  if (temperature >= 0) {
    weatherPhoto.innerHTML =
      '<img src="https://images.pexels.com/photos/125457/pexels-photo-125457.jpeg"></img>';
    forecastWeather.appendChild(weatherPhoto);
  } else
    weatherPhoto.innerHTML =
      '<img src="https://images.pexels.com/photos/1885809/pexels-photo-1885809.jpeg"></img>';
  forecastWeather.appendChild(weatherPhoto);
};

const displayForecast = ({ morn, day, eve, night }, number) => {
  const forecastday = document.createElement("div");
  forecastday.classList.add("day");
  const today = new Date();
  const time =
    today.getDate() +
    number +
    "." +
    ("0" + (today.getMonth() + 1)).slice(-2) +
    "." +
    today.getFullYear();
  forecastday.innerHTML = `<h2>${time}</h2>
    <div class="temperatures">
      <div>Morning temperature: ${morn} °C</div>
      <div>Day temperature: ${day} °C</div>
      <div>Evening temperature: ${eve} °C</div>
      <div>Night temperature: ${night} °C</div>
    </div>
    <div class="forecast_weather"></div>`;
  document.querySelector(".modal_content").appendChild(forecastday);
  forecastMood(day);
};
