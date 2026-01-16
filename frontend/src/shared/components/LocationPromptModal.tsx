import { useState, useCallback } from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { GoogleMapsAutocomplete } from './GoogleMapsAutocomplete';
import axios from 'axios';
import { useAuth } from '../../core/context/AuthContext';
import { getAuthToken } from '../../core/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LocationPromptModalProps {
    onSave: (location: string, coordinates?: { lat: number; lng: number }) => void;
    onClose?: () => void;
}

interface LocationDetails {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
}

export const LocationPromptModal = ({ onSave, onClose }: LocationPromptModalProps) => {
    const { user } = useAuth();
    const [location, setLocation] = useState(user?.location || '');
    const [city, setCity] = useState(user?.city || '');
    const [stateName, setStateName] = useState('');
    const [countryName, setCountryName] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
        user?.latitude && user?.longitude ? { lat: user.latitude, lng: user.longitude } : null
    );
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const handleLocationChange = useCallback((value: string, details?: LocationDetails) => {
        setLocation(value);
        if (details) {
            setCoordinates(details.coordinates || null);
            setCity(details.city || value);
            setStateName(details.state || '');
            setCountryName(details.country || '');
        } else {
            setCoordinates(null);
            setCity(value);
        }
        if (error) setError('');
    }, [error]);

    const handleUseMyLocation = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsFetchingLocation(true);
        setError('');

        if (navigator.permissions) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
                if (permissionStatus.state === 'denied') {
                    setError('Location permission denied. Please enable in your device settings.');
                    setIsFetchingLocation(false);
                    return;
                }
            } catch (e) {
                console.log('Permission API error', e);
            }
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCoordinates({ lat, lng });

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_AND_TRANSLATE_API}`
                    );
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        const addressComponents = data.results[0].address_components;
                        let foundCity = '';
                        let foundState = '';
                        let foundCountry = '';

                        for (const component of addressComponents) {
                            if (component.types.includes('locality')) {
                                foundCity = component.long_name;
                            } else if (component.types.includes('administrative_area_level_1')) {
                                foundState = component.short_name;
                            } else if (component.types.includes('country')) {
                                foundCountry = component.long_name;
                            }
                        }

                        // Use EXACT formatted address to preserve detailed location
                        const locationString = data.results[0].formatted_address;
                        setLocation(locationString);
                        setCity(foundCity || locationString);
                        setStateName(foundState);
                        setCountryName(foundCountry);
                    }
                } catch (err) {
                    console.error('Reverse geocoding failed:', err);
                    setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    setCity(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
                setIsFetchingLocation(false);
            },
            (err) => {
                if (err.code === 1) setError('Location access denied. Please enable in settings.');
                else if (err.code === 2) setError('Unable to determine location. Please enter manually.');
                else setError('Failed to get location. Please enter manually.');
                setIsFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    const handleSave = async () => {
        if (!location.trim()) {
            setError('Please enter your location');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = getAuthToken();
            const payload: any = {
                location: location.trim(),
                city: city.trim() || location.trim(),
                state: stateName,
                country: countryName
            };

            if (coordinates) {
                payload.latitude = coordinates.lat;
                payload.longitude = coordinates.lng;
            }

            await axios.patch(
                `${API_URL}/users/me`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onSave(location.trim(), coordinates || undefined);
            if (onClose) onClose();
        } catch (err) {
            console.error('Failed to save location:', err);
            setError('Failed to save location. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#342d18] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
                        <MaterialSymbol name="location_on" size={32} className="text-pink-600 dark:text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Set Your Location
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Help us connect you with nearby users
                    </p>
                </div>

                {/* Input */}
                <div className="mb-6">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Exact Location
                    </label>
                    <GoogleMapsAutocomplete
                        id="location"
                        value={location}
                        onChange={handleLocationChange}
                        placeholder="e.g., 123 Main St, Andheri West, Mumbai"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-[#2f151e] dark:text-white ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                        disabled={isLoading}
                        error={error}
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <MaterialSymbol name="error" size={16} />
                            {error}
                        </p>
                    )}

                    {/* Use My Location Button */}
                    <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={isLoading || isFetchingLocation}
                        className="mt-3 w-full py-2 border-2 border-pink-500 text-pink-600 dark:text-pink-400 font-medium rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isFetchingLocation ? (
                            <>
                                <MaterialSymbol name="sync" size={20} className="animate-spin" />
                                Getting location...
                            </>
                        ) : (
                            <>
                                <MaterialSymbol name="my_location" size={20} />
                                Use My Location
                            </>
                        )}
                    </button>
                </div>

                {/* Button */}
                <button
                    onClick={handleSave}
                    disabled={isLoading || !location.trim()}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <MaterialSymbol name="sync" size={20} className="animate-spin" />
                            Saving...
                        </span>
                    ) : (
                        'Save Location'
                    )}
                </button>
            </div>
        </div>
    );
};
