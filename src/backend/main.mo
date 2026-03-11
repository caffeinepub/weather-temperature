import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";
import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";

actor {
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

  func charToDigit(c : Char) : ?Nat {
    if (c == '0') { ?0 }
    else if (c == '1') { ?1 }
    else if (c == '2') { ?2 }
    else if (c == '3') { ?3 }
    else if (c == '4') { ?4 }
    else if (c == '5') { ?5 }
    else if (c == '6') { ?6 }
    else if (c == '7') { ?7 }
    else if (c == '8') { ?8 }
    else if (c == '9') { ?9 }
    else { null };
  };

  func parseNat(s : Text) : ?Nat {
    var result : Nat = 0;
    var hasDigit = false;
    for (c in s.toIter()) {
      switch (charToDigit(c)) {
        case null { return null };
        case (?d) {
          result := result * 10 + d;
          hasDigit := true;
        };
      };
    };
    if (hasDigit) { ?result } else { null };
  };

  func parseFloat(s : Text) : ?Float {
    if (s.size() == 0) { return null };

    var negative = false;
    var numStr = s;

    switch (s.toIter().next()) {
      case (?'-') {
        negative := true;
        var i = 0;
        var rest = "";
        for (c in s.toIter()) {
          if (i > 0) { rest #= Text.fromChar(c) };
          i += 1;
        };
        numStr := rest;
      };
      case _ {};
    };

    let parts = numStr.split(#char '.').toArray();
    if (parts.size() == 0) { return null };

    let intPart = switch (parseNat(parts[0])) {
      case null { return null };
      case (?v) { v };
    };

    var result = intPart.toFloat();

    if (parts.size() >= 2) {
      let fracStr = parts[1];
      switch (parseNat(fracStr)) {
        case null {};
        case (?fracNat) {
          var divisor : Float = 1.0;
          for (_ in fracStr.toIter()) {
            divisor *= 10.0;
          };
          result += fracNat.toFloat() / divisor;
        };
      };
    };

    if (negative) { ?(-result) } else { ?result };
  };

  // Get the text after "key": in JSON
  func valueAfterKey(json : Text, key : Text) : ?Text {
    let needle = "\"" # key # "\":";
    let parts = json.split(#text(needle)).toArray();
    if (parts.size() < 2) { return null };
    ?parts[1];
  };

  // Read characters until a JSON delimiter
  func takeUntilDelimiter(s : Text) : Text {
    var result = "";
    label l for (c in s.toIter()) {
      if (c == ',' or c == '}' or c == ']' or c == ' ' or c == '\n' or c == '\r' or c == '\t') {
        break l;
      };
      result #= Text.fromChar(c);
    };
    result;
  };

  func extractFloat(json : Text, key : Text) : ?Float {
    switch (valueAfterKey(json, key)) {
      case null { null };
      case (?after) { parseFloat(takeUntilDelimiter(after)) };
    };
  };

  func extractString(json : Text, key : Text) : ?Text {
    let needle = "\"" # key # "\":\"";
    let parts = json.split(#text(needle)).toArray();
    if (parts.size() < 2) { return null };
    let after = parts[1];
    let quoteParts = after.split(#text("\"")).toArray();
    if (quoteParts.size() < 1) { return null };
    ?quoteParts[0];
  };

  func extractArrayFirstFloat(json : Text, key : Text) : ?Float {
    // Try both "key":[ and "key": [ (with space)
    let needle1 = "\"" # key # "\":[";
    let needle2 = "\"" # key # "\": [";
    let parts1 = json.split(#text(needle1)).toArray();
    let parts2 = json.split(#text(needle2)).toArray();
    let afterArr = if (parts1.size() >= 2) { parts1[1] }
      else if (parts2.size() >= 2) { parts2[1] }
      else { return null };
    parseFloat(takeUntilDelimiter(afterArr));
  };

  // Extract the content after an object key (the JSON after "key":{)
  func sectionAfter(json : Text, sectionKey : Text) : ?Text {
    let needle1 = "\"" # sectionKey # "\":{";
    let needle2 = "\"" # sectionKey # "\": {";
    let parts1 = json.split(#text(needle1)).toArray();
    let parts2 = json.split(#text(needle2)).toArray();
    if (parts1.size() >= 2) { ?parts1[1] }
    else if (parts2.size() >= 2) { ?parts2[1] }
    else { null };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared func getWeather(cityName : Text) : async Weather {
    let geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" # cityName # "&count=1&language=en&format=json";
    let geoJson = await OutCall.httpGetRequest(geoUrl, [], transform);

    if (not geoJson.contains(#text("\"results\""))) {
      Runtime.trap("City not found: " # cityName);
    };

    let lat = switch (extractFloat(geoJson, "latitude")) {
      case null { Runtime.trap("Cannot parse latitude for: " # cityName) };
      case (?v) { v };
    };
    let lon = switch (extractFloat(geoJson, "longitude")) {
      case null { Runtime.trap("Cannot parse longitude for: " # cityName) };
      case (?v) { v };
    };
    let resolvedName = switch (extractString(geoJson, "name")) {
      case null { cityName };
      case (?v) { v };
    };

    let weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" # lat.toText() # "&longitude=" # lon.toText() # "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1";
    let weatherJson = await OutCall.httpGetRequest(weatherUrl, [], transform);

    // Extract current weather from the "current" section to avoid matching "current_units"
    let currentSection = switch (sectionAfter(weatherJson, "current")) {
      case null { Runtime.trap("Cannot find current section in weather response") };
      case (?v) { v };
    };

    let currentTemp = switch (extractFloat(currentSection, "temperature_2m")) {
      case null { Runtime.trap("Cannot parse temperature") };
      case (?v) { v };
    };
    let feelsLike = switch (extractFloat(currentSection, "apparent_temperature")) {
      case null { currentTemp };
      case (?v) { v };
    };
    let weatherCodeF = switch (extractFloat(currentSection, "weather_code")) {
      case null { 0.0 };
      case (?v) { v };
    };
    let windSpeed = switch (extractFloat(currentSection, "wind_speed_10m")) {
      case null { 0.0 };
      case (?v) { v };
    };
    let humidityF = switch (extractFloat(currentSection, "relative_humidity_2m")) {
      case null { 0.0 };
      case (?v) { v };
    };

    // Extract daily section for min/max
    let dailySection = switch (sectionAfter(weatherJson, "daily")) {
      case null { weatherJson };
      case (?v) { v };
    };
    let tempMax = switch (extractArrayFirstFloat(dailySection, "temperature_2m_max")) {
      case null { currentTemp };
      case (?v) { v };
    };
    let tempMin = switch (extractArrayFirstFloat(dailySection, "temperature_2m_min")) {
      case null { currentTemp };
      case (?v) { v };
    };

    let timezone = switch (extractString(weatherJson, "timezone")) {
      case null { "UTC" };
      case (?v) { v };
    };

    let humidityInt = humidityF.toInt();
    let humidity : Nat = if (humidityInt > 0) { Int.abs(humidityInt) } else { 0 };

    {
      cityName = resolvedName;
      lat;
      lon;
      currentTemp;
      feelsLike;
      tempMax;
      tempMin;
      humidity;
      windSpeed;
      weatherCode = weatherCodeF.toInt();
      timezone;
    };
  };
};
