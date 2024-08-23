//src\lib\HighlightSearch.tsx
import React from 'react';

interface HighlightSearchProps {
    text: string | null | undefined;
    query: string;
    highlightColors?: string[];
}

const HighlightSearch: React.FC<HighlightSearchProps> = ({
    text = '', // Default to an empty string if text is null or undefined
    query,
    highlightColors = ['bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-pink-300']
}) => {
    if (!query) return <>{text}</>;

    // Split the search query into individual terms and create a regex for each
    const searchTerms = query.split(/\s+/).filter(Boolean);

    // Track color assignment for each search term
    const coloredTerms = searchTerms.map((term, index) => ({
        term,
        color: highlightColors[index % highlightColors.length]
    }));

    // Ensure text is a string
    const safeText = String(text);

    // Use regex to split the text and highlight terms
    const parts = safeText.split(new RegExp(`(${searchTerms.join('|')})`, 'gi'));

    return (
        <>
            {parts.map((part, index) => {
                const match = coloredTerms.find(({ term }) =>
                    new RegExp(`^${term}$`, 'i').test(part)
                );

                if (match) {
                    return (
                        <span key={index} className={match.color}>
                            {part}
                        </span>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </>
    );
};

// export default HighlightSearch;
export default React.memo(HighlightSearch);

// Copyright 2024 Akramul Jakir