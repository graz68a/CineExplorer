import { useState, useEffect, useCallback, useRef } from 'react';
import type { Movie, FilterState } from '../types/tmdb';
import * as api from '../services/api';
import { useDebounce } from './useDebounce';

export function useMovies(filters: FilterState) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);

    // Store all search results for client-side filtering/sorting
    const [fullSearchResults, setFullSearchResults] = useState<Movie[]>([]);
    // Track the last search term to know when to re-fetch
    const lastSearchTerm = useRef('');

    // Debounce the search query
    const debouncedSearch = useDebounce(filters.search, 500);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const {
                selectedGenres,
                excludedGenres,
                yearRange,
                ratingRange,
                runtimeRange,
                minVotes,
                selectedProviders,
                sortBy,
                selectedCountries,
                contentType
            } = filters;

            if (debouncedSearch) {
                // SEARCH MODE
                // If search term changed, fetch ALL candidates (up to 20 pages)
                let allCandidates = fullSearchResults;

                if (debouncedSearch !== lastSearchTerm.current) {
                    lastSearchTerm.current = debouncedSearch;
                    allCandidates = [];

                    // Fetch first page to get total pages
                    const firstPage = await api.searchContent(debouncedSearch, 1, contentType);
                    if (firstPage && firstPage.results) {
                        allCandidates = [...firstPage.results];
                        const maxPages = Math.min(firstPage.total_pages, 20); // Limit to 20 pages max

                        // Fetch remaining pages in parallel chunks
                        const promises = [];
                        for (let p = 2; p <= maxPages; p++) {
                            promises.push(api.searchContent(debouncedSearch, p, contentType));
                        }

                        const responses = await Promise.all(promises);
                        responses.forEach(res => {
                            if (res && res.results) {
                                allCandidates = [...allCandidates, ...res.results];
                            }
                        });

                        // Remove duplicates (just in case)
                        const uniqueKeys = new Set();
                        allCandidates = allCandidates.filter(m => {
                            const key = `${m.media_type}-${m.id}`;
                            if (uniqueKeys.has(key)) return false;
                            uniqueKeys.add(key);
                            return true;
                        });

                        setFullSearchResults(allCandidates);
                    }
                }

                // Apply Filters on allCandidates
                let filtered = allCandidates.filter(media => {
                    const isPerson = media.media_type === 'person';

                    // Filter out items without images
                    const imagePath = isPerson ? (media as any).profile_path : media.poster_path;
                    if (!imagePath) return false;

                    // Allow people in search results (don't return false)

                    const dateStr = media.release_date || media.first_air_date;
                    const year = dateStr ? new Date(dateStr).getFullYear() : null;
                    const rating = media.vote_average ?? 0;
                    const votes = media.vote_count ?? 0;
                    const genreIds = media.genre_ids || [];

                    // 1. Year
                    if (yearRange && !isPerson) {
                        if (year) {
                            if (year < yearRange[0] || year > yearRange[1]) return false;
                        } else if (!year) {
                            // Strict: No year = filter out if range is set? 
                            // Let's hide items without year if we are strictly filtering years.
                            // Actually user complained about old stuff showing, so hide if no date.
                            return false;
                        }
                    }

                    // 2. Rating
                    if (ratingRange && !isPerson) {
                        if (rating < ratingRange[0] || rating > ratingRange[1]) return false;
                    }

                    // 3. Votes
                    if (minVotes > 0 && !isPerson) {
                        if (votes < minVotes) return false;
                    }

                    // 4. Genres
                    if (selectedGenres.length > 0) {
                        const hasAll = selectedGenres.every(id => genreIds.includes(id));
                        if (!hasAll) return false;
                    }

                    if (excludedGenres.length > 0) {
                        const hasAnyExcluded = excludedGenres.some(id => genreIds.includes(id));
                        if (hasAnyExcluded) return false;
                    }

                    // 5. Providers / Countries (Complex to filter client side without full details, skip for now or strict?)
                    // Discover Mode handles these well. Search API doesn't return providers.
                    // We can't filter by providers here easily without fetching details for each (too heavy).
                    // So we ignore provider filters in Search Mode for now.

                    return true;
                });

                // Apply Sort
                filtered.sort((a, b) => {
                    // Always show Person results first
                    const isPersonA = a.media_type === 'person';
                    const isPersonB = b.media_type === 'person';
                    if (isPersonA && !isPersonB) return -1;
                    if (!isPersonA && isPersonB) return 1;

                    const getVal = (m: Movie, key: string) => {
                        if (key === 'vote_average') return m.vote_average || 0;
                        if (key === 'popularity') return m.popularity || 0;
                        if (key === 'primary_release_date') return new Date(m.release_date || m.first_air_date || 0).getTime();
                        if (key === 'vote_count') return m.vote_count || 0;
                        return 0;
                    };

                    const [key, dir] = sortBy.split('.');
                    const valA = getVal(a, key);
                    const valB = getVal(b, key);

                    if (dir === 'asc') return valA - valB;
                    return valB - valA;
                });

                // Update Stats
                setTotalResults(filtered.length);
                setTotalPages(Math.ceil(filtered.length / 20));

                // Paginate
                const start = (page - 1) * 20;
                const end = start + 20;
                setMovies(filtered.slice(start, end));

            } else {
                // DISCOVER MODE (Server-Side)
                // Clear search cache if any
                if (fullSearchResults.length > 0) {
                    setFullSearchResults([]);
                    lastSearchTerm.current = '';
                }

                const discoverType = contentType === 'multi' ? 'movie' : contentType;
                const apiFilters: any = {
                    sort_by: sortBy,
                    watch_region: api.getCurrentRegion(),
                };

                if (selectedGenres.length > 0) apiFilters.with_genres = selectedGenres.join(',');
                if (excludedGenres.length > 0) apiFilters.without_genres = excludedGenres.join(',');
                if (yearRange) {
                    apiFilters['primary_release_date.gte'] = `${yearRange[0]}-01-01`;
                    apiFilters['primary_release_date.lte'] = `${yearRange[1]}-12-31`;
                }
                if (ratingRange) {
                    apiFilters['vote_average.gte'] = ratingRange[0];
                    apiFilters['vote_average.lte'] = ratingRange[1];
                }
                if (runtimeRange) {
                    apiFilters['with_runtime.gte'] = runtimeRange[0];
                    apiFilters['with_runtime.lte'] = runtimeRange[1];
                }
                if (minVotes > 0) apiFilters['vote_count.gte'] = minVotes;
                if (selectedProviders.length > 0) apiFilters.with_watch_providers = selectedProviders.join('|');
                if (selectedCountries?.length > 0) apiFilters.with_origin_country = selectedCountries.join('|');

                const data = await api.discoverContent(apiFilters, page, discoverType);

                if (data) {
                    setMovies(data.results);
                    setTotalPages(data.total_pages);
                    setTotalResults(data.total_results || 0);
                }
            }
        } catch (err) {
            setError('Failed to fetch movies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters, page, fullSearchResults]);

    // Reset page when filters change (except page itself)
    // Note: We need to reset page if filters change, BUT NOT if we are just paginating on same filters.
    // The current effect resets page on ANY filter change.
    // The problem is: 'fetchMovies' depends on 'page'.
    // If we change a filter, we setPage(1). This triggers re-render with page=1.
    // fetchMovies runs.

    // Logic Issue:
    // If I change 'search', useDebounce updates 'debouncedSearch'.
    // useEffect at the bottom resets page to 1.
    // fetchMovies runs with page 1.

    // If I change 'sortBy', useEffect resets page to 1.
    // fetchMovies runs with page 1.

    // If I click Next Page, setPage(2).
    // useEffect DOES NOT fire (good).
    // fetchMovies runs with page 2.

    // Seems correct.

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, filters.selectedGenres, filters.excludedGenres, filters.yearRange, filters.ratingRange, filters.runtimeRange, filters.minVotes, filters.selectedProviders, filters.sortBy, filters.selectedCountries, filters.contentType]);

    useEffect(() => {
        fetchMovies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchMovies]);

    return { movies, loading, error, totalPages, totalResults, page, setPage };
}
