import "./style.css";
import { CHART_COLORS, templateInfoHtml } from "./utils";
import {
  getSummary,
  getCountries,
  getCountrybyStatus,
  getCountryByAllStatus,
} from "./service/requests";

const INITIAL_STATE = {
  summary: {},
  listCountryByStatus: [],
  listCountryAllStatus: [],
  countries: [],
  chartLine: null,
};

let state = { ...INITIAL_STATE };

async function filterCountry() {
  const country = document.querySelector("#country").value;
  const dateFrom = document.querySelector("#date-started").value;
  const dateTo = document.querySelector("#date-end").value;
  const status = document.querySelector("#status").value;

  const containerInfo = document.querySelector(".dashboard-line");
 
  const dateFromParsed = new Date(dateFrom);
  const dateFromMinusOneDay = dateFromParsed.setDate(
    dateFromParsed.getDate() - 1
  );

  const params = {
    country,
    dateFrom: dateFromMinusOneDay,
    dateTo,
    status,
  };

  state.listCountryByStatus = await getCountrybyStatus(params);
  state.listCountryAllStatus = await getCountryByAllStatus(params);

  const casesByAllStatus = state.listCountryAllStatus.map((data, i, array) => {
    if (i === 0) {
      return data;
    }
    const dailyConfirmed = data.confirmed - array[i - 1].confirmed;
    const dailyDeaths = data.deaths - array[i - 1].deaths;
    const dailyRecovered = data.recovered - array[i - 1].recovered;
    return {
      ...data,
      confirmed: dailyConfirmed,
      deaths: dailyDeaths,
      recovered: dailyRecovered,
    };
  });
  casesByAllStatus.shift();

  const initialValue = { confirmed: 0, deaths: 0, recovered: 0 };
  const totalCasesByStatus = casesByAllStatus.reduce((acc, curr) => {
    acc.confirmed += curr.Confirmed;
    acc.deaths += curr.Deaths;
    acc.recovered += curr.Recovered;

    return acc;
  }, initialValue);

  const props = {
    totalConfirmed: totalCasesByStatus.confirmed,
    totalDeaths: totalCasesByStatus.deaths,
    totalRecovered: totalCasesByStatus.recovered,
  }
  console.log(templateInfoHtml(props))
  console.log(containerInfo)
  
  containerInfo.innerHTML = templateInfoHtml(props)
  generateChartLine();
}

const btn = document.querySelector("#filterCountry");
btn.addEventListener("click", filterCountry);

function getGlobalStates() {
  const { TotalConfirmed, TotalDeaths, TotalRecovered } = state.summary?.Global;

  return [TotalConfirmed, TotalDeaths, TotalRecovered];
}

function getTopCountries() {
  const countries = state.summary.Countries;
  const sortedCountries = countries.sort(
    (a, b) => b.TotalDeaths - a.TotalDeaths
  );
  return sortedCountries.slice(0, 10);
}

function generateChartPie() {
  const ctx = document.getElementById("chart-pie");
  const [TotalConfirmed, TotalDeaths, TotalRecovered] = getGlobalStates();

  const data = {
    labels: ["Total Confirmados", "Total Mortos", "Total Recuperados"],
    datasets: [
      {
        data: [TotalConfirmed, TotalDeaths, TotalRecovered],
        backgroundColor: Object.values(CHART_COLORS),
      },
    ],
  };

  return new Chart(ctx, {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Distribuição de novos casos",
        },
      },
    },
  });
}

async function generateChartBar() {
  const ctx = document.getElementById("chart-bar");
  const topCoutries = getTopCountries();
  const labels = topCoutries.map((country) => country.Country);
  const values = topCoutries.map((country) => country.TotalDeaths);
  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: "#576CBC",
        legend: { display: false },
      },
    ],
  };

  return new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Total de Mortes por país - Top 10",
        },
      },
    },
  });
}

function generateChartLine() {
  const ctx = document.querySelector("#chart-line");

  const casesByDay = listCountryByStatus.map(({ Date, Cases }) => ({
    date: Date.split("T")[0],
    cases: Cases,
  }));

  const casesByDayMapped = casesByDay.map((data, i, array) => {
    if (i === 0) {
      return { ...data, cases: data.cases };
    }
    const cases = data.cases - array[i - 1].cases;
    return { ...data, cases: cases };
  });

  casesByDayMapped.shift();

  const labels = casesByDayMapped.map((country) => country.date);
  const values = casesByDayMapped.map((country) => country.cases);

  const sumCases = casesByDayMapped.reduce((acc, curr) => acc + curr.cases, 0);

  const averageCases = sumCases / casesByDayMapped.length;
  if (state.chartLine) {
    state.chartLine.destroy();
  }
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Status",
        data: values,
        borderColor: "#576CBC",
        fill: false,
        tension: 0.1,
      },
      {
        label: "Média de Casos",
        data: Array(casesByDay.length).fill(averageCases),
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  state.chartLine = new Chart(ctx, {
    type: "line",
    data: data,
    options: {
      responsive: true,
      scales: {
        x: {
          type: "category",
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  return state.chartLine;
}

function renderDom() {
  const [TotalConfirmed, TotalDeaths, TotalRecovered] = getGlobalStates();
  const totalConfirmedDom = document.querySelector(".totalConfirmed");
  const totalDeathsDom = document.querySelector(".totalDeaths");
  const totalRecoveredDom = document.querySelector(".totalRecovered");
  const selectContry = document.querySelector("#country");

  totalConfirmedDom.innerHTML = TotalConfirmed;
  totalDeathsDom.innerHTML = TotalDeaths;
  totalRecoveredDom.innerHTML = TotalRecovered;

  for (const country of countries) {
    selectContry.insertAdjacentHTML(
      "beforeend",
      `<option value=${country.Slug}>${country.Country}</option>`
    );
  }
}

async function main() {
  state.summary = await getSummary();
  state.countries = await getCountries();
  renderDom();
  generateChartBar();
  generateChartPie();
}

main();
