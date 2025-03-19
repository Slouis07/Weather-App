import { useContext, useState, useRef, useEffect } from "react";
import WeatherContext from "../context/weather.context";
import "../styles/components/WeatherImpactPlanner.scss";

function WeatherImpactPlanner() {
  const { currentWeather, dailyForecast, hourlyForecast } =
    useContext(WeatherContext);
  const [selectedActivity, setSelectedActivity] = useState("all");
  const dayScoresRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (dayScoresRef.current) {
        const { scrollWidth, clientWidth } = dayScoresRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [dailyForecast]);

  const activities = [
    {
      id: "running",
      name: "Running",
      icon: "person-running",
      idealTemp: { min: 50, max: 75 },
      avoidConditions: ["Heavy Rain", "Thunderstorm", "Snow"],
      idealWind: { max: 15 }, // mph
      uvWarning: 7,
    },
    {
      id: "cycling",
      name: "Cycling",
      icon: "bicycle",
      idealTemp: { min: 55, max: 80 },
      avoidConditions: ["Heavy Rain", "Thunderstorm", "Snow", "Ice"],
      idealWind: { max: 12 },
      uvWarning: 7,
    },
    {
      id: "hiking",
      name: "Hiking",
      icon: "person-hiking",
      idealTemp: { min: 45, max: 85 },
      avoidConditions: ["Heavy Rain", "Thunderstorm", "Snow"],
      idealWind: { max: 20 },
      uvWarning: 8,
    },
    {
      id: "picnic",
      name: "Picnic",
      icon: "basket2-fill",
      idealTemp: { min: 65, max: 85 },
      avoidConditions: ["Rain", "Drizzle", "Thunderstorm"],
      idealWind: { max: 10 },
      uvWarning: 6,
    },
    {
      id: "beach",
      name: "Beach",
      icon: "umbrella-beach",
      idealTemp: { min: 75, max: 95 },
      avoidConditions: ["Rain", "Thunderstorm", "Overcast"],
      idealWind: { max: 12 },
      uvWarning: 9,
    },
    {
      id: "photography",
      name: "Photography",
      icon: "camera-fill",
      idealTemp: { min: 40, max: 90 },
      avoidConditions: ["Heavy Rain", "Thunderstorm"],
      idealWind: { max: 15 },
      uvWarning: 10,
    },
  ];

  const getNextSevenDays = () => {
    if (!dailyForecast || dailyForecast.length < 7) return [];
    return dailyForecast.slice(0, 7);
  };

  const getActivityScore = (activity, weather) => {
    if (!weather) return 0;

    let score = 100;

    // Check temperature
    if (weather.temperature < activity.idealTemp.min) {
      score -= 5 * (activity.idealTemp.min - weather.temperature);
    }
    if (weather.temperature > activity.idealTemp.max) {
      score -= 5 * (weather.temperature - activity.idealTemp.max);
    }

    // Check conditions
    const conditions = weather.summary.toLowerCase();
    if (
      activity.avoidConditions.some((cond) =>
        conditions.includes(cond.toLowerCase())
      )
    ) {
      score -= 40;
    }

    // Check wind
    if (weather.wind && weather.wind.speed > activity.idealWind.max) {
      score -= 5 * (weather.wind.speed - activity.idealWind.max);
    }

    // Check UV index
    if (weather.uv_index && weather.uv_index > activity.uvWarning) {
      score -= 5 * (weather.uv_index - activity.uvWarning);
    }

    return Math.max(0, Math.min(100, score));
  };

  const getBestTimeForActivity = (activity) => {
    if (!hourlyForecast || hourlyForecast.length === 0) return null;

    // Only look at the next 48 hours
    const next48Hours = hourlyForecast.slice(0, 48);

    // Score each hour
    const scoredHours = next48Hours.map((hour) => ({
      date: new Date(hour.date),
      score: getActivityScore(activity, hour),
    }));

    // Get the best times (score > 80)
    const goodTimes = scoredHours
      .filter((hour) => hour.score > 80)
      .sort((a, b) => b.score - a.score);

    if (goodTimes.length === 0) return null;

    // Return the best time
    return {
      date: goodTimes[0].date,
      score: goodTimes[0].score,
    };
  };

  const getDayScore = (day, activityId) => {
    if (!day) return 0;

    if (activityId === "all") {
      // Average score across all activities
      return Math.round(
        activities.reduce(
          (sum, activity) => sum + getActivityScore(activity, day),
          0
        ) / activities.length
      );
    } else {
      const activity = activities.find((a) => a.id === activityId);
      return activity ? Math.round(getActivityScore(activity, day)) : 0;
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "fair";
    return "poor";
  };

  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const nextSevenDays = getNextSevenDays();

  return (
    <div className="WeatherImpactPlanner">
      <h2>Activity Planner</h2>

      <div className="activity-selector">
        <div
          className={`activity-icon ${
            selectedActivity === "all" ? "selected" : ""
          }`}
          onClick={() => setSelectedActivity("all")}
        >
          <i className="bi bi-calendar-check"></i>
          <span>All Activities</span>
        </div>

        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`activity-icon ${
              selectedActivity === activity.id ? "selected" : ""
            }`}
            onClick={() => setSelectedActivity(activity.id)}
          >
            <i className={`bi bi-${activity.icon}`}></i>
            <span>{activity.name}</span>
          </div>
        ))}
      </div>

      <div className="forecast-impact">
        <h3>7-Day Outlook</h3>
        <div className="days-container">
          <div ref={dayScoresRef} className="day-scores">
            {nextSevenDays.map((day, index) => {
              const score = getDayScore(day, selectedActivity);
              const scoreClass = getScoreClass(score);
              const dayLabel =
                index === 0
                  ? "Today"
                  : index === 1
                  ? "Tomorrow"
                  : new Date(day.day).toLocaleDateString([], {
                      weekday: "short",
                    });

              return (
                <div key={day.day} className="day-score">
                  <div className="day-label">{dayLabel}</div>
                  <div className={`score-circle ${scoreClass}`}>
                    <span>{score}</span>
                  </div>
                  <div className="score-label">{scoreClass}</div>
                </div>
              );
            })}
          </div>
          {showScrollIndicator && (
            <div className="scroll-indicator">
              <i className="bi bi-arrow-left-right"></i> Scroll to see more days
            </div>
          )}
        </div>
      </div>

      {selectedActivity !== "all" && (
        <div className="optimal-time">
          <h3>
            Best Time for{" "}
            {activities.find((a) => a.id === selectedActivity)?.name}
          </h3>
          <div className="time-recommendation">
            {(() => {
              const bestTime = getBestTimeForActivity(
                activities.find((a) => a.id === selectedActivity)
              );
              if (bestTime) {
                return (
                  <div className="recommendation-card">
                    <div className="recommendation-icon">
                      <i className="bi bi-clock-fill"></i>
                    </div>
                    <div className="recommendation-details">
                      <div className="recommendation-time">
                        {formatDate(bestTime.date)}
                      </div>
                      <div className="recommendation-score">
                        <span
                          className={`score-badge ${getScoreClass(
                            bestTime.score
                          )}`}
                        >
                          {bestTime.score}% Ideal
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="no-recommendation">
                    <i className="bi bi-exclamation-circle"></i>
                    <p>No good times found in the next 48 hours</p>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      <div className="tips-section">
        <h3>Activity Tips</h3>
        <div className="tips-container">
          {selectedActivity === "all" ? (
            <div className="general-tip">
              <i className="bi bi-info-circle"></i>
              <p>Select an activity above to see specific recommendations</p>
            </div>
          ) : (
            (() => {
              const activity = activities.find(
                (a) => a.id === selectedActivity
              );
              const weather = currentWeather;
              if (!activity || !weather) return null;

              const tips = [];
              const tempF = weather.temperature;
              const conditions = weather.summary.toLowerCase();
              const uvIndex = weather.uv_index || 0;
              const windSpeed = weather.wind?.speed || 0;

              // Temperature tips
              if (tempF < activity.idealTemp.min) {
                tips.push(
                  `Dress warmly. Temperature is ${tempF}°, which is below ideal range for ${activity.name}`
                );
              } else if (tempF > activity.idealTemp.max) {
                tips.push(
                  `Stay hydrated. Temperature is ${tempF}°, which is above ideal range for ${activity.name}`
                );
              }

              // UV tips
              if (uvIndex > activity.uvWarning) {
                tips.push(
                  `Apply sunscreen. UV index is ${uvIndex}, which is high for ${activity.name}`
                );
              }

              // Wind tips
              if (windSpeed > activity.idealWind.max) {
                tips.push(
                  `Be aware of strong winds at ${windSpeed} mph. Consider adjusting your plans`
                );
              }

              // Condition tips
              if (
                activity.avoidConditions.some((cond) =>
                  conditions.includes(cond.toLowerCase())
                )
              ) {
                tips.push(
                  `Current conditions (${weather.summary}) are not ideal for ${activity.name}`
                );
              }

              return (
                <div className="activity-tips">
                  {tips.length > 0 ? (
                    tips.map((tip, i) => (
                      <div key={i} className="tip">
                        <i className="bi bi-lightbulb"></i>
                        <p>{tip}</p>
                      </div>
                    ))
                  ) : (
                    <div className="tip">
                      <i className="bi bi-check-circle"></i>
                      <p>Current conditions are good for {activity.name}!</p>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

export default WeatherImpactPlanner;
