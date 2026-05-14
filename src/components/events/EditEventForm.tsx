'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { eventService } from '@/api/eventService';
import { categoryService } from '@/api/categoryService';
import { locationService } from '@/api/locationService';
import { EventResponse } from '@/types/event.types';
import { Category } from '@/types/category.types';

interface EditEventModalProps {
    isOpen: boolean;
    closeModal: () => void;
    event: EventResponse | null;
}

export default function EditEventForm({ isOpen, closeModal, event }: EditEventModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lookups
    const [categories, setCategories] = useState<Category[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    // We need to store the ISO codes for API routing, but save the names to the payload
    const [selectedCountryIso, setSelectedCountryIso] = useState('');
    const [selectedStateIso, setSelectedStateIso] = useState('');

    // Map Search State
    const [addressSearchQuery, setAddressSearchQuery] = useState('');
    const [mapResults, setMapResults] = useState<any[]>([]);
    const [isSearchingMap, setIsSearchingMap] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        startDatetime: '',
        endDatetime: '',
        venue: '',
        address: '',
        country: '',
        state: '',
        city: '',
        lat: 0,
        lon: 0,
        layoutType: '',
        tags: '', 
        typeSpecificData: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Fetch initial lookups
    useEffect(() => {
        if (isOpen) {
            categoryService.getActiveCategories().then(setCategories).catch(console.error);
            locationService.getCountries().then(setCountries).catch(console.error);
        }
    }, [isOpen]);

    // Pre-fill data when modal opens and lookup lists are ready
    useEffect(() => {
        if (event && isOpen && countries.length > 0) {
            
            // THE FIX: Adjusting for local timezone offset before slicing
            const formatForInput = (isoString?: string) => {
                if (!isoString) return '';
                const date = new Date(isoString);
                // Subtract the timezone offset (in minutes converted to milliseconds) 
                // to trick toISOString() into printing your local time
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                return localDate.toISOString().slice(0, 16);
            };

            setFormData({
                title: event.title || '',
                description: event.description || '',
                categoryId: event.categoryId || '',
                startDatetime: formatForInput(event.startDateTime),
                endDatetime: formatForInput(event.endDateTime),
                venue: event.venue || '',
                address: event.address || '',
                country: event.country || '',
                state: event.state || '',
                city: event.city || '',
                lat: event.lat || 0,
                lon: event.lon || 0,
                layoutType: event.layoutType || '',
                tags: event.tags ? event.tags.join(', ') : '',
                typeSpecificData: event.typeSpecificData || '',
            });

            // Attempt to reverse-map country name to ISO code
            if (event.country) {
                const foundCountry = countries.find(c => (c.name || c.label || c.country) === event.country);
                if (foundCountry) {
                    const cIso = foundCountry.iso2 || foundCountry.isoCode || foundCountry.code;
                    setSelectedCountryIso(cIso);
                    
                    locationService.getStates(cIso).then((fetchedStates) => {
                        setStates(fetchedStates);
                        if (event.state) {
                            const foundState = fetchedStates.find((s: any) => (s.name || s.label) === event.state);
                            if (foundState) {
                                const sIso = foundState.iso2 || foundState.isoCode || foundState.code;
                                setSelectedStateIso(sIso);
                                locationService.getCities(cIso, sIso).then(setCities).catch(console.error);
                            }
                        }
                    }).catch(console.error);
                }
            }

            setImageFile(null);
            setError(null);
        }
    }, [event, isOpen, countries]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const iso = e.target.value;
        const countryObj = countries.find(c => (c.iso2 || c.isoCode || c.code) === iso);
        const countryName = countryObj ? (countryObj.name || countryObj.label || countryObj.country) : '';

        setSelectedCountryIso(iso);
        setFormData(prev => ({ ...prev, country: countryName, state: '', city: '' }));

        setStates([]);
        setCities([]);
        if (iso) {
            const fetchedStates = await locationService.getStates(iso);
            setStates(fetchedStates);
        }
    };

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const iso = e.target.value;
        const stateObj = states.find(s => (s.iso2 || s.isoCode || s.code) === iso);
        const stateName = stateObj ? (stateObj.name || stateObj.label) : '';

        setSelectedStateIso(iso);
        setFormData(prev => ({ ...prev, state: stateName, city: '' }));

        setCities([]);
        if (selectedCountryIso && iso) {
            const fetchedCities = await locationService.getCities(selectedCountryIso, iso);
            setCities(fetchedCities);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, city: e.target.value }));
    };

    // OpenStreetMap Address Search
    const handleAddressSearch = async () => {
        if (!addressSearchQuery) return;
        setIsSearchingMap(true);
        try {
            const results = await locationService.searchAddress(addressSearchQuery);
            setMapResults(results);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearchingMap(false);
        }
    };

    const selectMapResult = (result: any) => {
        setFormData(prev => ({
            ...prev,
            address: result.display_name,
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon)
        }));
        setMapResults([]);
        setAddressSearchQuery('');
    };

    const handleSave = async () => {
        if (!event) return;
        setIsLoading(true);
        setError(null);

        try {
            // Also ensuring the dates get converted back strictly to valid ISO formats upon saving
            const payload = {
                ...formData,
                startDateTime: formData.startDatetime ? new Date(formData.startDatetime).toISOString() : '',
                endDateTime: formData.endDatetime ? new Date(formData.endDatetime).toISOString() : '',
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                ...(imageFile && { image: imageFile }),
            };

            await eventService.updateEvent(event.id, payload);
            closeModal();
            window.location.reload();
        } catch (err: any) {
            setError(err.message || "Failed to update event details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[900px] m-4">
            <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">

                <div className="px-2 pr-14 mb-6">
                    <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Event</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update comprehensive event details.</p>
                </div>

                <div className="custom-scrollbar overflow-y-auto px-2 pb-3 max-h-[65vh]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        {/* Basic Info */}
                        <div className="col-span-1 sm:col-span-2"><h5 className="font-semibold text-brand-500 border-b pb-2">Basic Info</h5></div>

                        <div className="col-span-1 sm:col-span-2">
                            <Label>Event Title</Label>
                            <Input type="text" name="title" value={formData.title} onChange={handleInputChange} disabled={isLoading} />
                        </div>

                        <div className="col-span-1">
                            <Label>Category</Label>
                            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} disabled={isLoading} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                <option value="" disabled>Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <Label>Cover Image</Label>
                            <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} disabled={isLoading} className="mt-1.5 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-50 file:text-brand-700" />
                        </div>

                        <div className="col-span-1">
                            <Label>Start Date & Time</Label>
                            <Input type="datetime-local" name="startDatetime" value={formData.startDatetime} onChange={handleInputChange} disabled={isLoading} />
                        </div>

                        <div className="col-span-1">
                            <Label>End Date & Time</Label>
                            <Input type="datetime-local" name="endDatetime" value={formData.endDatetime} onChange={handleInputChange} disabled={isLoading} />
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <Label>Description</Label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                        </div>

                        {/* Location Engine */}
                        <div className="col-span-1 sm:col-span-2 mt-4"><h5 className="font-semibold text-brand-500 border-b pb-2">Location Engine</h5></div>

                        <div className="col-span-1">
                            <Label>Country</Label>
                            <select value={selectedCountryIso} onChange={handleCountryChange} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                <option value="">Select Country</option>
                                {countries.map((c, i) => (
                                    <option key={c.iso2 || c.isoCode || c.code || i} value={c.iso2 || c.isoCode || c.code} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                                        {c.name || c.label || c.country}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <Label>State</Label>
                            <select value={selectedStateIso} onChange={handleStateChange} disabled={!selectedCountryIso} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                <option value="">Select State</option>
                                {states.map((s, i) => (
                                    <option key={s.iso2 || s.isoCode || s.code || i} value={s.iso2 || s.isoCode || s.code} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                                        {s.name || s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <Label>City</Label>
                            <select name="city" value={formData.city} onChange={handleCityChange} disabled={!selectedStateIso} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                <option value="">Select City</option>
                                {cities.map((c, i) => (
                                    <option key={c.name || c.label || i} value={c.name || c.label} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900">
                                        {c.name || c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <Label>Venue Name</Label>
                            <Input type="text" name="venue" value={formData.venue} onChange={handleInputChange} placeholder="e.g. Grand Hall, Virtual, etc." />
                        </div>

                        {/* Address & Lat/Lon Picker */}
                        <div className="col-span-1 sm:col-span-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mt-2">
                            <Label>Search OpenStreetMap for Address & Coordinates</Label>
                            <div className="flex gap-2 mt-1.5 mb-3">
                                <Input type="text" value={addressSearchQuery} onChange={(e) => setAddressSearchQuery(e.target.value)} placeholder="Type address to search..." />
                                <Button onClick={handleAddressSearch} disabled={isSearchingMap || !addressSearchQuery}>
                                    {isSearchingMap ? '...' : 'Search'}
                                </Button>
                            </div>

                            {mapResults.length > 0 && (
                                <ul className="mb-4 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                                    {mapResults.map((result, idx) => (
                                        <li key={idx} onClick={() => selectMapResult(result)} className="p-2 text-sm hover:bg-brand-50 dark:hover:bg-gray-600 cursor-pointer border-b last:border-0">
                                            {result.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <Label>Full Address</Label>
                                    <Input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className="col-span-1 grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Lat</Label>
                                        <Input type="number" name="lat" value={formData.lat} onChange={handleInputChange} step={0.0000001} />
                                    </div>
                                    <div>
                                        <Label>Lon</Label>
                                        <Input type="number" name="lon" value={formData.lon} onChange={handleInputChange} step={0.0000001} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Info */}
                        <div className="col-span-1 sm:col-span-2 mt-4"><h5 className="font-semibold text-brand-500 border-b pb-2">Advanced</h5></div>

                        <div className="col-span-1">
                            <Label>Tags (Comma separated)</Label>
                            <Input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="tech, networking, global" />
                        </div>

                        {error && (
                            <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-error-50 text-error-600 text-sm font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={closeModal} disabled={isLoading}>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}