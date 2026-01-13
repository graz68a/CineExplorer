import React from 'react';
import type { Movie } from '../types/tmdb';
import { getImageUrl } from '../services/api';
import { Button } from './ui/Button';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
    movie: Movie;
}

const HeroSection: React.FC<HeroSectionProps> = ({ movie }) => {
    if (!movie) return null;

    const backdropUrl = getImageUrl(movie.backdrop_path, 'original');

    return (
        <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] mb-8 overflow-hidden rounded-xl shadow-2xl group mx-auto">
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3 lg:w-1/2 flex flex-col gap-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground drop-shadow-lg tracking-tight"
                >
                    {movie.title || movie.name}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-muted-foreground line-clamp-3 drop-shadow-md"
                >
                    {movie.overview}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 mt-4"
                >
                    <Link to={`/movie/${movie.id}`}>
                        <Button size="lg" className="rounded-full px-8 text-md font-semibold gap-2 transition-all hover:scale-105 shadow-primary/25 shadow-lg">
                            <Play className="w-5 h-5 fill-current" /> Dettagli
                        </Button>
                    </Link>
                    <Link to={`/movie/${movie.id}`}>
                        <Button size="lg" variant="secondary" className="rounded-full px-8 text-md font-semibold gap-2 backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                            <Info className="w-5 h-5" /> Altre info
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroSection;
