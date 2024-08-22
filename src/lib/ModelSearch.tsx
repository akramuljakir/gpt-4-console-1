// src/lib/Modelsearch.tsx

export const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''); // Removes all non-alphanumeric characters
};

export const searchModels = (availableModels: any[], searchQuery: string) => {
    const normalizedQueryTokens = searchQuery.toLowerCase().trim().split(/\s+/).map(normalizeString);
    return availableModels
        .map((model) => {
            let priority = 0;

            const normalizedModelName = normalizeString(model.model_name);
            const normalizedOrganization = normalizeString(model.organization);
            const normalizedSpecialty = normalizeString(model.specialty || '');
            const normalizedResponseTime = normalizeString(model.response_time || '');
            const normalizedCost = normalizeString(model.cost || '');
            const normalizedDescription = normalizeString(model.description || '');
            const normalizedUseSuggestion = normalizeString(model.use_suggestion || '');

            // Combine model_name and organization for concatenated matches
            const combinedNameOrg = normalizeString(model.model_name + model.organization);

            // Helper function to check if any token starts with a field
            const startsWithToken = (field: string) => {
                return normalizedQueryTokens.some(token => field.startsWith(token));
            };

            // Helper function to check if any token is included in a field
            const includesToken = (field: string) => {
                return normalizedQueryTokens.some(token => field.includes(token));
            };

            // Priority for combined name/organization matching (e.g. "minigpt" for "GPT-4o Mini")
            if (includesToken(combinedNameOrg)) priority += 60;

            // Priority for model_name and organization
            if (startsWithToken(normalizedModelName)) priority += 50;
            if (startsWithToken(normalizedOrganization)) priority += 40;
            if (includesToken(normalizedModelName)) priority += 30;
            if (includesToken(normalizedOrganization)) priority += 20;

            // Priority for other fields (startsWith, then includes)
            if (startsWithToken(normalizedSpecialty)) priority += 15;
            if (includesToken(normalizedSpecialty)) priority += 10;
            if (startsWithToken(normalizedResponseTime)) priority += 5;
            if (includesToken(normalizedResponseTime)) priority += 3;
            if (startsWithToken(normalizedCost)) priority += 5;
            if (includesToken(normalizedCost)) priority += 3;
            if (startsWithToken(normalizedDescription)) priority += 5;
            if (includesToken(normalizedDescription)) priority += 3;
            if (startsWithToken(normalizedUseSuggestion)) priority += 5;
            if (includesToken(normalizedUseSuggestion)) priority += 3;

            return { ...model, priority }; // Attach priority to the model
        })
        .filter((model) => model.priority > 0) // Filter out models without a match
        .sort((a, b) => b.priority - a.priority); // Sort by priority (higher first)
};
