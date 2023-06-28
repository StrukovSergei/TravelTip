import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { weatherService } from './services/weather.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onMapClick = onMapClick
window.onSearch = onSearch
window.onCopyLink = onCopyLink

function onInit() {
    onGetLocs()

    mapService.initMap()
        .then(() => {
            console.log('Map is ready')
        })
        .catch(() => console.log('Error: cannot init map'))


    weatherService.fetch()
        .then(weatherData => {
            weatherService.update(weatherData)
        })
        .catch(error => {
            console.log('Error fetching weather data:', error)
        })
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker() {
    console.log('Adding a marker')
    mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 })
}

function onGetLocs() {
    locService.getLocs()
        .then(locs => {
            console.log('Locations:', locs)
            renderPlacesTable(locs)
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords)
            document.querySelector('.user-pos').innerText =
                `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}
function onPanTo() {
    console.log('Panning the Map')
    mapService.panTo(35.6895, 139.6917)
}

function onMapClick(event) {
    console.log(event)
    const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
    }

    mapService.addMarker(clickedLocation)
}

function renderPlacesTable(locs) {
    const tableBody = document.querySelector('.places-table-body');

    tableBody.innerHTML = ''

    locs.forEach(loc => {
        const row = document.createElement('tr')
        row.innerHTML = `
            <td>${loc.name}</td>
            <td>${loc.lat}</td>
            <td>${loc.lng}</td>
            <td>
                <button class="btn-go" data-lat="${loc.lat}" data-lng="${loc.lng}">Go</button>
                <button class="btn-delete" data-id="${loc.id}">Delete</button>
            </td>
        `
        tableBody.appendChild(row)
    })
    const goButtons = document.getElementsByClassName('btn-go')
    // const deleteButtons = document.getElementsByClassName('btn-delete')

    for (let i = 0; i < goButtons.length; i++) {
        goButtons[i].addEventListener('click', onGoButtonClick)
    }

    // for (let i = 0; i < deleteButtons.length; i++) {
    //     deleteButtons[i].addEventListener('click', onDeleteButtonClick)
    // }
}

function onGoButtonClick(event) {
    console.log(event)
    const lat = event.target.dataset.lat
    const lng = event.target.dataset.lng
    mapService.panTo(lat, lng)
    mapService.addMarker({ lat: lat, lng: lng })
    weatherService.fetch(lat, lng)

}


function onSearch() {
    const address = document.querySelector('.search-input').value
    mapService.onSearchLocation(address)
}

function onCopyLink() {

    const lat = mapService.getCurrentLocation().lat
    const lng = mapService.getCurrentLocation().lng
    console.log(lat)
    const urlParams = new URLSearchParams({ lat, lng })
    const url = `https://strukovsergei.github.io/TravelTip/?${urlParams.toString()}`

    navigator.clipboard.writeText(url)
      .then(() => {
        console.log('Link copied to clipboard:', url)
      })
      .catch(err => {
        console.log('Error copying link to clipboard:', err)
      })
  }