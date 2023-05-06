import { service } from "./axios.js";

export async function getSummary() {
  const response = await service.get("/summary");
  return response?.data;
}

export async function getCountries() {
  const response = await service.get("/countries");
  return response?.data;
}

export async function getCountrybyStatus(params) {
  const { country, dateFrom, dateTo, status } = params;
  const response = await service.get(
    `/total/country/${country}/status/${status}?from=${dateFrom}&to=${dateTo}`
  );
  return response?.data;
}

export async function getCountryByAllStatus(params) {
  const { country, dateFrom, dateTo } = params;
  const response = await service.get(
    `/country/${country}?from=${dateFrom}&to=${dateTo}`
  );
  return response?.data;
}
