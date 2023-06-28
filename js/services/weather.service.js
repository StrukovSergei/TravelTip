export const weatherService = {
    fetch: fetchWeatherData,
    update: updateWeatherInfo
}


function fetchWeatherData(lat = 32.0749831, lng = 34.9120554) {
    const API_KEY = 'ca6875b1a26622788138f469b6a21c91'
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const weatherDescription = data.weather[0].description
            const temperature = data.main.temp
            const humidity = data.main.humidity

            return {
                weatherDescription,
                temperature,
                humidity
            }
        })
}

function updateWeatherInfo(weatherData) {
    document.querySelector('.weather-description').innerHTML = weatherData.weatherDescription
    document.querySelector('.temperature').innerHTML = weatherData.temperature
    document.querySelector('.humidity').innerHTML = weatherData.humidity
}