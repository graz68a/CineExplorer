export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    genres?: Genre[];
    popularity: number;
    original_language?: string;
    // TV specific
    name?: string;
    first_air_date?: string;
    media_type?: 'movie' | 'tv' | 'person';
    spoken_languages?: SpokenLanguage[];
    production_countries?: ProductionCountry[];
    origin_country?: string[];
    runtime?: number;
    episode_run_time?: number[];
    original_title?: string;
    original_name?: string;
    translations?: {
        translations: {
            iso_3166_1: string;
            iso_639_1: string;
            name: string;
            english_name: string;
            data: {
                title?: string;
                name?: string;
                overview?: string;
            };
        }[];
    };
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export type ContentType = 'movie' | 'tv' | 'multi';

export interface Genre {
    id: number;
    name: string;
}

export interface Provider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export interface Country {
    iso_3166_1: string;
    english_name: string;
    native_name: string;
}

export interface PaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface FilterState {
    search: string;
    selectedGenres: number[];
    excludedGenres: number[];
    yearRange: [number, number];
    ratingRange: [number, number];
    runtimeRange: [number, number];
    minVotes: number;
    selectedProviders: number[];
    sortBy: string;
    selectedCountries: string[];
    contentType: ContentType;
    providerRegion: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface Credits {
    cast: CastMember[];
}

export interface WatchProvider {
    display_priority: number;
    logo_path: string;
    provider_id: number;
    provider_name: string;
}

export interface WatchRegion {
    link: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
    ads?: WatchProvider[];
    free?: WatchProvider[];
}

export interface WatchProvidersResponse {
    id: number;
    results: {
        [key: string]: WatchRegion;
    };
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
    biography: string;
    birthday: string | null;
    place_of_birth: string | null;
    combined_credits: {
        cast: Movie[];
    };
    tv_credits?: {
        cast: Movie[];
    };
}
