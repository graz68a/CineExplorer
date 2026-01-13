import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { FilterState, Genre, Provider, Country } from '../types/tmdb';
import { getGenres, getProviders, getCountries, getProviderRegions } from '../services/api';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Slider } from './ui/Slider';
import { Label } from './ui/Label';
import { Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

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

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = true, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-white/5 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-2.5 px-1 text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">{title}</span>
                    {badge !== undefined && badge > 0 && (
                        <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-3 px-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get initial filters from location state or localStorage
    const [filters, setFilters] = useState<FilterState>(() => {
        if (location.state?.filters) {
            return location.state.filters;
        }
        const saved = localStorage.getItem('movieFilters');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...defaultFilters, ...parsed, selectedCountries: parsed.selectedCountries || [] };
            } catch (e) {
                return defaultFilters;
            }
        }
        return defaultFilters;
    });

    const [genres, setGenres] = useState<Genre[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [providerRegions, setProviderRegions] = useState<Country[]>([]);
    const [countrySearch, setCountrySearch] = useState('');
    const [countryViewMode, setCountryViewMode] = useState<'popular' | 'all'>('popular');
    const [isRegionOpen, setIsRegionOpen] = useState(false);

    // Popular countries ISO codes (alphabetically sorted by English name)
    const POPULAR_COUNTRIES = [
        'AR', // Argentina
        'AU', // Australia
        'AT', // Austria
        'BE', // Belgium
        'BR', // Brazil
        'CA', // Canada
        'CL', // Chile
        'CN', // China
        'CO', // Colombia
        'CZ', // Czech Republic
        'DK', // Denmark
        'EG', // Egypt
        'FI', // Finland
        'FR', // France
        'DE', // Germany
        'GR', // Greece
        'HU', // Hungary
        'IS', // Iceland
        'IN', // India
        'ID', // Indonesia
        'IR', // Iran
        'IE', // Ireland
        'IL', // Israel
        'IT', // Italy
        'JP', // Japan
        'MY', // Malaysia
        'MX', // Mexico
        'MA', // Morocco
        'NL', // Netherlands
        'NZ', // New Zealand
        'NG', // Nigeria
        'NO', // Norway
        'PK', // Pakistan
        'PH', // Philippines
        'PL', // Poland
        'PT', // Portugal
        'RO', // Romania
        'RU', // Russia
        'SG', // Singapore
        'ZA', // South Africa
        'KR', // South Korea
        'ES', // Spain
        'SE', // Sweden
        'CH', // Switzerland
        'TH', // Thailand
        'TR', // Turkey
        'GB', // United Kingdom
        'US', // United States
        'VN', // Vietnam
    ];

    useEffect(() => {
        const type = filters.contentType === 'multi' ? 'movie' : filters.contentType;
        getGenres(type).then(setGenres);
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

    // Fetch providers when providerRegion changes
    useEffect(() => {
        const type = filters.contentType === 'multi' ? 'movie' : filters.contentType;
        const region = filters.providerRegion || 'IT';
        getProviders(type, region).then(res => {
            setProviders(res);
        });
    }, [filters.contentType, filters.providerRegion]);

    const toggleGenre = (id: number, exclude: boolean = false) => {
        setFilters(prev => {
            const isSelected = prev.selectedGenres.includes(id);
            const isExcluded = prev.excludedGenres.includes(id);

            if (exclude) {
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
        setFilters(prev => {
            const isSelected = prev.selectedProviders.includes(id);
            if (isSelected) {
                return { ...prev, selectedProviders: prev.selectedProviders.filter(p => p !== id) };
            } else {
                return { ...prev, selectedProviders: [...prev.selectedProviders, id] };
            }
        });
    };

    const toggleCountry = (iso: string) => {
        setFilters(prev => {
            const currentSelected = prev.selectedCountries || [];
            if (currentSelected.includes(iso)) {
                return { ...prev, selectedCountries: currentSelected.filter(c => c !== iso) };
            } else {
                return { ...prev, selectedCountries: [...currentSelected, iso] };
            }
        });
    };

    const handleApply = () => {
        localStorage.setItem('movieFilters', JSON.stringify(filters));
        navigate('/', { state: { filters } });
    };

    const handleReset = () => {
        setFilters(defaultFilters);
    };

    const activeFilterCount =
        filters.selectedGenres.length +
        filters.excludedGenres.length +
        filters.selectedProviders.length +
        (filters.selectedCountries?.length || 0);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
        >
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">Filters</h1>
                <button
                    onClick={handleReset}
                    className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-3">
                {/* Provider Region - Now at top with flag */}
                {/* Provider Region - Now at top with flag */}
                <div className="py-3 border-b border-white/5 relative z-20">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Streaming Region</Label>

                    <button
                        className="w-full h-10 rounded-lg border border-white/10 bg-muted/30 px-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                        onClick={() => setIsRegionOpen(!isRegionOpen)}
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-lg">{getFlagEmoji(filters.providerRegion || 'IT')}</span>
                            <span className="text-xs font-bold">{providerRegions.find(r => r.iso_3166_1 === (filters.providerRegion || 'IT'))?.english_name || 'Italy'}</span>
                        </span>
                        <ChevronDown className={cn("w-3 h-3 transition-transform text-muted-foreground", isRegionOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isRegionOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                className="absolute top-full left-0 right-0 mt-1 bg-[#0f1014] border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 max-h-[250px] overflow-y-auto"
                            >
                                {providerRegions.map(region => (
                                    <button
                                        key={region.iso_3166_1}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0",
                                            (filters.providerRegion || 'IT') === region.iso_3166_1 && "bg-white/5"
                                        )}
                                        onClick={() => {
                                            setFilters(prev => ({ ...prev, providerRegion: region.iso_3166_1 }));
                                            setIsRegionOpen(false);
                                        }}
                                    >
                                        <span className="text-lg">{getFlagEmoji(region.iso_3166_1)}</span>
                                        <span className="text-xs font-bold text-white tracking-wide">{region.english_name}</span>
                                        {(filters.providerRegion || 'IT') === region.iso_3166_1 && <Check className="w-3 h-3 ml-auto text-primary" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Type */}
                <div className="py-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Content Type</Label>
                    <div className="flex bg-muted/50 p-0.5 rounded-lg shadow-inner">
                        {(['movie', 'tv', 'multi'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                className={cn(
                                    "flex-1 py-2 text-xs font-bold transition-all rounded-md",
                                    filters.contentType === type
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground"
                                )}
                                onClick={() => setFilters(prev => ({ ...prev, contentType: type }))}
                            >
                                {type === 'movie' ? 'Movies' : type === 'tv' ? 'TV' : 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort By */}
                <div className="py-3 border-t border-white/5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Sort By</Label>
                    <select
                        className="w-full h-10 rounded-lg border border-white/10 bg-muted/30 px-3 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}>
                        <option value="vote_average.desc">Rating (Top)</option>
                        <option value="popularity.desc">Popularity</option>
                        <option value="primary_release_date.desc">Newest</option>
                        <option value="vote_count.desc">Top Rated</option>
                    </select>
                </div>

                {/* Collapsible Sections */}
                <CollapsibleSection title="Genres" badge={filters.selectedGenres.length + filters.excludedGenres.length}>
                    <p className="text-xs text-muted-foreground mb-3">Tap to include • Long press to exclude</p>
                    <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => {
                            const isSelected = filters.selectedGenres.includes(genre.id);
                            const isExcluded = filters.excludedGenres.includes(genre.id);
                            return (
                                <Badge
                                    key={genre.id}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer text-xs py-2 px-4 rounded-full border-white/10 transition-all select-none active:scale-95",
                                        isSelected && "bg-primary text-primary-foreground border-primary shadow-lg",
                                        isExcluded && "bg-destructive text-destructive-foreground border-destructive"
                                    )}
                                    onClick={() => toggleGenre(genre.id, false)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        toggleGenre(genre.id, true);
                                    }}
                                >
                                    {genre.name}
                                    {isSelected && <Check className="ml-1.5 w-3.5 h-3.5" />}
                                    {isExcluded && <X className="ml-1.5 w-3.5 h-3.5" />}
                                </Badge>
                            );
                        })}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Year Range" defaultOpen={false}>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span>From</span>
                            <span className="text-primary font-bold">{filters.yearRange[0]} - {filters.yearRange[1]}</span>
                        </div>
                        <Slider
                            min={1950}
                            max={new Date().getFullYear()}
                            step={1}
                            value={filters.yearRange}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, yearRange: [value[0], value[1]] }))}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Rating" defaultOpen={false}>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Range</span>
                            <span className="text-primary font-bold">{filters.ratingRange[0]} - {filters.ratingRange[1]}</span>
                        </div>
                        <Slider
                            min={0}
                            max={10}
                            step={0.5}
                            value={filters.ratingRange}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, ratingRange: [value[0], value[1]] }))}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Minimum Votes" defaultOpen={false}>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span>At least</span>
                            <span className="text-primary font-bold">{filters.minVotes.toLocaleString()}{filters.minVotes >= 10000 ? '+' : ''}</span>
                        </div>
                        <Slider
                            min={0}
                            max={10000}
                            step={100}
                            value={[filters.minVotes]}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, minVotes: value[0] }))}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Streaming" badge={filters.selectedProviders.length} defaultOpen={false}>
                    <div className="flex gap-2 mb-4">
                        <button
                            className="text-xs font-bold uppercase text-primary"
                            onClick={() => setFilters(prev => ({ ...prev, selectedProviders: providers.map(p => p.provider_id) }))}
                        >
                            Select All
                        </button>
                        <span className="text-muted-foreground">•</span>
                        <button
                            className="text-xs font-bold uppercase text-muted-foreground"
                            onClick={() => setFilters(prev => ({ ...prev, selectedProviders: [] }))}
                        >
                            Clear
                        </button>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {providers.map((provider) => {
                            const isSelected = filters.selectedProviders.includes(provider.provider_id);
                            return (
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    key={provider.provider_id}
                                    className={cn(
                                        "cursor-pointer rounded-xl overflow-hidden transition-all border-2",
                                        isSelected
                                            ? "border-primary opacity-100 shadow-lg"
                                            : "border-transparent opacity-40 grayscale"
                                    )}
                                    onClick={() => toggleProvider(provider.provider_id)}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        className="w-full aspect-square object-cover"
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Production Country" badge={filters.selectedCountries?.length || 0} defaultOpen={false}>
                    {/* Popular/All Toggle */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex bg-muted/50 p-0.5 rounded-lg">
                            <button
                                className={cn(
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                    countryViewMode === 'popular' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}
                                onClick={() => setCountryViewMode('popular')}
                            >
                                Popular
                            </button>
                            <button
                                className={cn(
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                    countryViewMode === 'all' ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}
                                onClick={() => setCountryViewMode('all')}
                            >
                                All
                            </button>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <button
                            className="text-xs font-bold uppercase text-muted-foreground"
                            onClick={() => setFilters(prev => ({ ...prev, selectedCountries: [] }))}
                        >
                            Clear
                        </button>
                    </div>
                    {countryViewMode === 'all' && (
                        <input
                            type="text"
                            placeholder="Search country..."
                            className="w-full h-10 rounded-xl border border-white/10 bg-muted/30 px-4 text-sm focus:ring-2 focus:ring-primary outline-none mb-4"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                        />
                    )}
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {countries
                            .filter(c => {
                                // In Popular mode: show popular countries + any selected countries not in popular list
                                if (countryViewMode === 'popular') {
                                    const isPopular = POPULAR_COUNTRIES.includes(c.iso_3166_1);
                                    const isSelected = (filters.selectedCountries || []).includes(c.iso_3166_1);
                                    return isPopular || isSelected;
                                }
                                // In All mode: filter by search
                                return c.native_name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                    c.english_name.toLowerCase().includes(countrySearch.toLowerCase());
                            })
                            .sort((a, b) => a.english_name.localeCompare(b.english_name))
                            .map((country) => {
                                const isSelected = (filters.selectedCountries || []).includes(country.iso_3166_1);
                                return (
                                    <Badge
                                        key={country.iso_3166_1}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer text-xs py-1.5 px-3 rounded-full border-white/10 transition-all select-none",
                                            isSelected && "bg-primary text-primary-foreground border-primary"
                                        )}
                                        onClick={() => toggleCountry(country.iso_3166_1)}
                                    >
                                        {country.english_name}
                                        {isSelected && <Check className="ml-1 w-3 h-3" />}
                                    </Badge>
                                );
                            })}
                    </div>
                </CollapsibleSection>

                {/* Spacer for bottom button */}
                <div className="h-24" />
            </div>

            {/* Sticky Apply Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
                <Button
                    className="w-full h-14 rounded-2xl font-bold text-base shadow-2xl shadow-primary/30"
                    onClick={handleApply}
                >
                    Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
            </div>
        </motion.div>
    );
};

export default FilterScreen;
