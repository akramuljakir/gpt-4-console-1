//src\app\models\page.tsx

"use client"

import HighlightSearch from '@/lib/HighlightSearch';
import { useState, useEffect } from 'react';
import availableModels from '@/lib/AiModelName'; // Import the models
import { searchModels } from '@/lib/ModelSearch';

export default function ModelSelectionPage() {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [lastSelectedModel, setLastSelectedModel] = useState<string | null>(null); // Track last selected model

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

    // Navigate back to the homepage without selecting a model
    const handleNavigateHome = () => {
        window.location.href = '/';
    };

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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <a
                    href="/"
                    className="ml-4 text-blue-500 font-semibold hover:underline"
                >
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
                        Organization: {availableModels.find(model => model.model_string_for_api === selectedModel)?.organization || 'N/A'}<br />
                        API String: {selectedModel}
                    </p>
                </div>
            )}

            {/* Model List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
                    <div
                        key={model.model_string_for_api}
                        className={`p-6 border rounded-lg shadow-md bg-white ${selectedModel === model.model_string_for_api
                            ? 'border-blue-500'
                            : 'border-gray-300'
                            }`}
                    >
                        {/* Radio Button */}
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
                                <h2 className="text-lg font-bold">
                                    <HighlightSearch text={model.model_name} query={searchQuery} />
                                </h2>
                                <p className="text-sm text-gray-600">
                                    <HighlightSearch text={model.organization} query={searchQuery} />
                                </p>
                            </div>
                        </div>

                        {/* Model Details */}
                        <div className="mb-2">
                            <p>
                                <span className="font-semibold">API String: </span>
                                <HighlightSearch text={model.model_string_for_api} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Context Size: </span>
                                <HighlightSearch text={model.context_length} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Response Time: </span>
                                <HighlightSearch text={model.response_time} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Cost: </span>
                                <HighlightSearch text={model.cost} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Model Type: </span>
                                <HighlightSearch text={model.modeltype} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Description:</span>
                                <HighlightSearch text={model.description} query={searchQuery} />
                            </p>

                            <p>
                                <span className="font-semibold">Known For: </span>
                                <HighlightSearch text={model.known_for} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Specialty: </span>
                                <HighlightSearch text={model.specialty} query={searchQuery} />
                            </p>
                            <p>
                                <span className="font-semibold">Use Case Suggestions: </span>
                                <HighlightSearch text={model.use_suggestion} query={searchQuery} />
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
// Copyright 2024 Akramul Jakir