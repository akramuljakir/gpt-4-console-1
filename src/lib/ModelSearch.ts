//src/lib/ModelSearch.ts

export const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''); // Removes all non-alphanumeric characters
};

export const searchModels = (availableModels: any[], searchQuery: string) => {
    const normalizedQueryTokens = searchQuery.toLowerCase().trim().split(/\s+/).map(normalizeString);

    return availableModels.map((model) => {
        let priority = 0;
        const matchedFields = new Set(); // Keep track of fields matched by search strings
        const fieldMatchCounts: { [key: string]: number } = {}; // Keep track of how many times each field is matched

        normalizedQueryTokens.forEach((token) => {
            // Normalize fields
            const normalizedModelName = normalizeString(model.model_name);
            const normalizedModelStringForApi = normalizeString(model.model_string_for_api);
            const normalizedOrganization = normalizeString(model.organization);
            const normalizedSpecialty = normalizeString(model.specialty || '');
            const normalizedDescription = normalizeString(model.description || '');
            const normalizedUseSuggestion = normalizeString(model.use_suggestion || '');
            const normalizedKnownFor = normalizeString(model.known_for || '');
            const normalizedResponseTime = normalizeString(model.response_time || '');
            const normalizedCost = normalizeString(model.cost || '');
            const normalizedContextLength = normalizeString(model.context_length.toString());
            const normalizedModelType = normalizeString(model.modeltype || '');

            // Helper function to accumulate priority for fields
            const accumulatePriority = (field: string, basePriority: number) => {
                if (matchedFields.has(field)) {
                    // If field already matched, add reduced priority (e.g., 50%)
                    priority += basePriority * 0.5;
                } else {
                    // First time matching the field, add full priority
                    priority += basePriority;
                    matchedFields.add(field);
                }
                // Track how many times this field is matched
                fieldMatchCounts[field] = (fieldMatchCounts[field] || 0) + 1;
            };

            // Check and accumulate priorities for each field
            if (normalizedModelName.includes(token)) {
                accumulatePriority('model_name', 50);
            }
            if (normalizedModelStringForApi.includes(token)) {
                accumulatePriority('model_string_for_api', 50);
            }
            if (normalizedOrganization.includes(token)) {
                accumulatePriority('organization', 40);
            }
            if (normalizedSpecialty.includes(token)) {
                accumulatePriority('specialty', 30);
            }
            if (normalizedDescription.includes(token)) {
                accumulatePriority('description', 30);
            }
            if (normalizedUseSuggestion.includes(token)) {
                accumulatePriority('use_suggestion', 25);
            }
            if (normalizedKnownFor.includes(token)) {
                accumulatePriority('known_for', 20);
            }
            if (normalizedModelType.includes(token)) {
                accumulatePriority('modeltype', 15);
            }
            if (normalizedResponseTime.includes(token)) {
                accumulatePriority('response_time', 10);
            }
            if (normalizedCost.includes(token)) {
                accumulatePriority('cost', 10);
            }
            if (normalizedContextLength.includes(token)) {
                accumulatePriority('context_length', 5);
            }
        });

        return { ...model, priority }; // Return the model with its calculated priority
    })
        .filter((model) => model.priority > 0) // Filter out models with no priority
        .sort((a, b) => b.priority - a.priority); // Sort models by priority in descending order
};
