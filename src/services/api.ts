import axios from 'axios';
import type { Movie, PaginatedResponse, Genre, Provider, Country, Credits, WatchRegion, WatchProvidersResponse, Person } from '../types/tmdb';

const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get settings
const getCurrentSettings = () => {
    try {
        const saved = localStorage.getItem('cineExplorerSettings');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
};

export const getCurrentRegion = () => {
    return getCurrentSettings().countryCode || 'IT';
};

export const getCurrentLanguage = () => {
    const region = getCurrentRegion();
    const map: Record<string, string> = {
        'IT': 'it-IT',
        'US': 'en-US',
        'GB': 'en-GB',
        'FR': 'fr-FR',
        'DE': 'de-DE',
        'ES': 'es-ES'
    };
    return map[region] || 'it-IT';
};

// Request interceptor to use keys and language from settings
api.interceptors.request.use((config) => {
    // Use env keys directly
    const token = ACCESS_TOKEN;

    // Always use the official TMDB Base URL
    config.baseURL = BASE_URL;

    // Set Language
    config.params = {
        ...config.params,
        language: getCurrentLanguage()
    };

    // AUTHENTICATION
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const searchContent = async (query: string, page = 1, type: 'movie' | 'tv' | 'multi' = 'movie'): Promise<PaginatedResponse<Movie>> => {
    const endpoint = type === 'multi' ? '/search/multi' : `/search/${type}`;
    const { data } = await api.get<PaginatedResponse<Movie>>(endpoint, {
        params: { query, page },
    });
    return data;
};

export const discoverContent = async (filters: any, page = 1, type: 'movie' | 'tv' = 'movie'): Promise<PaginatedResponse<Movie>> => {
    const endpoint = `/discover/${type}`;
    const { data } = await api.get<PaginatedResponse<Movie>>(endpoint, {
        params: { ...filters, page },
    });
    return data;
};

export const getGenres = async (type: 'movie' | 'tv' = 'movie'): Promise<Genre[]> => {
    const { data } = await api.get<{ genres: Genre[] }>(`/genre/${type}/list`);
    return data.genres;
};

export const getProviders = async (type: 'movie' | 'tv' = 'movie', region?: string): Promise<Provider[]> => {
    const { data } = await api.get<{ results: Provider[] }>(`/watch/providers/${type}`, {
        params: { watch_region: region || getCurrentRegion() },
    });
    return data.results;
};

export const getCountries = async (): Promise<Country[]> => {
    const { data } = await api.get<Country[]>('/configuration/countries');
    return data;
};

export const getProviderRegions = async (): Promise<Country[]> => {
    const { data } = await api.get<{ results: Country[] }>('/watch/providers/regions');
    return data.results;
};

export const getContent = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<Movie> => {
    const { data } = await api.get<Movie>(`/${type}/${id}`, {
        params: { append_to_response: 'translations' }
    });
    return data;
}

export const getContentVideos = async (id: number, type: 'movie' | 'tv' = 'movie') => {
    const { data } = await api.get<{ results: any[] }>(`/${type}/${id}/videos`);
    return data.results;
}

export const getContentCredits = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<Credits> => {
    const { data } = await api.get<Credits>(`/${type}/${id}/credits`);
    return data;
}

export const getSimilarContent = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<Movie[]> => {
    const { data } = await api.get<PaginatedResponse<Movie>>(`/${type}/${id}/similar`);
    return data.results;
}

export const getWatchProviders = async (id: number, type: 'movie' | 'tv' = 'movie'): Promise<WatchRegion | null> => {
    const { data } = await api.get<WatchProvidersResponse>(`/${type}/${id}/watch/providers`);
    return data.results[getCurrentRegion()] || null;
}

export const getPerson = async (id: number): Promise<Person> => {
    const { data } = await api.get<Person>(`/person/${id}`, {
        params: { append_to_response: 'combined_credits' }
    });
    return data;
}

export const getTvDetails = async (id: number): Promise<any> => {
    const { data } = await api.get(`/tv/${id}`);
    return data;
}

export const getTvSeasonEpisodes = async (tvId: number, seasonNumber: number): Promise<any[]> => {
    const { data } = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
    return data.episodes || [];
}

export const getPersonCreditsFiltered = async (personId: number, providerIds: number[]): Promise<Movie[]> => {
    const providers = providerIds.join('|');

    try {
        // 1. Fetch movies via Discover (this works for people)
        const moviesResponse = await api.get<PaginatedResponse<Movie>>('/discover/movie', {
            params: {
                with_cast: personId,
                with_watch_providers: providers,
                watch_region: getCurrentRegion(),
                with_watch_monetization_types: 'flatrate|free|ads|rent|buy'
            }
        });

        // 2. Fetch person's TV credits (since discover/tv doesn't support with_people/with_cast)
        const { data: personTvData } = await api.get<{ cast: any[] }>(`/person/${personId}/tv_credits`);
        const tvCredits = personTvData.cast || [];

        // 3. To maintain performance, check the top 50 most popular/recent TV shows for provider availability
        // Most actors have fewer than 50 significant TV roles.
        const relevantTv = [...tvCredits]
            .sort((a, b) => {
                const dateA = a.first_air_date || '0';
                const dateB = b.first_air_date || '0';
                return dateB.localeCompare(dateA);
            })
            .slice(0, 50);

        const tvWithProviders = await Promise.all(
            relevantTv.map(async (show) => {
                try {
                    const providersData = await getWatchProviders(show.id, 'tv');
                    if (!providersData) return null;

                    // Check if any of the flatrate, rent, or buy providers match the selected ones
                    const allAvailableProviders = [
                        ...(providersData.flatrate || []),
                        ...(providersData.rent || []),
                        ...(providersData.buy || []),
                        ...(providersData.ads || []),
                        ...(providersData.free || [])
                    ];

                    const hasProvider = allAvailableProviders.some(p => providerIds.includes(p.provider_id));
                    return hasProvider ? { ...show, media_type: 'tv' as const } : null;
                } catch (e) {
                    return null;
                }
            })
        );

        const movies = (moviesResponse.data.results || []).map(m => ({ ...m, media_type: 'movie' as const }));
        const tv = tvWithProviders.filter((t): t is Movie => t !== null);

        // Remove duplicates and combine
        const combined = [...movies, ...tv];
        return combined;
    } catch (error) {
        console.error('Error fetching filtered person credits:', error);
        return [];
    }
}

export const getTrending = async (timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> => {
    const { data } = await api.get<PaginatedResponse<Movie>>(`/trending/all/${timeWindow}`);
    return data.results;
};

// Helper to construct image URL
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};
