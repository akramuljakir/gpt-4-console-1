// src/app/models/page.tsx

"use client"

import { useState } from 'react';
import availableModels from '@/lib/AiModelName'; // Import the models
import { searchModels, normalizeString } from '@/lib/ModelSearch';

export default function ModelSelectionPage() {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filter models based on the search query using searchModels function
    const filteredModels = searchModels(availableModels, searchQuery);

    // Handle form submission when selecting a model
    const handleSubmit = () => {
        if (selectedModel) {
            // Store the selected model in localStorage and redirect back to the chat page
            localStorage.setItem('selectedModel', selectedModel);
            window.location.href = '/'; // Redirect back to the main chat page
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Select a Model</h1>
                <p className="text-gray-600">
                    Choose the best model based on your requirements.
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by name, organization, or specialty..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

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
                                onChange={() => setSelectedModel(model.model_string_for_api)}
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
                                {model.response_time || 'Unknown'}
                            </p>
                            <p>
                                <span className="font-semibold">Cost: </span>
                                {model.cost || 'Unknown'}
                            </p>
                            <p>
                                <span className="font-semibold">Description: </span>
                                {model.description || 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">Known For: </span>
                                {model.known_for || 'N/A'}
                            </p>

                            <p>
                                <span className="font-semibold">Specialty: </span>
                                {model.specialty || 'N/A'}
                            </p>
                            <p>
                                <span className="font-semibold">Use Case Suggestions: </span>
                                {model.use_suggestion || 'General Use'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8">
                <button
                    className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 focus:outline-none"
                    onClick={handleSubmit}
                    disabled={!selectedModel}
                >
                    Select Model
                </button>
            </div>
        </div>
    );
}
