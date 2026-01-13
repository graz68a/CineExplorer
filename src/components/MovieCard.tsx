import React from 'react';
import type { Movie } from '../types/tmdb';
import { getImageUrl } from '../services/api';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MovieCardProps {
    movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const isPerson = movie.media_type === 'person';
    const isTV = movie.media_type === 'tv' || (!movie.title && movie.name && !isPerson);

    let detailPath = `/movie/${movie.id}`;
    if (isTV) detailPath = `/tv/${movie.id}`;
    if (isPerson) detailPath = `/person/${movie.id}`;

    // Handle different image properties
    const imagePath = isPerson ? (movie as any).profile_path : movie.poster_path;
    const title = movie.title || movie.name;
    const dateStr = movie.release_date || movie.first_air_date;

    return (
        <Link to={detailPath}>
            <motion.div
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full group"
            >
                <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 rounded-xl bg-card/10 backdrop-blur-sm border-white/5">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
                        {imagePath ? (
                            <img
                                src={getImageUrl(imagePath)}
                                alt={title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium">
                                No Image
                            </div>
                        )}

                        {!isPerson && movie.vote_average !== undefined && (
                            <div className="absolute top-3 right-3 z-10">
                                <Badge variant="secondary" className="backdrop-blur-xl bg-primary/80 text-primary-foreground border-white/10 gap-1 px-2 py-1 shadow-lg font-bold">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A'}
                                </Badge>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            {!isPerson && (
                                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1">
                                    {dateStr ? new Date(dateStr).getFullYear() : 'N/A'}
                                </p>
                            )}
                            <h4 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                                {title}
                            </h4>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </Link>
    );
};

export default MovieCard;
