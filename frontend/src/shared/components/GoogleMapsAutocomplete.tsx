/**
 * Google Maps Autocomplete Component
 * @purpose: Reusable location input with Google Places Autocomplete
 * @features: 
 * - Autocomplete suggestions from Google Maps
 * - Extracts location string AND coordinates
 * - Graceful fallback to plain input if API fails
 * - India-focused with cities/localities
 */

import { useState, useEffect, useRef } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_AND_TRANSLATE_API;

interface GoogleMapsAutocompleteProps {
    value: string;
    onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
    id?: string;
}

// Declare google types
declare global {
    interface Window {
        google?: any;
    }
}

export const GoogleMapsAutocomplete = ({
    value,
    onChange,
    placeholder = 'Enter location',
    className = '',
    disabled = false,
    id = 'location-input',
}: GoogleMapsAutocompleteProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any>(null);
    const [isApiLoaded, setIsApiLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [apiFailed, setApiFailed] = useState(false);

    // Load Google Maps API
    useEffect(() => {
        // Check if already loaded
        if (window.google?.maps?.places) {
            setIsApiLoaded(true);
            setIsLoading(false);
            return;
        }

        // Check if API key exists
        if (!GOOGLE_MAPS_API_KEY) {
            console.warn('Google Maps API key not found in environment variables');
            setApiFailed(true);
            setIsLoading(false);
            return;
        }

        // Load script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=en`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            setIsApiLoaded(true);
            setIsLoading(false);
        };

        script.onerror = () => {
            console.error('Failed to load Google Maps API');
            setApiFailed(true);
            setIsLoading(false);
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Initialize autocomplete
    useEffect(() => {
        if (!isApiLoaded || !inputRef.current || disabled) return;

        try {
            // Verify Google Maps API is fully loaded
            if (!window.google?.maps?.places?.Autocomplete) {
                console.error('Google Maps Places API not fully loaded');
                setApiFailed(true);
                return;
            }

            console.log('Initializing Google Places Autocomplete...');

            // Initialize Google Places Autocomplete
            // NOTE: (cities) cannot be mixed with other types - use 'geocode' for all locations
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['geocode'], // Use 'geocode' instead of mixing types - includes cities, localities, etc.
                componentRestrictions: { country: 'in' }, // Restrict to India
                fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            });

            console.log('Autocomplete initialized successfully');

            // Listen for place selection
            autocompleteRef.current.addListener('place_changed', () => {
                try {
                    const place = autocompleteRef.current.getPlace();
                    console.log('Place selected:', place);

                    if (!place || !place.geometry || !place.geometry.location) {
                        // User entered text but didn't select from dropdown
                        console.log('No geometry found, using input value');
                        onChange(inputRef.current?.value || '');
                        return;
                    }

                    // Extract location details
                    const locationString = extractLocationString(place);
                    const coordinates = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };

                    console.log('Location extracted:', { locationString, coordinates });

                    // Call onChange with both location string and coordinates
                    onChange(locationString, coordinates);

                    // Update input value
                    if (inputRef.current) {
                        inputRef.current.value = locationString;
                    }
                } catch (placeError) {
                    console.error('Error processing place selection:', placeError);
                    // Fallback: use input value
                    onChange(inputRef.current?.value || '');
                }
            });
        } catch (error) {
            console.error('Failed to initialize Google Places Autocomplete:', error);
            setApiFailed(true);
        }
    }, [isApiLoaded, disabled, onChange]);

    // Extract clean location string from place object
    const extractLocationString = (place: any): string => {
        // Try to get a clean city name from address components
        const addressComponents = place.address_components || [];
        let city = '';
        let state = '';

        for (const component of addressComponents) {
            const types = component.types;

            if (types.includes('locality')) {
                city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name || component.long_name;
            }
        }

        // Build location string
        if (city && state) {
            return `${city}, ${state}`;
        } else if (city) {
            return city;
        } else if (place.name) {
            return place.name;
        } else {
            return place.formatted_address || '';
        }
    };

    // Fallback to plain input if API failed or not loaded
    if (apiFailed || (!isApiLoaded && !isLoading)) {
        return (
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={className}
                    disabled={disabled}
                />
                {apiFailed && (
                    <p className="mt-1 text-xs text-gray-500">
                        Autocomplete unavailable, please enter location manually
                    </p>
                )}
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="relative">
                <input
                    type="text"
                    id={id}
                    value={value}
                    placeholder="Loading autocomplete..."
                    className={className}
                    disabled
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <MaterialSymbol name="sync" size={20} className="text-gray-400 animate-spin" />
                </div>
            </div>
        );
    }

    // Autocomplete ready
    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                id={id}
                defaultValue={value}
                placeholder={placeholder}
                className={className}
                disabled={disabled}
                onBlur={(e) => {
                    // If user types without selecting, update with typed value
                    if (e.target.value !== value) {
                        onChange(e.target.value);
                    }
                }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MaterialSymbol name="location_on" size={20} className="text-gray-400" />
            </div>
        </div>
    );
};
