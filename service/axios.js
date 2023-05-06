import axios from 'axios'

export const service = axios.create({
    baseURL: 'https://api.covid19api.com'
})