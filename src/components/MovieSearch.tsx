import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MovieCard from './MovieCard';
import TrendingSection from './TrendingSection';
import { useMovies } from '../hooks/useMovies';
import type { FilterState } from '../types/tmdb';
import { Button } from './ui/Button';
import { FilterX, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultFilters: FilterState = {
    search: '',
    selectedGenres: [],
    excludedGenres: [],
    yearRange: [1920, new Date().getFullYear()],
    ratingRange: [7, 10],
    runtimeRange: [0, 360],
    minVotes: 600,
    selectedProviders: [],
    sortBy: 'primary_release_date.desc',
    selectedCountries: [],
    contentType: 'multi',
    providerRegion: 'IT'
};

const MovieSearch: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState<FilterState>(() => {
        // First check location state (coming back from filter screen)
        if (location.state?.filters) {
            return location.state.filters;
        }
        // Then check localStorage
        const saved = localStorage.getItem('movieFilters');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...defaultFilters, ...parsed, selectedCountries: parsed.selectedCountries || [] };
            } catch (e) {
                console.error("Failed to parse filters", e);
                return defaultFilters;
            }
        }
        return defaultFilters;
    });

    // Update filters when returning from filter screen
    useEffect(() => {
        if (location.state?.filters) {
            setFilters(location.state.filters);
        }
    }, [location.state]);

    useEffect(() => {
        localStorage.setItem('movieFilters', JSON.stringify(filters));
    }, [filters]);

    const { movies, loading, error, totalPages, totalResults, page, setPage } = useMovies(filters);

    useEffect(() => {
        // Scroll to top when page changes
        const main = document.querySelector('main');
        if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    return (
        <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
            <Header
                search={filters.search}
                onSearchChange={(val) => {
                    setFilters(prev => ({ ...prev, search: val }));
                    setPage(1); // Reset to page 1 on new search
                }}
            />

            <div className="flex flex-1 pt-16 overflow-hidden">
                {/* Desktop Sidebar */}
                <Sidebar filters={filters} setFilters={setFilters} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    <div className="mb-4 flex items-center justify-between">
                        {filters.search ? (
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tighter uppercase">
                                    RESULTS FOR "{filters.search}"
                                </h2>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Found {totalResults.toLocaleString()} interesting titles
                                </p>
                            </div>
                        ) : (
                            <div className="md:hidden ml-auto">
                                {/* Spacer for mobile */}
                            </div>
                        )}
                    </div>

                    {error ? (
                        <div className="flex h-96 items-center justify-center flex-col gap-6 text-center">
                            <div className="bg-destructive/10 p-6 rounded-full">
                                <FilterX className="h-12 w-12 text-destructive" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold italic tracking-tighter uppercase text-destructive">Connection Error</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    Could not connect to TMDB. Check IP address and API keys in settings.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    className="rounded-full px-8 font-bold"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="rounded-full px-8 font-bold"
                                    onClick={() => {
                                        localStorage.removeItem('cineExplorerSettings');
                                        window.location.reload();
                                    }}
                                >
                                    Reset Settings
                                </Button>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex h-96 items-center justify-center flex-col gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full"
                            />
                            <p className="text-muted-foreground font-bold animate-pulse">Loading...</p>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="space-y-10"
                        >
                            {movies.length > 0 ? (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {movies.map((movie, idx) => (
                                        <motion.div
                                            key={movie.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <MovieCard movie={movie} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-32 text-center"
                                >
                                    <div className="bg-muted p-10 rounded-full mb-6">
                                        <FilterX className="h-16 w-16 opacity-20" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">No content found</h3>
                                    <p className="text-muted-foreground max-w-xs mb-8">Try changing filters or your search keyword.</p>
                                    <Button size="lg" className="rounded-full px-10 font-bold" onClick={() => setFilters(defaultFilters)}>Reset all</Button>
                                </motion.div>
                            )}

                            {/* Pagination */}
                            {movies.length > 0 && (
                                <div className="flex flex-col items-center gap-4 mt-8 pb-4 border-t border-white/5 pt-6">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full h-12 w-12 border border-white/10"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </Button>

                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black">{page}</span>
                                            <span className="text-muted-foreground font-bold">/ {totalPages}</span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full h-12 w-12 border border-white/10"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Selected Page</p>
                                </div>
                            )}

                            {/* Trending Section */}
                            <TrendingSection />

                            <div className="flex justify-center py-12 pb-24 opacity-80 hover:opacity-100 transition-opacity mt-8 border-t border-white/5 mx-auto max-w-4xl flex-col items-center gap-8">
                                <a href="https://gomoot.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Made by</span>
                                    <img src="gomoot.png" alt="Gomoot" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all hover:scale-105 hover:drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]" />
                                </a>

                                <div className="flex items-center gap-4">
                                    {/* X (Twitter) */}
                                    <a href="https://twitter.com/grazymen" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-white/10 hover:text-white hover:scale-110 transition-all text-muted-foreground" title="X">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                    </a>
                                    {/* WhatsApp */}
                                    <a href="https://whatsapp.com/channel/0029VaaryHXFSAsxUntrZg44" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-[#25D366]/20 hover:text-[#25D366] hover:scale-110 transition-all text-muted-foreground" title="WhatsApp">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    </a>
                                    {/* BlueSky */}
                                    <a href="https://bsky.app/profile/meneguzzo68.bsky.social" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-blue-500/20 hover:text-blue-500 hover:scale-110 transition-all text-muted-foreground" title="BlueSky">
                                        <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948" /></svg>
                                    </a>
                                    {/* Mastodon */}
                                    <a href="https://mastodon.uno/@gomoot" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-[#6364FF]/20 hover:text-[#6364FF] hover:scale-110 transition-all text-muted-foreground" title="Mastodon">
                                        <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M11.19 12.195c2.016-.24 3.77-1.475 3.99-2.603.348-1.778.32-4.339.32-4.339 0-3.47-2.286-4.488-2.286-4.488C12.062.238 10.083.017 8.027 0h-.05C5.92.017 3.942.238 2.79.765c0 0-2.285 1.017-2.285 4.488l-.002.662c-.004.64-.007 1.35.011 2.091.083 3.394.626 6.74 3.78 7.57 1.454.383 2.703.463 3.709.408 1.823-.1 2.847-.647 2.847-.647l-.06-1.317s-1.303.41-2.767.36c-1.45-.05-2.98-.156-3.215-1.928a4 4 0 0 1-.033-.496s1.424.346 3.228.428c1.103.05 2.137-.064 3.188-.189zm1.613-2.47H11.13v-4.08c0-.859-.364-1.295-1.091-1.295-.804 0-1.207.517-1.207 1.541v2.233H7.168V5.89c0-1.024-.403-1.541-1.207-1.541-.727 0-1.091.436-1.091 1.296v4.079H3.197V5.522q0-1.288.66-2.046c.456-.505 1.052-.764 1.793-.764.856 0 1.504.328 1.933.983L8 4.39l.417-.695c.429-.655 1.077-.983 1.934-.983.74 0 1.336.259 1.791.764q.662.757.661 2.046z" /></svg>
                                    </a>
                                    {/* Threads */}
                                    <a href="https://www.threads.net/@gomoot_blog" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-3 rounded-full hover:bg-white/10 hover:text-white hover:scale-110 transition-all text-muted-foreground" title="Threads">
                                        <svg viewBox="0 0 192 192" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" /></svg>
                                    </a>
                                </div>

                                <p className="text-muted-foreground/60 text-[10px] text-center max-w-md">
                                    This product uses the <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-white/20 underline-offset-2">TMDB API</a> but is not endorsed or certified by TMDB.
                                </p>
                            </div>

                        </motion.div>
                    )}
                </main>
            </div>

            {/* Mobile Floating Action Button for Filters */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/filters', { state: { filters } })}
                className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center"
            >
                <SlidersHorizontal className="w-6 h-6" />
                {(filters.selectedGenres.length + filters.excludedGenres.length + filters.selectedProviders.length + (filters.selectedCountries?.length || 0)) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {filters.selectedGenres.length + filters.excludedGenres.length + filters.selectedProviders.length + (filters.selectedCountries?.length || 0)}
                    </span>
                )}
            </motion.button>
        </div>
    );
};

export default MovieSearch;
