import React, { useEffect, useState } from 'react';
import type { FilterState, Genre, Provider, Country } from '../types/tmdb';
import { getGenres, getProviders, getCountries, getProviderRegions } from '../services/api';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Slider } from './ui/Slider';
import { Label } from './ui/Label';
import { Check, Info, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface SidebarProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, isOpen }) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [providerRegions, setProviderRegions] = useState<Country[]>([]);
    const [countrySearch, setCountrySearch] = useState('');

    useEffect(() => {
        const type = filters.contentType === 'multi' ? 'movie' : filters.contentType;
        getGenres(type).then(setGenres);
        getProviders(type).then(res => {
            const sorted = [...res];
            const raiIndex = sorted.findIndex(p => p.provider_name.toLowerCase().includes('rai'));
            if (raiIndex > -1) {
                const rai = sorted.splice(raiIndex, 1)[0];
                sorted.unshift(rai);
            }
            setProviders(sorted);
        });
        getCountries().then(data => {
            const sorted = data.sort((a, b) => a.native_name.localeCompare(b.native_name));
            const priority = ['IT', 'US'];
            const pItems: Country[] = [];
            const otherItems: Country[] = [];

            sorted.forEach(c => {
                if (priority.includes(c.iso_3166_1)) {
                    pItems.push(c);
                } else {
                    otherItems.push(c);
                }
            });
            pItems.sort((a, b) => priority.indexOf(a.iso_3166_1) - priority.indexOf(b.iso_3166_1));
            setCountries([...pItems, ...otherItems]);
        });
        getProviderRegions().then(data => {
            const sorted = data.sort((a, b) => a.english_name.localeCompare(b.english_name));
            const priority = ['IT', 'US', 'GB'];
            const pItems: Country[] = [];
            const otherItems: Country[] = [];
            sorted.forEach(c => {
                if (priority.includes(c.iso_3166_1)) {
                    pItems.push(c);
                } else {
                    otherItems.push(c);
                }
            });
            pItems.sort((a, b) => priority.indexOf(a.iso_3166_1) - priority.indexOf(b.iso_3166_1));
            setProviderRegions([...pItems, ...otherItems]);
        });
    }, [filters.contentType]);

    const toggleCountry = (iso: string) => {
        setFilters((prev) => {
            const currentSelected = prev.selectedCountries || [];
            if (currentSelected.includes(iso)) {
                return { ...prev, selectedCountries: currentSelected.filter(c => c !== iso) };
            } else {
                return { ...prev, selectedCountries: [...currentSelected, iso] };
            }
        });
    };

    const toggleGenre = (id: number, e: React.MouseEvent, forceExclude: boolean = false) => {
        e.preventDefault();
        setFilters((prev) => {
            const isSelected = prev.selectedGenres.includes(id);
            const isExcluded = prev.excludedGenres.includes(id);

            if (e.shiftKey || forceExclude) {
                if (isExcluded) {
                    return { ...prev, excludedGenres: prev.excludedGenres.filter(g => g !== id) };
                } else {
                    return {
                        ...prev,
                        excludedGenres: [...prev.excludedGenres, id],
                        selectedGenres: prev.selectedGenres.filter(g => g !== id)
                    };
                }
            } else {
                if (isSelected) {
                    return { ...prev, selectedGenres: prev.selectedGenres.filter(g => g !== id) };
                } else {
                    return {
                        ...prev,
                        selectedGenres: [...prev.selectedGenres, id],
                        excludedGenres: prev.excludedGenres.filter(g => g !== id)
                    };
                }
            }
        });
    };

    const toggleProvider = (id: number) => {
        setFilters((prev) => {
            const isSelected = prev.selectedProviders.includes(id);
            if (isSelected) {
                return { ...prev, selectedProviders: prev.selectedProviders.filter(p => p !== id) };
            } else {
                return { ...prev, selectedProviders: [...prev.selectedProviders, id] };
            }
        })
    }

    const handleYearChange = (value: number[]) => setFilters(prev => ({ ...prev, yearRange: [value[0], value[1]] }));
    const handleRatingChange = (value: number[]) => setFilters(prev => ({ ...prev, ratingRange: [value[0], value[1]] }));
    const handleRuntimeChange = (value: number[]) => setFilters(prev => ({ ...prev, runtimeRange: [value[0], value[1]] }));
    const handleVotesChange = (value: number[]) => setFilters(prev => ({ ...prev, minVotes: value[0] }));

    const content = (
        <div className="space-y-10 pb-10">
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190.24 81.52" className="w-24 mb-6">
                    <defs>
                        <linearGradient id="tmdb_logo_gradient" y1="40.76" x2="190.24" y2="40.76" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#90cea1" />
                            <stop offset="0.56" stopColor="#3cbec9" />
                            <stop offset="1" stopColor="#00b3e5" />
                        </linearGradient>
                    </defs>
                    <g id="Layer_2" data-name="Layer 2">
                        <g id="Layer_1-2" data-name="Layer 1">
                            <path fill="url(#tmdb_logo_gradient)" d="M105.67,36.06h66.9A17.67,17.67,0,0,0,190.24,18.4h0A17.67,17.67,0,0,0,172.57.73h-66.9A17.67,17.67,0,0,0,88,18.4h0A17.67,17.67,0,0,0,105.67,36.06Zm-88,45h76.9A17.67,17.67,0,0,0,112.24,63.4h0A17.67,17.67,0,0,0,94.57,45.73H17.67A17.67,17.67,0,0,0,0,63.4H0A17.67,17.67,0,0,0,17.67,81.06ZM10.41,35.42h7.8V6.92h10.1V0H.31v6.9h10.1Zm28.1,0h7.8V8.25h.1l9,27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2,23.1h-.1L50.31,0H38.51ZM152.43,55.67a15.07,15.07,0,0,0-4.52-5.52,18.57,18.57,0,0,0-6.68-3.08,33.54,33.54,0,0,0-8.07-1h-11.7v35.4h12.75a24.58,24.58,0,0,0,7.55-1.15A19.34,19.34,0,0,0,148.11,77a16.27,16.27,0,0,0,4.37-5.5,16.91,16.91,0,0,0,1.63-7.58A18.5,18.5,0,0,0,152.43,55.67ZM145,68.6A8.8,8.8,0,0,1,142.36,72a10.7,10.7,0,0,1-4,1.82,21.57,21.57,0,0,1-5,.55h-4.05v-21h4.6a17,17,0,0,1,4.67.63,11.66,11.66,0,0,1,3.88,1.87A9.14,9.14,0,0,1,145,59a9.87,9.87,0,0,1,1,4.52A11.89,11.89,0,0,1,145,68.6Zm44.63-.13a8,8,0,0,0-1.58-2.62A8.38,8.38,0,0,0,185.63,64a10.31,10.31,0,0,0-3.17-1v-.1a9.22,9.22,0,0,0,4.42-2.82,7.43,7.43,0,0,0,1.68-5,8.42,8.42,0,0,0-1.15-4.65,8.09,8.09,0,0,0-3-2.72,12.56,12.56,0,0,0-4.18-1.3,32.84,32.84,0,0,0-4.62-.33h-13.2v35.4h14.5a22.41,22.41,0,0,0,4.72-.5,13.53,13.53,0,0,0,4.28-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68A9.39,9.39,0,0,0,189.66,68.47ZM170.21,52.72h5.3a10,10,0,0,1,1.85.18,6.18,6.18,0,0,1,1.7.57,3.39,3.39,0,0,1,1.22,1.13,3.22,3.22,0,0,1,.48,1.82,3.63,3.63,0,0,1-.43,1.8,3.4,3.4,0,0,1-1.12,1.2,4.92,4.92,0,0,1-1.58.65,7.51,7.51,0,0,1-1.77.2h-5.65Zm11.72,20a3.9,3.9,0,0,1-1.22,1.3,4.64,4.64,0,0,1-1.68.7,8.18,8.18,0,0,1-1.82.2h-7v-8h5.9a15.35,15.35,0,0,1,2,.15,8.47,8.47,0,0,1,2.05.55,4,4,0,0,1,1.57,1.18,3.11,3.11,0,0,1,.63,2A3.71,3.71,0,0,1,181.93,72.72Z" />
                        </g>
                    </g>
                </svg>
            </a>
            <div className="flex items-center gap-2 text-primary">
                <Filter className="w-5 h-5" />
                <h2 className="text-xl font-bold tracking-tight">Advanced Filters</h2>
            </div>

            <section className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Content</Label>
                <div className="flex bg-muted/50 p-1 rounded-xl shadow-inner">
                    {(['movie', 'tv', 'multi'] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            className={cn(
                                "flex-1 py-1.5 text-xs font-bold transition-all rounded-lg",
                                filters.contentType === type
                                    ? "bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setFilters(prev => ({ ...prev, contentType: type }))}
                        >
                            {type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'All'}
                        </button>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sort By</Label>
                <select
                    className="w-full h-10 rounded-xl border border-white/10 bg-muted/30 px-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                    <option className="bg-zinc-950 text-white" value="vote_average.desc">Rating (Top)</option>
                    <option className="bg-zinc-950 text-white" value="popularity.desc">Popularity</option>
                    <option className="bg-zinc-950 text-white" value="primary_release_date.desc">Newest</option>
                    <option className="bg-zinc-950 text-white" value="vote_count.desc">Top Rated</option>
                </select>
            </section>

            <section className="space-y-6">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground block mb-4">Ranges</Label>

                <div className="space-y-4 px-1">
                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <Label>Year</Label>
                            <span className="text-primary font-bold">{filters.yearRange[0]} - {filters.yearRange[1]}</span>
                        </div>
                        <Slider min={1920} max={new Date().getFullYear()} step={1} value={filters.yearRange} onValueChange={handleYearChange} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <Label>Rating Range</Label>
                            <span className="text-primary font-bold">{filters.ratingRange[0]} - {filters.ratingRange[1]}</span>
                        </div>
                        <Slider min={0} max={10} step={0.5} value={filters.ratingRange} onValueChange={handleRatingChange} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <Label>Votes (min)</Label>
                            <span className="text-primary font-bold">{filters.minVotes.toLocaleString()}{filters.minVotes >= 10000 ? '+' : ''}</span>
                        </div>
                        <Slider min={0} max={10000} step={100} value={[filters.minVotes]} onValueChange={handleVotesChange} />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-xs font-medium">
                            <Label>Runtime (max)</Label>
                            <span className="text-primary font-bold">{filters.runtimeRange[1]} min</span>
                        </div>
                        <Slider min={0} max={360} step={15} value={[0, filters.runtimeRange[1]]} onValueChange={(v) => handleRuntimeChange([0, v[1]])} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Genres</Label>
                    <div className="group relative">
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-popover text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-border">
                            Long press to exclude a genre (appears in red)
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {genres.map((genre) => {
                        const isSelected = filters.selectedGenres.includes(genre.id);
                        const isExcluded = filters.excludedGenres.includes(genre.id);
                        return (
                            <Badge
                                key={genre.id}
                                variant="outline"
                                className={cn(
                                    "cursor-pointer text-[10px] py-0.5 px-2.5 rounded-full border-white/5 transition-all select-none",
                                    isSelected && "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105",
                                    isExcluded && "bg-destructive text-destructive-foreground border-destructive opacity-80"
                                )}
                                onClick={(e) => toggleGenre(genre.id, e)}
                                onContextMenu={(e) => toggleGenre(genre.id, e, true)}
                            >
                                {genre.name}
                                {isSelected && <Check className="ml-1 w-2.5 h-2.5" />}
                            </Badge>
                        )
                    })}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Production Country</Label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="text-[10px] font-black uppercase text-primary hover:text-primary/80 transition-colors"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                selectedCountries: countries.map(c => c.iso_3166_1)
                            }))}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                selectedCountries: []
                            }))}
                        >
                            None
                        </button>
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Search country..."
                    className="w-full h-9 rounded-xl border border-white/10 bg-muted/30 px-3 text-xs focus:ring-2 focus:ring-primary outline-none"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                />
                <div className="flex flex-wrap gap-1.5 max-h-80 overflow-y-auto no-scrollbar pr-2 pb-2">
                    {countries
                        .filter(c => c.native_name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            c.english_name.toLowerCase().includes(countrySearch.toLowerCase()))
                        .map((country) => {
                            const isSelected = (filters.selectedCountries || []).includes(country.iso_3166_1);
                            return (
                                <Badge
                                    key={country.iso_3166_1}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer text-[10px] py-0.5 px-2.5 rounded-full border-white/5 transition-all select-none",
                                        isSelected && "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                                    )}
                                    onClick={() => toggleCountry(country.iso_3166_1)}
                                >
                                    {country.native_name}
                                    {isSelected && <Check className="ml-1 w-2.5 h-2.5" />}
                                </Badge>
                            )
                        })}
                </div>
            </section>

            <section className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Provider Region</Label>
                <select
                    className="w-full h-10 rounded-xl border border-white/10 bg-muted/30 px-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    value={filters.providerRegion || 'IT'}
                    onChange={(e) => setFilters(prev => ({ ...prev, providerRegion: e.target.value }))}
                >
                    {providerRegions.map(region => (
                        <option key={region.iso_3166_1} value={region.iso_3166_1} className="bg-zinc-950 text-white">
                            {region.english_name}
                        </option>
                    ))}
                </select>
                <p className="text-[10px] text-muted-foreground">Select the country for streaming provider availability.</p>
            </section>

            <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Streaming</Label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="text-[10px] font-black uppercase text-primary hover:text-primary/80 transition-colors"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                selectedProviders: providers.map(p => p.provider_id)
                            }))}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setFilters(prev => ({
                                ...prev,
                                selectedProviders: []
                            }))}
                        >
                            None
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {providers.map((provider) => {
                        const isSelected = filters.selectedProviders.includes(provider.provider_id);
                        return (
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                key={provider.provider_id}
                                className={cn(
                                    "cursor-pointer rounded-xl overflow-hidden grayscale opacity-50 transition-all border-2 border-transparent",
                                    isSelected && "grayscale-0 opacity-100 border-primary scale-105 shadow-lg shadow-primary/20"
                                )}
                                onClick={() => toggleProvider(provider.provider_id)}
                                title={provider.provider_name}
                            >
                                <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt={provider.provider_name} className="w-full aspect-square object-cover" />
                            </motion.div>
                        )
                    })}
                </div>
            </section>

            <section className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nationality (Language & Streaming)</Label>
                <select
                    className="w-full h-10 rounded-xl border border-white/10 bg-muted/30 px-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    value={localStorage.getItem('cineExplorerSettings') ? JSON.parse(localStorage.getItem('cineExplorerSettings')!).countryCode || 'IT' : 'IT'}
                    onChange={(e) => {
                        const newRegion = e.target.value;
                        const currentSettings = localStorage.getItem('cineExplorerSettings')
                            ? JSON.parse(localStorage.getItem('cineExplorerSettings')!)
                            : {};

                        localStorage.setItem('cineExplorerSettings', JSON.stringify({
                            ...currentSettings,
                            countryCode: newRegion
                        }));
                        window.location.reload();
                    }}
                >
                    <option className="bg-zinc-950 text-white" value="IT">Italian 🇮🇹</option>
                    <option className="bg-zinc-950 text-white" value="US">English (US) 🇺🇸</option>
                    <option className="bg-zinc-950 text-white" value="GB">English (UK) 🇬🇧</option>
                    <option className="bg-zinc-950 text-white" value="FR">French 🇫🇷</option>
                    <option className="bg-zinc-950 text-white" value="DE">German 🇩🇪</option>
                    <option className="bg-zinc-950 text-white" value="ES">Spanish 🇪🇸</option>
                </select>
                <p className="text-[10px] text-muted-foreground">Reloads page to apply changes.</p>
            </section>

            <Button
                className="w-full rounded-2xl h-12 font-bold shadow-xl transition-all active:scale-95"
                variant="outline"
                onClick={() => setFilters({
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
                })}
            >
                Reset Filters
            </Button>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-80 h-full overflow-y-auto px-8 py-10 border-r border-white/5 bg-background/50 backdrop-blur-sm min-h-0">
                {content}
            </aside>

            {/* Mobile Sidebar implemented in MovieSearch via AnimatePresence */}
            {isOpen && (
                <div className="md:hidden w-full h-full px-6 py-10 bg-background overflow-y-auto">
                    {content}
                </div>
            )}
        </>
    );
};

export default Sidebar;
