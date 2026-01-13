import React, { useEffect, useState } from 'react';
import { getTrending, getImageUrl } from '../services/api';
import type { Movie } from '../types/tmdb';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { Badge } from './ui/Badge';

const TrendingSection: React.FC = () => {
    const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('day');
    const [items, setItems] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTrending = async () => {
            setLoading(true);
            try {
                const data = await getTrending(timeWindow);
                setItems(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadTrending();
    }, [timeWindow]);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -500 : 500;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="mt-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-black tracking-tighter uppercase">Trending</h2>
                    <div className="flex bg-white/10 dark:bg-black/20 rounded-full p-0.5 border border-white/5 relative">
                        <div
                            className={cn(
                                "absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-primary rounded-full transition-all duration-300 shadow-lg",
                                timeWindow === 'week' ? "left-[calc(50%+1px)]" : "left-0.5"
                            )}
                        />
                        <button
                            onClick={() => setTimeWindow('day')}
                            className={cn(
                                "relative z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide transition-colors",
                                timeWindow === 'day' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setTimeWindow('week')}
                            className={cn(
                                "relative z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide transition-colors",
                                timeWindow === 'week' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Week
                        </button>
                    </div>
                </div>

                {/* Scroll Controls - Hidden on mobile, shown on larger screens */}
                <div className="hidden sm:flex gap-2">
                    <button onClick={() => scroll('left')} className="p-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Carousel */}
            <div className="relative w-full overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="min-w-[150px] h-[225px] bg-muted/20 animate-pulse rounded-xl" />
                        ))
                    ) : (
                        items.map((item, idx) => (
                            <Link
                                key={item.id}
                                to={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`}
                                className="min-w-[150px] w-[150px] group snap-start"
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="relative"
                                >
                                    <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5 bg-muted relative">
                                        {item.poster_path ? (
                                            <img
                                                src={getImageUrl(item.poster_path, 'w500')}
                                                alt={item.title || item.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                                        )}
                                        {/* Rating Badge - Same style as MovieCard */}
                                        {item.vote_average !== undefined && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <Badge variant="secondary" className="backdrop-blur-xl bg-primary/80 text-primary-foreground border-white/10 gap-1 px-2 py-1 shadow-lg font-bold text-xs">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    {typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : 'N/A'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
