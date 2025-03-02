document.addEventListener("DOMContentLoaded", function () {
    const cityInput = document.querySelector('.city-input');
    const searchBtn = document.querySelector('.search-btn');

    const weatherInfoSection = document.querySelector('.weather-info');
    const notFoundSection = document.querySelector('.not-found');
    const searchCitySection = document.querySelector('.search-city');

    const countryTxt = document.querySelector('.country-txt');
    const tempTxt = document.querySelector('.temp-txt');
    const conditionTxt = document.querySelector('.condition-txt');
    const humidityValueTxt = document.querySelector('.humidity-value-txt');
    const windValueTxt = document.querySelector('.wind-value-txt');
    const weatherSummaryImg = document.querySelector('.weather-summary-img');
    const currentDateTxt = document.querySelector('.current-date-txt');

    const forecastItemsContainer = document.querySelector('.forecast-items-container');

    const apikey = '202940118cef4f4780574500250203'; // 🔹 Replace with your WeatherAPI key

    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    updateWeatherByCoords(lat, lon);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    showDisplaySection(notFoundSection);
                }
            );
        } else {
            console.error("Geolocation not supported!");
            showDisplaySection(notFoundSection);
        }
    }

    async function getFetchData(url) {
        const response = await fetch(url);
        return await response.json();
    }

    async function updateWeatherByCoords(lat, lon) {
        try {
            const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apikey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
            const weatherdata = await getFetchData(weatherUrl);

            if (!weatherdata || weatherdata.error) {
                console.error("Location not found:", weatherdata.error?.message);
                showDisplaySection(notFoundSection);
                return;
            }

            const {
                location: { name: city },
                current: { temp_c, humidity, wind_kph, condition },
                forecast: { forecastday }
            } = weatherdata;

            countryTxt.textContent = city;
            tempTxt.textContent = Math.round(temp_c) + '°C';
            conditionTxt.textContent = condition.text;
            humidityValueTxt.textContent = humidity + '%';
            windValueTxt.textContent = wind_kph + ' km/h';

            currentDateTxt.textContent = getCurrentDate();
            weatherSummaryImg.src = condition.icon;

            await updateForecastsInfo(forecastday);

            showDisplaySection(weatherInfoSection);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            showDisplaySection(notFoundSection);
        }
    }

    function getCurrentDate() {
        const currentDate = new Date();
        const options = {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        };
        return currentDate.toLocaleDateString('en-GB', options);
    }

    function showDisplaySection(section) {
        [weatherInfoSection, searchCitySection, notFoundSection]
            .forEach(sec => sec.style.display = 'none');

        section.style.display = 'flex';
    }

    async function updateForecastsInfo(forecastDays) {
        forecastItemsContainer.innerHTML = '';

        forecastDays.forEach(day => {
            updateForecastsItems(day);
        });
    }

    function updateForecastsItems(forecastWeather) {
        const {
            date,
            day: { condition, avgtemp_c }
        } = forecastWeather;

        const dateTaken = new Date(date);
        const dateOption = {
            day: '2-digit',
            month: 'short'
        };
        const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

        const forecastItem = `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
                <img src="${condition.icon}" class="forecast-item-img">
                <h5 class="forecast-item-temp">${Math.round(avgtemp_c)}°C</h5>
            </div>
        `;

        forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
    }

    searchBtn.addEventListener('click', () => {
        if (cityInput.value.trim() !== '') {
            updateWeatherInfo(cityInput.value.trim());
            cityInput.value = '';
            cityInput.blur();
        }
    });

    cityInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && cityInput.value.trim() !== '') {
            updateWeatherInfo(cityInput.value.trim());
            cityInput.value = '';
            cityInput.blur();
        }
    });

    async function updateWeatherInfo(city) {
        if (!city) return;

        try {
            const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apikey}&q=${city}&days=7&aqi=no&alerts=no`;
            const weatherdata = await getFetchData(apiUrl);

            if (!weatherdata || weatherdata.error) {
                console.error("City not found:", weatherdata.error?.message);
                showDisplaySection(notFoundSection);
                return;
            }

            const {
                location: { name: country },
                current: { temp_c, humidity, wind_kph, condition },
                forecast: { forecastday }
            } = weatherdata;

            countryTxt.textContent = country;
            tempTxt.textContent = Math.round(temp_c) + '°C';
            conditionTxt.textContent = condition.text;
            humidityValueTxt.textContent = humidity + '%';
            windValueTxt.textContent = wind_kph + ' km/h';

            currentDateTxt.textContent = getCurrentDate();
            weatherSummaryImg.src = condition.icon;

            await updateForecastsInfo(forecastday);

            showDisplaySection(weatherInfoSection);
        } catch (error) {
            console.error("Error fetching weather data:", error);
            showDisplaySection(notFoundSection);
        }
    }

    getUserLocation();
});
