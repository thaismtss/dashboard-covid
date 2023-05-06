export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export const templateInfoHtml = props => { 
  return `
    <canvas id="chart-line"></canvas>
      <div class="kpi-line">
        <div class="kpi-card">
          <h4>Total confirmados</h4>
          <span class="totalConfirmedByCountry">${props.totalConfirmed}</span>
        </div>
        <div class="kpi-card">
          <h4>Total Mortes</h4>
          <span class="totalDeathsByCountry">${props.totalDeaths}</span>
        </div>
        <div class="kpi-card">
          <h4>Total Recuperados</h4>
          <span class="totalRecoveredByCountry">${props.totalRecovered}</span>
        </div>
      </div>
    </div>
`;}
