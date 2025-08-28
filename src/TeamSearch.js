class FastTeamAutocomplete {
    constructor(teams) {
        this.teams = teams;
        this.nameIndex = this.buildNameIndex();
        this.numberIndex = this.buildNumberIndex();
    }
    
    buildNameIndex() {
        // Build an index of name tokens to team indices for faster searching
        const index = new Map();
        
        // Helper function to add to index (like defaultdict behavior)
        const addToIndex = (key, value) => {
            if (!index.has(key)) {
                index.set(key, []);
            }
            index.get(key).push(value);
        };
        
        for (let i = 0; i < this.teams.length; i++) {
            const teamName = this.teams[i].name;
            
            // Index whole name (lowercase)
            const nameLower = teamName.toLowerCase();
            addToIndex(nameLower, i);
            
            // Index individual words
            const words = nameLower.match(/\b\w+\b/g) || [];
            for (const word of words) {
                if (word.length > 1) {  // Skip single characters
                    addToIndex(word, i);
                }
            }
            
            // Index prefixes for better autocomplete (2-4 chars)
            for (const word of words) {
                if (word.length >= 2) {
                    for (let length = 2; length < Math.min(word.length + 1, 5); length++) {
                        const prefix = word.substring(0, length);
                        addToIndex(prefix, i);
                    }
                }
            }
        }
        
        return index;
    }
    
    buildNumberIndex() {
        // Build an index of number tokens to team indices
        const index = new Map();
        
        const addToIndex = (key, value) => {
            if (!index.has(key)) {
                index.set(key, []);
            }
            index.get(key).push(value);
        };
        
        for (let i = 0; i < this.teams.length; i++) {
            const teamNumber = this.teams[i].number.toString();
            const numberLower = teamNumber.toLowerCase();
            addToIndex(numberLower, i);
            
            // Index prefixes of numbers too
            for (let length = 1; length <= numberLower.length; length++) {
                const prefix = numberLower.substring(0, length);
                addToIndex(prefix, i);
            }
        }
        
        return index;
    }
    
    getCandidateIndices(query) {
        // Get candidate team indices based on indexed lookups
        const candidates = new Set();
        const queryLower = query.toLowerCase();
        
        // Direct lookups in name index
        if (this.nameIndex.has(queryLower)) {
            this.nameIndex.get(queryLower).forEach(idx => candidates.add(idx));
        }
        
        // Direct lookups in number index
        if (this.numberIndex.has(queryLower)) {
            this.numberIndex.get(queryLower).forEach(idx => candidates.add(idx));
        }
        
        // Look for partial matches in names
        const queryWords = queryLower.match(/\b\w+\b/g) || [];
        for (const word of queryWords) {
            if (this.nameIndex.has(word)) {
                this.nameIndex.get(word).forEach(idx => candidates.add(idx));
            }
            
            // Check prefixes
            for (let prefixLen = 2; prefixLen <= word.length; prefixLen++) {
                const prefix = word.substring(0, prefixLen);
                if (this.nameIndex.has(prefix)) {
                    this.nameIndex.get(prefix).forEach(idx => candidates.add(idx));
                }
            }
        }
        
        // Substring search as fallback (limited to prevent slowdown)
        if (candidates.size < 20 && queryLower.length >= 2) {
            for (const [key, indices] of this.nameIndex) {
                if (key.includes(queryLower)) {
                    indices.forEach(idx => candidates.add(idx));
                    if (candidates.size > 100) {  // Limit to prevent explosion
                        break;
                    }
                }
            }
        }
        
        return candidates;
    }
    
    calculateScore(query, teamName, teamNumber) {
        // Fast scoring function
        const queryLower = query.toLowerCase();
        const nameLower = teamName.toLowerCase();
        const numberLower = teamNumber.toString().toLowerCase();
        
        // Exact matches get highest score
        if (queryLower === nameLower || queryLower === numberLower) {
            return 1.0;
        }
        
        // Prefix matches get high score
        if (nameLower.startsWith(queryLower) || numberLower.startsWith(queryLower)) {
            return 0.9;
        }
        
        // Substring matches
        if (nameLower.includes(queryLower) || numberLower.includes(queryLower)) {
            return 0.8;
        }
        
        // Word boundary matches in names
        const nameWords = nameLower.match(/\b\w+\b/g) || [];
        for (const word of nameWords) {
            if (word.startsWith(queryLower)) {
                return 0.7;
            }
            if (word.includes(queryLower)) {
                return 0.6;
            }
        }
        
        return 0.5;  // Default score for indexed matches
    }
    
    search(query, maxResults = 5) {
        // Fast search using pre-built indices
        const startTime = performance.now();
        
        if (!query.trim()) {
            return { results: [], searchTimeMs: 0.0 };
        }
        
        // Get candidate indices using fast lookups
        const candidateIndices = this.getCandidateIndices(query.trim());
        
        // Score only the candidates
        const results = [];
        for (const idx of candidateIndices) {
            const team = this.teams[idx];
            const score = this.calculateScore(query, team.name, team.number);
            if (score >= 0.5) {  // Only include decent matches
                results.push({
                    name: team.name,
                    number: team.number,
                    score: score
                });
            }
        }
        
        // Sort by score and return top results
        results.sort((a, b) => b.score - a.score);
        
        const endTime = performance.now();
        const searchTimeMs = endTime - startTime;
        
        return {
            results: results.slice(0, maxResults),
            searchTimeMs: searchTimeMs
        };
    }
}
let autocomplete;
// Example usage function
export function createAutocomplete(teamsArray) {
    autocomplete = new FastTeamAutocomplete(teamsArray);
}

export function runSearch(query) {
    if (autocomplete == null) {
        console.log("Null autocomplete");
        return null;
    }
    const result = autocomplete.search(query);
    return result.results;
}
