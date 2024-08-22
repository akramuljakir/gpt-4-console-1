// src/lib/Modelsearch.tsx

export const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''); // Removes all non-alphanumeric characters
};

export const searchModels = (availableModels: any[], searchQuery: string) => {


    const normalizedQueryTokens = searchQuery.toLowerCase().trim().split(/\s+/).map(normalizeString);


    // const fuzzyMatchTokens = (field: string, token: string) => {
    //     const fieldLength = field.length;
    //     const tokenLength = token.length;

    //     // Iterate over possible split points in the field string
    //     for (let i = 0; i <= fieldLength - tokenLength; i++) {
    //         const leftPart = field.slice(0, i); // Left side of the string
    //         const rightPart = field.slice(i);   // Right side of the string
    //         const combined = leftPart + token + rightPart.slice(tokenLength);

    //         // Check if the modified string matches the original field string
    //         if (combined === field) {
    //             return true;
    //         }
    //     }
    //     return false;
    // };


    const includesToken = (field: string) => {
        return normalizedQueryTokens.some(token => field.includes(token));
    };


    return availableModels.map((model) => {
        let priority = 0;

        // const normalizedModelName = normalizeString(model.model_name);
        // const normalizedOrganization = normalizeString(model.organization);
        // const normalizedAPIString = normalizeString(model.model_string_for_api); // Ensure API String is included
        // const normalizedSpecialty = normalizeString(model.specialty);
        // const normalizedResponseTime = normalizeString(model.response_time);
        // const normalizedCost = normalizeString(model.cost);
        // const normalizedDescription = normalizeString(model.description);
        // const normalizedUseSuggestion = normalizeString(model.use_suggestion);

        // Combine fields for concatenated matches
        // const combinedFields = [
        //     normalizedModelName + normalizedOrganization,
        //     normalizedModelName + normalizedAPIString, // Include API String in combinations
        //     normalizedOrganization + normalizedAPIString,
        //     normalizedModelName + normalizedSpecialty,
        //     normalizedModelName + normalizedResponseTime,
        //     normalizedModelName + normalizedCost,
        //     normalizedModelName + normalizedDescription,
        //     normalizedModelName + normalizedUseSuggestion,
        //     normalizedOrganization + normalizedSpecialty,
        //     normalizedOrganization + normalizedResponseTime,
        //     normalizedOrganization + normalizedCost,
        //     normalizedOrganization + normalizedDescription,
        //     normalizedOrganization + normalizedUseSuggestion,
        //     normalizedAPIString + normalizedSpecialty,
        //     normalizedAPIString + normalizedResponseTime,
        //     normalizedAPIString + normalizedCost,
        //     normalizedAPIString + normalizedDescription,
        //     normalizedAPIString + normalizedUseSuggestion, // Make sure API string is part of combinations
        // ];

        function generateAllCombinations(data: any) {
            // Extract 11 fields and normalize them
            const normalizedFields = [
                normalizeString(data.model_name || ""),
                normalizeString(data.organization || ""),
                normalizeString(data.specialty || ""),
                normalizeString(data.use_suggestion || ""),
                normalizeString(data.known_for || ""),
                normalizeString(data.response_time || ""),
                normalizeString(data.cost || ""),
                normalizeString(data.modeltype || ""),
                normalizeString(data.description || ""),
                normalizeString(data.model_string_for_api || ""),
                normalizeString(data.context_length?.toString() || "") // Convert context_length to string
            ];

            const combinedFields = [];

            // Generate all 121 combinations (11 * 11)
            for (let i = 0; i < normalizedFields.length; i++) {
                for (let j = 0; j < normalizedFields.length; j++) {
                    combinedFields.push(normalizedFields[i] + normalizedFields[j]);
                }
            }

            return combinedFields;
        }

        const combinedFields = generateAllCombinations(model);


        // Helper functions to check if any token starts with a field or is included in a field
        const startsWithToken = (field: string) => {
            return normalizedQueryTokens.some(token => field.startsWith(token));
        };

        const includesToken = (field: string) => {
            return normalizedQueryTokens.some(token => field.includes(token));
        };




        // // Give additional priority for matches in API string, model name, and organization
        // if (startsWithToken(normalizedModelName)) priority += 50;
        // if (startsWithToken(normalizedAPIString)) priority += 50; // Ensure API string is given priority
        // if (startsWithToken(normalizedOrganization)) priority += 40;
        // if (includesToken(normalizedModelName)) priority += 30;
        // if (includesToken(normalizedAPIString)) priority += 50; // Increased to ensure "Turbo" matches properly
        // if (includesToken(normalizedOrganization)) priority += 20;

        // Check combinations for fuzzy or partial matches

        // combinedFields.forEach((combinedFields) => {
        //     normalizedQueryTokens.forEach((token) => {
        //         // if (fuzzyMatchTokens(field, token)) priority += 50;
        //         if (includesToken(combinedFields)) priority += 20;

        //     });
        // });

        return { ...model, priority }; // Attach priority to the model
    })
        .filter((model) => model.priority > 0) // Filter out models without a match
        .sort((a, b) => b.priority - a.priority); // Sort by priority (higher first)
};
