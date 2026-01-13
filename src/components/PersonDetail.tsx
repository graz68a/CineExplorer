import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPerson, getImageUrl, getPersonCreditsFiltered } from '../services/api';
import type { Person, Movie } from '../types/tmdb';
import { Button } from './ui/Button';
import { ArrowLeft, User, Filter, FilterX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';
import { cn } from '../lib/utils';

const PersonDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<Person | null>(null);
    const [filteredCredits, setFilteredCredits] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [showOnlySelected, setShowOnlySelected] = useState(false);

    const selectedProviders = useMemo(() => {
        const saved = localStorage.getItem('movieFilters');
        if (saved) {
            try {
                return JSON.parse(saved).selectedProviders || [];
            } catch (e) {
                return [];
            }
        }
        return [];
    }, []);

    useEffect(() => {
        const fetchPerson = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getPerson(parseInt(id));
                setPerson(data);

                if (selectedProviders.length > 0) {
                    setFiltering(true);
                    const filtered = await getPersonCreditsFiltered(parseInt(id), selectedProviders);
                    setFilteredCredits(filtered);
                    setShowOnlySelected(true);
                    setFiltering(false);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPerson();
        window.scrollTo(0, 0);
    }, [id, selectedProviders]);

    const allSortedCredits = useMemo(() => {
        if (!person) return [];
        return [...(person.combined_credits?.cast || [])]
            .filter((m: Movie) => m.poster_path) // Filter out items without poster
            .sort((a: Movie, b: Movie) => {
                const ratingA = a.vote_average || 0;
                const ratingB = b.vote_average || 0;
                return ratingB - ratingA;
            });
    }, [person]);

    const displayCredits = useMemo(() => {
        if (showOnlySelected) {
            // Robust check using media_type and id to avoid collisions
            const filteredKeys = new Set(filteredCredits.map(c => `${c.media_type}-${c.id}`));
            return allSortedCredits.filter((c: Movie) => filteredKeys.has(`${c.media_type}-${c.id}`));
        }
        return allSortedCredits;
    }, [showOnlySelected, filteredCredits, allSortedCredits]);

    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
                />
                <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
                <h2 className="text-2xl font-bold">Actor not found</h2>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1 rounded-md">
                            <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-sm tracking-tight hidden sm:inline-block">ACTOR PROFILE</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-24">
                <div className="grid md:grid-cols-[300px_1fr] gap-12 items-start">
                    {/* Actor Profile */}
                    <div className="space-y-8 sticky top-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-muted group relative"
                        >
                            {person.profile_path ? (
                                <img
                                    src={getImageUrl(person.profile_path, 'h632' as any)}
                                    alt={person.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <User className="h-20 w-20 opacity-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h1 className="text-3xl font-black tracking-tighter leading-none mb-2">{person.name}</h1>
                                <p className="text-primary font-bold text-xs uppercase tracking-[0.2em]">{displayCredits.length} CREDITS</p>
                            </div>
                        </motion.div>

                        <div className="space-y-4 px-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Information</h3>
                            <div className="space-y-3">
                                {person.birthday && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Date of Birth</span>
                                        <span className="font-medium">{new Date(person.birthday).toLocaleDateString((window.navigator.language || 'en-US'), { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                )}
                                {person.place_of_birth && (
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Place of Birth</span>
                                        <span className="font-medium">{person.place_of_birth}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Biography and Filmography */}
                    <div className="space-y-16">
                        {person.biography && (
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">Biography</h2>
                                <p className="text-lg leading-relaxed text-muted-foreground/80 line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                                    {person.biography}
                                </p>
                            </section>
                        )}

                        <section className="space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
                                <h2 className="text-3xl font-black tracking-tighter uppercase">Filmography</h2>

                                {selectedProviders.length > 0 && (
                                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-white/5">
                                        <Button
                                            variant={showOnlySelected ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setShowOnlySelected(true)}
                                            className={cn("rounded-full px-4 font-bold text-[10px] uppercase tracking-widest h-8", filtering && "animate-pulse")}
                                            disabled={filtering}
                                        >
                                            <Filter className="w-3 h-3 mr-2" /> My Services
                                        </Button>
                                        <Button
                                            variant={!showOnlySelected ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setShowOnlySelected(false)}
                                            className="rounded-full px-4 font-bold text-[10px] uppercase tracking-widest h-8"
                                        >
                                            <FilterX className="w-3 h-3 mr-2" /> All
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="relative min-h-[400px]">
                                <AnimatePresence mode="wait">
                                    {filtering ? (
                                        <motion.div
                                            key="filtering"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        </motion.div>
                                    ) : displayCredits.length > 0 ? (
                                        <motion.div
                                            key="grid"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6"
                                        >
                                            {displayCredits.map((movie: Movie, idx: number) => (
                                                <motion.div
                                                    key={`${movie.id}-${movie.media_type}`}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                                                >
                                                    <MovieCard movie={movie as Movie} />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-20 text-center"
                                        >
                                            <FilterX className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                            <p className="text-muted-foreground font-medium">No titles found on your services.</p>
                                            <Button variant="link" onClick={() => setShowOnlySelected(false)}>Show all filmography</Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PersonDetail;
