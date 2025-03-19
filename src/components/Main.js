import { useContext, useState } from "react";
import "../styles/components/Main.scss";
import CurrentWeather from "./CurrentWeather";
import Forecast from "./Forecast";
import WeatherInsights from "./WeatherInsights";
import WeatherContext from "../context/weather.context";
import Loader from "./Loader";
import WeatherImpactPlanner from "./WeatherImpactPlanner";
function Main() {
  const { loading, currentWeather, dailyForecast, hourlyForecast } =
    useContext(WeatherContext);
  const [activeTab, setActiveTab] = useState("hourly");

  const renderWeatherContent = () => {
    if (loading) return <Loader />;

    return (
      <>
        <div className="content-section fade-in">
          <CurrentWeather data={currentWeather} />
        </div>

        <div className="forecast-tabs">
          <div className="tabs-wrapper">
            <button
              className={`tab-button ${activeTab === "hourly" ? "active" : ""}`}
              onClick={() => setActiveTab("hourly")}
            >
              <i className="bi bi-clock"></i>
              Hourly Forecast
            </button>
            <button
              className={`tab-button ${activeTab === "daily" ? "active" : ""}`}
              onClick={() => setActiveTab("daily")}
            >
              <i className="bi bi-calendar3"></i>
              21 Days Forecast
            </button>
          </div>
        </div>

        <div className="forecast-container fade-in">
          {activeTab === "hourly" ? (
            <Forecast
              type="hourly"
              title="HOURLY FORECAST"
              data={hourlyForecast}
            />
          ) : (
            <Forecast
              type="daily"
              title="21 DAYS FORECAST"
              data={dailyForecast}
            />
          )}
        </div>

        {/* New WeatherInsights component */}
        <div className="content-section fade-in delayed-animation">
          <WeatherInsights />
        </div>

        <div className="content-section fade-in delayed-animation">
          <WeatherImpactPlanner />
        </div>
      </>
    );
  };

  return (
    <div className="Main">
      <div className="main-content">{renderWeatherContent()}</div>
    </div>
  );
}

export default Main;
