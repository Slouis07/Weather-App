import { useContext } from 'react';
import WeatherContext from '../context/weather.context';
import '../styles/components/WeatherInsights.scss';

function WeatherInsights() {
  const { currentWeather, dailyForecast } = useContext(WeatherContext);
  
  // Calculate temperature range from dailyForecast
  const calculateTempRange = () => {
    if (!dailyForecast || !dailyForecast.length) return { min: 0, max: 0 };
    
    const temps = dailyForecast.map(day => day.temperature);
    return {
      min: Math.min(...temps),
      max: Math.max(...temps)
    };
  };
  
  // Determine if there are significant weather changes coming
  const getWeatherChanges = () => {
    if (!dailyForecast || dailyForecast.length < 2) return null;
    
    const todayWeather = dailyForecast[0]?.summary?.toLowerCase() || '';
    const tomorrowWeather = dailyForecast[1]?.summary?.toLowerCase() || '';
    
    // Check for significant weather type changes
    const weatherTypes = {
      rain: ['rain', 'shower', 'drizzle', 'precipitation'],
      clear: ['clear', 'sunny', 'fair'],
      cloudy: ['cloud', 'overcast'],
      snow: ['snow', 'flurries', 'sleet'],
      storm: ['storm', 'thunder', 'lightning'],
      wind: ['wind', 'gust', 'breeze']
    };
    
    for (const [type, keywords] of Object.entries(weatherTypes)) {
      const isTodayType = keywords.some(keyword => todayWeather.includes(keyword));
      const isTomorrowType = keywords.some(keyword => tomorrowWeather.includes(keyword));
      
      if (isTodayType && !isTomorrowType) {
        return `Weather improving: ${dailyForecast[0].summary} today changing to ${dailyForecast[1].summary} tomorrow`;
      }
      
      if (!isTodayType && isTomorrowType) {
        return `Weather changing: ${dailyForecast[0].summary} today changing to ${dailyForecast[1].summary} tomorrow`;
      }
    }
    
    return null;
  };
  
  // Determine optimal outdoor activity times based on weather
  const getOptimalActivityTime = () => {
    if (!dailyForecast || !dailyForecast.length) return null;
    
    // Simple logic: Prefer times without rain, with moderate temps, and low wind
    const todayHourly = dailyForecast[0];
    const tomorrowHourly = dailyForecast[1];
    
    if (!todayHourly) return null;
    
    const isGoodWeatherToday = 
      !todayHourly.summary.toLowerCase().includes('rain') && 
      !todayHourly.summary.toLowerCase().includes('storm') &&
      todayHourly.temperature > 60 && 
      todayHourly.temperature < 90;
      
    const isGoodWeatherTomorrow = 
      tomorrowHourly &&
      !tomorrowHourly.summary.toLowerCase().includes('rain') && 
      !tomorrowHourly.summary.toLowerCase().includes('storm') &&
      tomorrowHourly.temperature > 60 && 
      tomorrowHourly.temperature < 90;
      
    if (isGoodWeatherToday) {
      return "Today looks good for outdoor activities";
    } else if (isGoodWeatherTomorrow) {
      return "Tomorrow would be better for outdoor activities";
    } else {
      return "Consider indoor activities for the next couple of days";
    }
  };
  
  // Calculate UV exposure risk
  const getUVAdvice = () => {
    const uvIndex = currentWeather?.uv_index || 0;
    
    if (uvIndex >= 8) {
      return {
        risk: "Very High",
        advice: "Take extra precautions. Wear SPF 30+, protective clothing, seek shade.",
        icon: "exclamation-triangle-fill"
      };
    } else if (uvIndex >= 6) {
      return {
        risk: "High",
        advice: "Protection needed. Wear SPF 30+ and hat. Reduce exposure 10am-4pm.",
        icon: "exclamation-triangle"
      };
    } else if (uvIndex >= 3) {
      return {
        risk: "Moderate",
        advice: "Stay in shade near midday. Wear sunscreen and protective clothing.",
        icon: "exclamation"
      };
    } else {
      return {
        risk: "Low",
        advice: "No protection needed for most people. Wear sunglasses on bright days.",
        icon: "info-circle"
      };
    }
  };
  
  // Get pollen/allergy advice based on weather patterns
  const getAllergyAdvice = () => {
    if (!dailyForecast || !dailyForecast.length) return null;
    
    const windSpeed = currentWeather?.wind?.speed || 0;
    const humidity = currentWeather?.humidity || 0;
    const isRainy = currentWeather?.summary?.toLowerCase().includes('rain');
    
    let risk = "Low";
    let advice = "Low pollen levels likely today.";
    
    if (windSpeed > 10 && humidity < 50 && !isRainy) {
      risk = "High";
      advice = "High winds and low humidity may increase pollen levels. Consider taking allergy medication.";
    } else if (windSpeed > 5 && humidity < 60 && !isRainy) {
      risk = "Moderate";
      advice = "Some pollen may be in the air. Monitor symptoms if you have allergies.";
    } else if (isRainy) {
      risk = "Low";
      advice = "Rain likely reducing pollen in the air today.";
    }
    
    return { risk, advice };
  };
  
  const tempRange = calculateTempRange();
  const uvAdvice = getUVAdvice();
  const allergyInfo = getAllergyAdvice();
  const weatherChange = getWeatherChanges();
  const activityAdvice = getOptimalActivityTime();

  return (
    <div className="WeatherInsights">
      <h2>Weather Insights</h2>
      
      <div className="insights-container">
        {weatherChange && (
          <div className="insight-card">
            <div className="insight-header">
              <i className="bi bi-arrow-repeat"></i>
              <h3>Weather Change Alert</h3>
            </div>
            <p>{weatherChange}</p>
          </div>
        )}
        
        <div className="insight-card">
          <div className="insight-header">
            <i className="bi bi-sun"></i>
            <h3>UV Index: {uvAdvice.risk}</h3>
          </div>
          <div className="insight-content">
            <div className="insight-icon">
              <i className={`bi bi-${uvAdvice.icon}`}></i>
            </div>
            <p>{uvAdvice.advice}</p>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-header">
            <i className="bi bi-flower1"></i>
            <h3>Allergy Forecast</h3>
          </div>
          <div className="insight-content">
            <div className="risk-indicator">
              <span className={`risk-level ${allergyInfo.risk.toLowerCase()}`}>
                {allergyInfo.risk}
              </span>
            </div>
            <p>{allergyInfo.advice}</p>
          </div>
        </div>
        
        <div className="insight-card">
          <div className="insight-header">
            <i className="bi bi-calendar-check"></i>
            <h3>Activity Recommendation</h3>
          </div>
          <p>{activityAdvice}</p>
        </div>
        
        <div className="insight-card">
          <div className="insight-header">
            <i className="bi bi-thermometer"></i>
            <h3>Temperature Trend</h3>
          </div>
          <p>
            Temperature range for the forecast period: 
            <span className="temp-value">{Math.round(tempRange.min)}° to {Math.round(tempRange.max)}°</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeatherInsights;