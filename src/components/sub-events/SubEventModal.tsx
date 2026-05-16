import React, { useState, useEffect } from 'react';
import {
    X,
    UploadCloud,
    Loader2,
    Type,
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    Settings
} from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
import { SubEvent } from '@/types/event.types';
import { eventService } from '@/api/eventService';

interface SubEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    existingSubEvent?: SubEvent | null;
    onSuccess: () => void;
}

export default function SubEventModal({ isOpen, onClose, eventId, existingSubEvent, onSuccess }: SubEventModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Alert State
    const [alertConfig, setAlertConfig] = useState<{
        id: number;
        variant: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    } | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [roomOrLocation, setRoomOrLocation] = useState('');
    const [capacityLimit, setCapacityLimit] = useState<number | ''>('');
    const [rulesConfig, setRulesConfig] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const showAlert = (variant: 'success' | 'error', title: string, message: string) => {
        setAlertConfig({ id: Date.now(), variant, title, message });
    };

    // Populate form if editing & Reset states on open
    useEffect(() => {
        if (existingSubEvent && isOpen) {
            setTitle(existingSubEvent.title || '');
            setDescription(existingSubEvent.description || '');
            setRoomOrLocation(existingSubEvent.roomOrLocation || '');
            setCapacityLimit(existingSubEvent.capacityLimit || '');
            setRulesConfig(existingSubEvent.rulesConfig || '');

            // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
            const formatForInput = (dateStr: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            };

            setStartTime(formatForInput(existingSubEvent.startTime));
            setEndTime(formatForInput(existingSubEvent.endTime));
            setImagePreview(existingSubEvent.imageUrl || null);
            setImageFile(null);
        } else if (isOpen) {
            // Reset form for new addition
            setTitle('');
            setDescription('');
            setStartTime('');
            setEndTime('');
            setRoomOrLocation('');
            setCapacityLimit('');
            setRulesConfig('');
            setImageFile(null);
            setImagePreview(null);
        }
        
        // Ensure UI states are reset every time the modal opens
        if (isOpen) {
            setAlertConfig(null);
            setIsLoading(false);
        }
    }, [existingSubEvent, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlertConfig(null);
        setIsLoading(true);

        try {
            const formatForJava = (timeStr: string) => {
                if (!timeStr) return timeStr;
                return timeStr.length === 16 ? `${timeStr}:00` : timeStr;
            };

            const payload = {
                title,
                description,
                startTime: formatForJava(startTime), // Sends "YYYY-MM-DDTHH:mm:ss" without the 'Z'
                endTime: formatForJava(endTime),
                image: imageFile,
                roomOrLocation: roomOrLocation || undefined,
                capacityLimit: capacityLimit !== '' ? Number(capacityLimit) : undefined,
                rulesConfig: rulesConfig || undefined,
            };

            if (existingSubEvent) {
                await eventService.updateSubEvent(eventId, existingSubEvent.id, payload);
                showAlert('success', 'Updated!', 'Sub-event updated successfully.');
            } else {
                await eventService.addSubEvent(eventId, payload);
                showAlert('success', 'Created!', 'Sub-event created successfully.');
            }

            // Optional delay to let the user see the success alert before closing
            setTimeout(() => {
                onSuccess();
                onClose();
                setIsLoading(false); // Reset loading state after modal closes
            }, 1000);

        } catch (err: any) {
            showAlert('error', 'Save Failed', err.message || 'Something went wrong while saving the sub-event.');
            setIsLoading(false); // Only set to false on error so the modal doesn't re-enable before closing on success
        }
    };

    return (
        <>
            {/* Fixed Alert Container */}
            {alertConfig && (
                <div className="fixed top-6 right-6 z-[999999] w-full max-w-sm drop-shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <Alert
                        key={alertConfig.id}
                        variant={alertConfig.variant}
                        title={alertConfig.title}
                        message={alertConfig.message}
                    />
                </div>
            )}

            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                        <h2 className="text-xl font-bold text-gray-900">
                            {existingSubEvent ? 'Edit Sub-Event' : 'Add New Sub-Event'}
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
                        <form id="sub-event-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-500 transition-colors bg-gray-50/50 relative overflow-hidden group">
                                    {imagePreview ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-gray-200">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <UploadCloud className="mx-auto h-8 w-8 text-gray-400" />
                                            <div className="text-sm text-gray-600">
                                                <span className="text-emerald-600 font-medium hover:text-emerald-500">Upload a file</span> or drag and drop
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Type className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors shadow-sm hover:border-gray-400 outline-none"
                                        placeholder="e.g., Keynote Speech"
                                    />
                                </div>
                            </div>

                            {/* Date/Times */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                                    <div className="relative overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 hover:border-gray-400 transition-colors bg-white">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Calendar className={`h-5 w-5 ${startTime ? 'text-emerald-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            type="datetime-local" required value={startTime} onChange={(e) => setStartTime(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 text-sm outline-none bg-transparent cursor-pointer relative z-20 
                                            [&::-webkit-calendar-picker-indicator]:opacity-0 
                                            [&::-webkit-calendar-picker-indicator]:absolute 
                                            [&::-webkit-calendar-picker-indicator]:inset-0 
                                            [&::-webkit-calendar-picker-indicator]:w-full 
                                            [&::-webkit-calendar-picker-indicator]:h-full 
                                            [&::-webkit-calendar-picker-indicator]:cursor-pointer
                                            text-gray-700"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
                                    <div className="relative overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 hover:border-gray-400 transition-colors bg-white">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Clock className={`h-5 w-5 ${endTime ? 'text-emerald-500' : 'text-gray-400'}`} />
                                        </div>
                                        <input
                                            type="datetime-local" required value={endTime} onChange={(e) => setEndTime(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 text-sm outline-none bg-transparent cursor-pointer relative z-20 
                                            [&::-webkit-calendar-picker-indicator]:opacity-0 
                                            [&::-webkit-calendar-picker-indicator]:absolute 
                                            [&::-webkit-calendar-picker-indicator]:inset-0 
                                            [&::-webkit-calendar-picker-indicator]:w-full 
                                            [&::-webkit-calendar-picker-indicator]:h-full 
                                            [&::-webkit-calendar-picker-indicator]:cursor-pointer
                                            text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location & Capacity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room / Location</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text" value={roomOrLocation} onChange={(e) => setRoomOrLocation(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors shadow-sm hover:border-gray-400 outline-none"
                                            placeholder="e.g., Hall A"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Limit</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number" min="0" value={capacityLimit} onChange={(e) => setCapacityLimit(e.target.value ? Number(e.target.value) : '')}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors shadow-sm hover:border-gray-400 outline-none"
                                            placeholder="e.g., 100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors shadow-sm hover:border-gray-400 outline-none resize-none"
                                        placeholder="Details about this agenda item..."
                                    />
                                </div>
                            </div>

                            {/* Rules Config */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rules / Configuration</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                                        <Settings className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        rows={2} value={rulesConfig} onChange={(e) => setRulesConfig(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors shadow-sm hover:border-gray-400 outline-none resize-none font-mono"
                                        placeholder="e.g., Standard text guidelines"
                                    />
                                </div>
                            </div> */}

                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="sub-event-form"
                            disabled={isLoading}
                            className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                existingSubEvent ? 'Update' : 'Save'
                            )}
                        </Button>
                    </div>

                </div>
            </div>
        </>
    );
}