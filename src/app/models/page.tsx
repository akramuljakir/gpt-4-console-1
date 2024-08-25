"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import availableModels from '@/lib/AiModelName'; // Import the models
import { searchModels } from '@/lib/ModelSearch';

export default function ModelSelectionPage() {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [lastSelectedModel, setLastSelectedModel] = useState<string | null>(null); // Track last selected model

    // Debounce the search input to avoid blocking the UI with frequent state updates
    const debouncedSearchQuery = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
        }, 300), // Debounce for 300ms
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        debouncedSearchQuery(value);
    };

    // On component mount, check if there's a selected model in localStorage
    useEffect(() => {
        const savedModel = localStorage.getItem('selectedModel');
        if (savedModel) {
            setSelectedModel(savedModel);
        }
    }, []);

    // Save the selected model to localStorage on change
    const handleModelChange = (model: string) => {
        setLastSelectedModel(selectedModel); // Track the previously selected model
        setSelectedModel(model);
        localStorage.setItem('selectedModel', model);
    };

    // Filter models based on the search query
    const filteredModels = searchModels(availableModels, searchQuery);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Select a Model</h1>
                <p className="text-gray-600">
                    Choose the best model based on your requirements.
                </p>
            </div>

            {/* Sticky Search Bar with Home Link */}
            <div className="sticky top-0 z-10 bg-gray-100 mb-6 pb-2 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search by name, organization, or specialty..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    onChange={handleSearchChange} // Use the debounced change handler
                />
                <a href="/" className="ml-4 text-blue-500 font-semibold hover:underline">
                    Go to Homepage
                </a>
            </div>

            {/* Display the selected model at the top */}
            {selectedModel && (
                <div className="mb-6 p-4 border rounded-lg shadow-md bg-white border-blue-500">
                    <h2 className="text-lg font-bold text-blue-500">Selected Model</h2>
                    <p className="text-gray-700">You have selected:</p>
                    <p className="text-md font-semibold">{selectedModel}</p>
                    <p className="text-sm text-gray-500">
                        Organization: {availableModels.find((model) => model.model_string_for_api === selectedModel)?.organization || 'N/A'}<br />
                        API String: {selectedModel}
                    </p>
                </div>
            )}

            {/* Model List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
                    <MemoizedModel
                        key={model.model_string_for_api}
                        model={model}
                        handleModelChange={handleModelChange}
                        selectedModel={selectedModel}
                    />
                ))}
            </div>
        </div>
    );
}

// Memoized Model component to avoid unnecessary re-renders
const MemoizedModel = React.memo(({ model, handleModelChange, selectedModel }: {
    model: any;
    handleModelChange: (model: string) => void;
    selectedModel: string | null;
}) => (
    <div
        key={model.model_string_for_api}
        className={`p-6 border rounded-lg shadow-md bg-white ${selectedModel === model.model_string_for_api ? 'border-blue-500' : 'border-gray-300'
            }`}
    >
        <div className="flex items-center mb-4">
            <input
                type="radio"
                name="model"
                value={model.model_string_for_api}
                checked={selectedModel === model.model_string_for_api}
                onChange={() => handleModelChange(model.model_string_for_api)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
                <h2 className="text-lg font-bold">{model.model_name}</h2>
                <p className="text-sm text-gray-600">{model.organization}</p>
            </div>
        </div>

        {/* Model Details */}
        <div className="mb-2">
            <p>
                <span className="font-semibold">API String: </span>
                {model.model_string_for_api}
            </p>
            <p>
                <span className="font-semibold">Context Size: </span>
                {model.context_length}
            </p>
            <p>
                <span className="font-semibold">Response Time: </span>
                {model.response_time}
            </p>
            <p>
                <span className="font-semibold">Cost: </span>
                {model.cost}
            </p>
            <p>
                <span className="font-semibold">Model Type: </span>
                {model.modeltype}
            </p>
            <p>
                <span className="font-semibold">Description: </span>
                {model.description}
            </p>
            <p>
                <span className="font-semibold">Known For: </span>
                {model.known_for}
            </p>
            <p>
                <span className="font-semibold">Specialty: </span>
                {model.specialty}
            </p>
            <p>
                <span className="font-semibold">Use Case Suggestions: </span>
                {model.use_suggestion}
            </p>
        </div>
    </div>
));

// Set display name for MemoizedModel to avoid ESLint issues
MemoizedModel.displayName = 'MemoizedModel';
