import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { weatherService } from './services/weather.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
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

    mapService.updateCurrentLocation()
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
    mapService.addMarker({ lat: mapService.getMapCenter().lat, lng: mapService.getMapCenter().lng })
    mapService.updateCurrentLocation(mapService.getMapCenter().lat, mapService.getMapCenter().lng)
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
            mapService.panTo(pos.coords.latitude, pos.coords.longitude)
            mapService.addMarker({lat: pos.coords.latitude, lng: pos.coords.longitude})
            mapService.updateCurrentLocation(pos.coords.latitude, pos.coords.longitude)
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}
function onPanTo() {
    console.log('Panning the Map')
    mapService.panTo(35.6895, 139.6917)
    mapService.updateCurrentLocation(35.6895, 139.6917)
}

function renderPlacesTable(locs) {
    const tableBody = document.querySelector('.places-table-body')

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
        console.log(loc.id)
    })

    const goButtons = document.getElementsByClassName('btn-go')
    const deleteButtons = document.getElementsByClassName('btn-delete')

    for (let i = 0; i < goButtons.length; i++) {
        goButtons[i].addEventListener('click', onGo)
    }

    for (let i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener('click', onDelete)
    }
}

function onGo(event) {
    const lat = event.target.dataset.lat
    const lng = event.target.dataset.lng
    mapService.panTo(lat, lng)
    weatherService.fetch(lat, lng)
        .then(weatherData => {
            weatherService.update(weatherData)
        })

    mapService.updateCurrentLocation(lat, lng)

}

function onDelete(event) {
    const placeId = event.target.dataset.id
    locService.deletePlace(placeId)
        .then(() => {
            onGetLocs()
        })
        .catch(err => {
            console.log('Error deleting place:', err)
        })
}

function onSearch(event) {
    event.preventDefault()
    const address = document.querySelector('.search-input').value
    mapService.SearchLocation(address)

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

