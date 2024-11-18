import moment from 'moment/min/moment-with-locales'

export const dateTime = (date) => {
    return moment(date).local('th').format('llll')
}