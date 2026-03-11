import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";

actor {
  type Coordinates = {
    lat : Float;
    lon : Float;
  };

  type Weather = {
    cityName : Text;
    lat : Float;
    lon : Float;
    currentTemp : Float;
    feelsLike : Float;
    tempMax : Float;
    tempMin : Float;
    humidity : Nat;
    windSpeed : Float;
    weatherCode : Int;
    timezone : Text;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getCoordinates(cityName : Text) : async Coordinates {
    let url = "https://geocoding-api.open-meteo.com/v1/search?name=" # cityName # "&count=1&language=en&format=json";

    switch (await OutCall.httpGetRequest(url, [], transform)) {
      case (_) { Runtime.trap("Should be parsed in frontend, not in backend!") };
    };
  };

  func getWeatherData(coords : Coordinates) : async Weather {
    let url = "https://api.open-meteo.com/v1/forecast?latitude=" # coords.lat.toText() # "&longitude=" # coords.lon.toText() # "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1";

    switch (await OutCall.httpGetRequest(url, [], transform)) {
      case (_) { Runtime.trap("Should be parsed in frontend, not in backend!") };
    };
  };

  public shared ({ caller }) func getWeather(cityName : Text) : async Weather {
    let coords = await getCoordinates(cityName);
    await getWeatherData(coords);
  };
};
