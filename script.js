document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById('city');
    cityInput.addEventListener('input', () => getWeather(cityInput.value));
    getWeather(cityInput.value);
    setInterval(() => getWeather(cityInput.value), 900000);
});

async function getWeather(city) {
    if (!city) return;
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            }
        });
        
        const data = response.data;
        const forecastData = data.list;
        const dailyForecast = {};

        forecastData.forEach(item => {
            const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dailyForecast[day]) {
                dailyForecast[day] = { 
                    minTemp: item.main.temp_min, 
                    maxTemp: item.main.temp_max,
                    description: item.weather[0].description,
                    humidity: item.main.humidity,
                    windSpeed: item.wind.speed,
                    icon: item.weather[0].icon
                };
            } else {
                dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, item.main.temp_min);
                dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, item.main.temp_max);
            }
        });

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        updateUI(data.city.name, dailyForecast, today);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateUI(cityName, dailyForecast, today) {
    const todayData = dailyForecast[today];
    
    document.querySelector('.date-dayname').textContent = today;
    document.querySelector('.date-day').textContent = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    document.querySelector('.location').textContent = cityName;
    document.querySelector('.weather-temp').textContent = `${Math.round(todayData.minTemp)}ºC`;
    document.querySelector('.weather-desc').textContent = capitalizeFirstLetter(todayData.description);
    document.querySelector('.humidity .value').textContent = `${todayData.humidity} %`;
    document.querySelector('.wind .value').textContent = `${todayData.windSpeed} m/s`;

    const weatherIcon = getWeatherIcon(todayData.icon);
    document.querySelector('.weather-icon').innerHTML = weatherIcon;

    const weekList = document.querySelector('.week-list');
    weekList.innerHTML = Object.keys(dailyForecast).map(day => {
        const data = dailyForecast[day];
        return `
            <li>
                <span class="day-name">${day}</span>
                <span class="day-temp">${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º</span>
                <span class="day-icon">${getWeatherIcon(data.icon)}</span>
            </li>
        `;
    }).join('');
}

function getWeatherIcon(iconCode) {
    return `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon">`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

  