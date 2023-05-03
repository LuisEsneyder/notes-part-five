const reverse = (string) => {
    return string.split('').reverse().join('')
}

const average = (array) => {
    const reducer = (preven, valorActual) => {
        return preven + valorActual
    }
    return array.length === 0 ? 0 : array.reduce(reducer,0)/array.length
}

module.exports = {
    reverse,
    average
}
