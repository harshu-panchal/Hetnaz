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

interface LocationDetails {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
}

interface GoogleMapsAutocompleteProps {
    value: string;
    onChange: (value: string, details?: LocationDetails) => void;
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

    // Use ref for onChange to prevent re-initializing Autocomplete every time it changes
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Sync input value when prop changes (for "Use My Location" or external updates)
    useEffect(() => {
        if (inputRef.current && value !== undefined && inputRef.current.value !== value) {
            inputRef.current.value = value;
        }
    }, [value]);

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
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['geocode'],
                componentRestrictions: { country: 'in' },
                fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            });

            console.log('Autocomplete initialized successfully');

            // Listen for place selection
            autocompleteRef.current.addListener('place_changed', () => {
                try {
                    const place = autocompleteRef.current.getPlace();
                    console.log('Place selected:', place);

                    if (!place) {
                        console.log('No place returned from Google Autocomplete');
                        onChangeRef.current(inputRef.current?.value || '', undefined);
                        return;
                    }

                    if (!place.geometry || !place.geometry.location) {
                        // User entered text but didn't select from dropdown
                        console.log('No geometry found for place:', place.name || 'unknown');
                        onChangeRef.current(inputRef.current?.value || '', undefined);
                        return;
                    }

                    // Extract location details
                    const details = extractLocationDetails(place);
                    const coordinates = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };

                    const locationDetails: LocationDetails = {
                        ...details,
                        coordinates
                    };

                    // Use the EXACT formatted address from Google Maps instead of normalizing
                    // This preserves detailed location like "123 Main St, Andheri West, Mumbai, Maharashtra"
                    const locationString = place.formatted_address || place.name || '';

                    console.log('Location extracted:', { locationString, locationDetails });

                    // Call onChange with both location string and all details
                    onChangeRef.current(locationString, locationDetails);

                    // Update input value
                    if (inputRef.current) {
                        inputRef.current.value = locationString;
                    }
                } catch (placeError) {
                    console.error('Error processing place selection:', placeError);
                    onChangeRef.current(inputRef.current?.value || '', undefined);
                }
            });
        } catch (error) {
            console.error('Failed to initialize Google Places Autocomplete:', error);
            setApiFailed(true);
        }
        // NOTE: Explicitly omitting onChange from dependencies to prevent re-initialization
        // We use onChangeRef instead.
    }, [isApiLoaded, disabled]);

    // Extract structured location details from place object
    const extractLocationDetails = (place: any): { city: string; state: string; country: string } => {
        const addressComponents = place.address_components || [];
        let city = '';
        let state = '';
        let country = '';

        for (const component of addressComponents) {
            const types = component.types;

            if (types.includes('locality') || types.includes('sublocality_level_1')) {
                city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                state = component.short_name || component.long_name;
            } else if (types.includes('country')) {
                country = component.long_name;
            }
        }

        // Fallback for city if locality is missing (common in some regions)
        if (!city && place.name && place.name !== place.formatted_address) {
            city = place.name;
        }

        return { city, state, country };
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
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
                disabled={disabled}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <MaterialSymbol name="location_on" size={20} className="text-gray-400" />
            </div>
        </div>
    );
};
