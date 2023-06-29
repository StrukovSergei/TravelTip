import { weatherService } from "./weather.service.js"

export const mapService = {
    initMap,
    addMarker,
    panTo,
    SearchLocation,
    getCurrentLocation,
    getMapCenter,
    updateCurrentLocation
}


// Var that is used throughout this Module (not global)
var gMap
let markers = []

function initMap(lat = 32.0749831, lng = 34.9120554) {

    return _connectGoogleApi()
        .then(() => {
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            gMap.addListener('click', (ev) => {
                console.log('ev', ev)
                const lat = ev.latLng.lat()
                const lng = ev.latLng.lng()
                console.log(lat)
                console.log(lng)
                addMarker({ lat, lng })
                updateCurrentLocation(lat, lng)
                weatherService.fetch(lat, lng)
                    .then(weatherData => {
                        weatherService.update(weatherData)
                    })
                    .catch(error => {
                        console.log('Error fetching weather data:', error)
                    })
            })
            console.log('Map!', gMap)
        })

}

function addMarker(loc) {
    removeAllMarkers()
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    })
    markers.push(marker)
    return marker
}

function removeAllMarkers() {
    markers.forEach(marker => marker.setMap(null))
    markers = []
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyCEg_lgFoi0i5a6gwY8wgKZhLzswHFgZzw' // your API Key
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

function SearchLocation(address) {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results.length > 0) {
            const location = results[0].geometry.location
            const { lat, lng } = location
            mapService.panTo(lat(), lng())
            mapService.addMarker({ lat: lat(), lng: lng() })
            updateCurrentLocation(lat(), lng())
            weatherService.fetch(lat(), lng())
                .then(weatherData => {
                    weatherService.update(weatherData)
                })
        } else {
            console.log('Geocode was not successful for the following reason:', status)
        }
    })
}

function getPosition() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position),
                error => reject(error)
            )
        } else {
            reject(new Error('Geolocation is not supported by this browser.'))
        }
    })
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        getPosition()
            .then(pos => {
                const { latitude, longitude } = pos.coords
                resolve({ lat: latitude, lng: longitude })
            })
            .catch(err => {
                reject(err)
            })
    })
}

function getMapCenter() {
    const center = gMap.getCenter()
    const lat = center.lat()
    const lng = center.lng()
    console.log(lat)
    console.log(lng)

    return { lat, lng }
}

function updateCurrentLocation(lat = 32.0749831, lng = 34.9120554) {
    const geocoder = new google.maps.Geocoder()
    const latLng = new google.maps.LatLng(lat, lng)

    geocoder.geocode({ 'location': latLng }, (results, status) => {
        if (status === 'OK') {
            if (results[0]) {
                const addressComponents = results[0].address_components
                let country = ''
                let city = ''

                for (let i = 0; i < addressComponents.length; i++) {
                    const types = addressComponents[i].types

                    if (types.includes('country')) {
                        country = addressComponents[i].long_name
                    }

                    if (types.includes('locality') || types.includes('administrative_area_level_1')) {
                        city = addressComponents[i].long_name
                    }
                }

                const currentLocationElement = document.querySelector('.current-location')
                currentLocationElement.textContent = `${country}, ${city}`
            }
        } else {
            console.log('Geocoder failed due to: ' + status)
        }
    })
    addMarker({ lat: parseFloat(lat), lng: parseFloat(lng) })
}