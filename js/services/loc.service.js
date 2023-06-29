export const locService = {
    getLocs,
    deletePlace
}


const locs = [
    { name: 'Greatplace', lat: 32.047104, lng: 34.832384, id:generateId()}, 
    { name: 'Neveragain', lat: 32.047201, lng: 34.832581, id:generateId()}
]

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs)
        }, 2000)
    })
}


function deletePlace(placeId) {
    return new Promise((resolve, reject) => {
        const index = locs.findIndex(loc => loc.id === placeId)
        if (index !== -1) {
            locs.splice(index, 1)
            resolve()
        } else {
            reject(new Error('Place not found'))
        }
    })
}

function generateId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let id = ''
  
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      id += characters.charAt(randomIndex)
    }
  
    return id
  }