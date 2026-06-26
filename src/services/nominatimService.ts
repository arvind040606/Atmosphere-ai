import { weatherClient } from "./apiClient";
import type { CitySearchResult, Coordinates } from "../types/weather";

/**
 * Nominatim API response type for search results
 * Full type: https://nominatim.org/release-docs/latest/api/Search/
 */
export interface NominatimSearchResult {
  osm_id: number;
  osm_type: "node" | "way" | "relation";
  lat: string;
  lon: string;
  display_name: string;
  address: {
    [key: string]: string;
  };
  type: string;
  class: string;
}

/**
 * Nominatim reverse geocoding response
 * https://nominatim.org/release-docs/latest/api/Reverse/
 */
export interface NominatimReverseResult {
  address: {
    [key: string]: string;
  };
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Parse Nominatim search result into our standard CitySearchResult
 */
function parseSearchResult(result: NominatimSearchResult): CitySearchResult {
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);
  
  // Extract meaningful location parts from display_name
  // Format: "Street, City, State, Country" or similar
  const parts = result.display_name.split(",").map((p) => p.trim());
  
  // Smart extraction of name, region, country
  let name = result.address.name || result.address.amenity || result.address.shop || parts[0] || "Unknown";
  let region =
    result.address.state ||
    result.address.province ||
    result.address.county ||
    result.address.region ||
    result.address.suburb ||
    result.address.village ||
    "";
  let country = result.address.country || parts[parts.length - 1] || "";

  return {
    id: `${lat},${lon}`,
    name,
    region,
    country,
    coordinates: { lat, lon },
    displayName: result.display_name, // Store full display for UI
    type: result.type,
    class: result.class,
  };
}

/**
 * Parse Nominatim reverse geocoding result
 */
function parseReverseResult(result: NominatimReverseResult): CitySearchResult {
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);
  
  const address = result.address;
  let name = address.name || address.amenity || address.shop || "Unknown Location";
  let region =
    address.state ||
    address.province ||
    address.county ||
    address.region ||
    address.suburb ||
    address.village ||
    "";
  let country = address.country || "";

  return {
    id: `${lat},${lon}`,
    name,
    region,
    country,
    coordinates: { lat, lon },
    displayName: result.display_name,
    type: address.building ? "building" : "place",
    class: "building",
  };
}

/**
 * Search worldwide locations using OpenStreetMap Nominatim API
 * Supports: cities, countries, landmarks, POIs, coordinates, postal codes, etc.
 * 
 * Implements fuzzy search with typo tolerance via `fuzzy: 1` parameter
 * 
 * @param query - User search query (e.g., "amritsar", "taj mahal", "160055")
 * @param limit - Max results to return (default: 10)
 * @returns Array of CitySearchResult with coordinates
 */
export async function searchLocations(
  query: string,
  limit: number = 10
): Promise<CitySearchResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await weatherClient.get<NominatimSearchResult[]>(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          limit,
          format: "json",
          addressdetails: 1, // Include address breakdown
          extratags: 1, // Include extra tags
          namedetails: 1, // Include name details
          // Fuzzy search with typo tolerance
          fuzzy: 1,
          // Rank results by importance
          dedupe: 1,
        },
      }
    );

    return response.data.map(parseSearchResult);
  } catch (err) {
    console.error("Nominatim search error:", err);
    throw err;
  }
}

/**
 * Reverse geocode coordinates to get location name
 * Useful for map clicks or manually entered coordinates
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Location details with name, region, country
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<CitySearchResult | null> {
  try {
    const response = await weatherClient.get<NominatimReverseResult>(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
          addressdetails: 1,
          extratags: 1,
          namedetails: 1,
          zoom: 10, // Detailed level
        },
      }
    );

    return parseReverseResult(response.data);
  } catch (err) {
    console.error("Nominatim reverse geocode error:", err);
    return null;
  }
}

/**
 * Search by coordinates (if user pastes "lat,lon" or similar)
 * Validates format and returns result with proper location details
 */
export async function searchByCoordinates(query: string): Promise<CitySearchResult | null> {
  const coordMatch = query.match(/^([-+]?\d+\.?\d*)[,\s]+([-+]?\d+\.?\d*)$/);
  if (!coordMatch) return null;

  const lat = parseFloat(coordMatch[1]);
  const lon = parseFloat(coordMatch[2]);

  // Validate coordinate ranges
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  return reverseGeocode(lat, lon);
}

/**
 * Smart search function that tries:
 * 1. Coordinate parsing (if query looks like "lat,lon")
 * 2. Full text search via Nominatim
 */
export async function smartSearch(query: string, limit: number = 10): Promise<CitySearchResult[]> {
  const trimmed = query.trim();

  // Try coordinate parsing first
  const coordResult = await searchByCoordinates(trimmed);
  if (coordResult) {
    return [coordResult];
  }

  // Fall back to full text search
  return searchLocations(trimmed, limit);
}
