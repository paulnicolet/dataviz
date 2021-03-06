import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map.Entry;

import javax.swing.plaf.synth.SynthSpinnerUI;

import org.json.JSONException;
import org.json.JSONObject;

public class Merge {

	public static void main(String[] args) throws IOException, JSONException {

		HashMap<String, HashMap<Integer, JSONObject>> countryToYear = new HashMap<String, HashMap<Integer, JSONObject>>();

		JSONObject metaData = new JSONObject();

		// GDP data extraction
		BufferedReader br = new BufferedReader(new FileReader("data/population-gdp-data/gdp.csv"));
		String line = "";
		br.readLine();

		Double minGDP = Double.MAX_VALUE;
		Double maxGDP = Double.MIN_VALUE;
		while ((line = br.readLine()) != null) {

			String[] tmp = line.split(",");

			// remove all parantheses in name and their content
			String country = tmp[0].replaceAll("\\(.*?\\) ?", "").trim();

			countryToYear.put(country, new HashMap<>());

			// we add every year we have
			for (int i = 1; i < tmp.length; i++) {

				Double gdp = Double.parseDouble(tmp[i]);

				minGDP = Double.min(gdp, minGDP);
				maxGDP = Double.max(gdp, maxGDP);

				JSONObject o = new JSONObject();
				o.put("country", country);
				o.put("gdp", gdp);
				countryToYear.get(country).put(1949 + i, o);
			}
		}

		metaData.put("minGDP", minGDP);
		metaData.put("maxGDP", maxGDP);

		System.out.println("After GDP, # = " + countryToYear.size());

		br.close();

		// pop
		br = new BufferedReader(new FileReader("data/population-gdp-data/pop.csv"));
		line = "";

		br.readLine();

		HashMap<String, HashMap<Integer, JSONObject>> tmpCountryToYear = new HashMap<>();

		// unfortunately, the country names don't always match, hence the 'by hand' matching
		HashMap<String, String> firstLevelMapping = new HashMap<>();
		firstLevelMapping.put("Democratic Republic of the Congo", "Congo the Democratic Republic of the");
		firstLevelMapping.put("Iran", "Iran Islamic Republic of");
		firstLevelMapping.put("Micronesia", "Micronesia Federated States of");
		firstLevelMapping.put("United States of America", "United States");
		firstLevelMapping.put("Dem. People's Republic of Korea", "Korea Democratic People's Republic of");
		firstLevelMapping.put("Caribbean Netherlands", "Netherlands Antilles");
		firstLevelMapping.put("Czechia", "Czech Republic");
		firstLevelMapping.put("Republic of Moldova", "Moldova");
		firstLevelMapping.put("British Virgin Islands", "Virgin Islands British");
		firstLevelMapping.put("China Macao SAR", "Macao Special Administrative Region of China");
		firstLevelMapping.put("China Taiwan Province of China", "Taiwan");
		firstLevelMapping.put("China Hong Kong SAR", "Hong Kong Special Administrative Region of China");
		firstLevelMapping.put("TFYR Macedonia", "Macedonia the Former Yugoslav Republic of");
		firstLevelMapping.put("United Republic of Tanzania", "Tanzania United Republic of");
		firstLevelMapping.put("Libya", "Libyan Arab Jamahiriya");
		firstLevelMapping.put("Republic of Korea", "Korea Republic of");
		firstLevelMapping.put("State of Palestine", "Occupied Palestinian Territory");

		Double minPop = Double.MAX_VALUE;
		Double maxPop = Double.MIN_VALUE;
		while ((line = br.readLine()) != null) {

			String[] tmp = line.split(",");

			// remove all parantheses in name and their content
			String country = tmp[0].replaceAll("\\(.*?\\) ?", "").trim();

			// check if you need to pick from the 'by hand' matching
			if (firstLevelMapping.containsKey(country)) {
				country = firstLevelMapping.get(country);
			}

			if (countryToYear.containsKey(country)) {

				// now we are sure that this country is encounter
				tmpCountryToYear.put(country, countryToYear.get(country));

				for (int i = 1; i < tmp.length; i++) {

					Double pop = Double.parseDouble(tmp[i].trim());

					minPop = Double.min(pop, minPop);
					maxPop = Double.max(pop, maxPop);

					countryToYear.get(country).get(1949 + i).put("population", pop);
				}
			}
		}

		metaData.put("minPop", minPop);
		metaData.put("maxPop", maxPop);

		// this is our new map from country to data
		countryToYear = tmpCountryToYear;
		System.out.println("After pop, # = " + countryToYear.size());

		br.close();

		// temperature
		br = new BufferedReader(new FileReader(
				"data/climate-change-earth-surface-temperature-data/GlobalLandTemperaturesByCountry.csv"));
		line = "";

		br.readLine();

		tmpCountryToYear = new HashMap<>();

		// same as above
		HashMap<String, String> secondLevelMapping = new HashMap<>();
		secondLevelMapping.put("Syria", "Syrian Arab Republic");
		secondLevelMapping.put("Bosnia And Herzegovina", "Bosnia and Herzegovina");
		secondLevelMapping.put("North Korea", "Korea Democratic People's Republic of");
		secondLevelMapping.put("South Korea", "Korea Republic of");
		secondLevelMapping.put("Iran", "Iran Islamic Republic of");
		secondLevelMapping.put("Saint Kitts And Nevis", "Saint Kitts and Nevis");
		secondLevelMapping.put("Federated States Of Micronesia", "Micronesia Federated States of");
		secondLevelMapping.put("Palestina", "Occupied Palestinian Territory");
		secondLevelMapping.put("Vietnam", "Viet Nam");
		secondLevelMapping.put("Côte D'Ivoire", "Côte d'Ivoire");
		secondLevelMapping.put("British Virgin Islands", "Virgin Islands British");
		secondLevelMapping.put("Tanzania", "Tanzania United Republic of");
		secondLevelMapping.put("Guinea Bissau", "Guinea-Bissau");
		secondLevelMapping.put("Macedonia", "Macedonia the Former Yugoslav Republic of");
		secondLevelMapping.put("Hong Kong", "Hong Kong Special Administrative Region of China");
		secondLevelMapping.put("Libya", "Libyan Arab Jamahiriya");
		secondLevelMapping.put("Antigua And Barbuda", "Antigua and Barbuda");
		secondLevelMapping.put("Laos", "Lao People's Democratic Republic");
		secondLevelMapping.put("Russia", "Russian Federation");
		secondLevelMapping.put("Macau", "Macao Special Administrative Region of China");
		secondLevelMapping.put("Trinidad And Tobago", "Trinidad and Tobago");
		secondLevelMapping.put("Sao Tome And Principe", "Sao Tome and Principe");
		secondLevelMapping.put("Saint Vincent And The Grenadines", "Saint Vincent and the Grenadines");

		Double sumTempOneYear = 0.0;
		int numDayDataAvailable = 0;

		// to be honest, temperature data are a mess, nothing is consistent, hence the save of the last state
		int currentYear = 1950;
		String currentCountry = "Åland";
		boolean firstForCountry = true;
		double valFirstForCountry = 0.0;
		int lastMonth = 1;

		Double maxTemp = Double.MIN_VALUE;
		Double minTemp = Double.MAX_VALUE;
		while ((line = br.readLine()) != null) {

			String[] tmp = line.split(",");

			String[] date = tmp[0].split("-");
			int year = Integer.parseInt(date[0]);
			int month = Integer.parseInt(date[1]);

			// remove all parantheses in name and their content
			String country = tmp[3].replaceAll("\\(.*?\\) ?", "").trim();
			// check the 'by hand' mapping again
			if (secondLevelMapping.containsKey(country)) {
				country = secondLevelMapping.get(country);
			}
			
			// the current mean (maybe not used)
			double res = 0.0;
			if(numDayDataAvailable > 0) {
				res = sumTempOneYear / numDayDataAvailable;
			}
			
			// with inconsistency of data, we need this firewall to prevent
			// carrying data from year to year or country to country
			if(lastMonth > month || currentYear != year || !country.equals(currentCountry)) {
				numDayDataAvailable = 0;
				sumTempOneYear = 0.0;
			}

			// we need to save a mean temperature
			if (lastMonth > month) {
				
				maxTemp = Double.max(maxTemp, res);
				minTemp = Double.min(minTemp, res);
				
				numDayDataAvailable = 0;
				sumTempOneYear = 0.0;
				
				// we don't use data before 1950
				if(currentYear >= 1950 && countryToYear.containsKey(country)) {
					
					tmpCountryToYear.put(country, countryToYear.get(country));
					
					countryToYear.get(country).get(currentYear).put("temperature", res);
					
					// the variation is used with the first time we encounter data for
					// a country, thus we need a 'first' time
					if(firstForCountry) {
						firstForCountry = false;
						valFirstForCountry = res;
						countryToYear.get(country).get(currentYear).put("variation", 0.0);
					} else {
						countryToYear.get(country).get(currentYear).put("variation", Math.abs(valFirstForCountry - res));
					}
				}
			}
			
			// to compute the mean 
			if(!tmp[1].equals("")) {
				numDayDataAvailable++;
				sumTempOneYear += Double.parseDouble(tmp[1]);
			}
			
			// we the current state change the country, we need a new 'first' time
			if(!currentCountry.equals(country) || currentYear > year) {
				firstForCountry = true;
			}

			currentYear = year;
			currentCountry = country;
			lastMonth = month;
		}

		metaData.put("minTemp", minTemp);
		metaData.put("maxTemp", maxTemp);

		countryToYear = tmpCountryToYear;
		System.out.println("After temperature, # = " + countryToYear.size());

		// final result
		JSONObject[] jsonYear = new JSONObject[66];
		for (int i = 0; i < 66; i++) {
			jsonYear[i] = new JSONObject();
		}

		for (Entry<String, HashMap<Integer, JSONObject>> e : countryToYear.entrySet()) {

			String country = e.getKey();

			for (Entry<Integer, JSONObject> ee : e.getValue().entrySet()) {

				jsonYear[ee.getKey() - 1950].put(country, ee.getValue());

			}
		}

		JSONObject result = new JSONObject();
		// save metadata useful for color/size
		result.put("metadata", metaData);

		for (int i = 0; i < 66; i++) {
			result.put(Integer.toString(1950 + i), jsonYear[i]);
		}

		// writing the JSONObject into a file(info.json)
		FileWriter fileWriter = new FileWriter("final.min.json");
		fileWriter.write(result.toString());
		fileWriter.flush();
		fileWriter.close();

		// readable json
/*
		fileWriter = new FileWriter("final.json");
		fileWriter.write(result.toString(1));
		fileWriter.flush();
		fileWriter.close();
*/
	}
}
