import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { getContent, getImageUrl, getContentVideos, getContentCredits, getSimilarContent, getWatchProviders, getTvDetails, getTvSeasonEpisodes } from '../services/api';
import type { Movie, CastMember, WatchRegion } from '../types/tmdb';
import { Button } from './ui/Button';
import { ArrowLeft, Star, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from './ui/Badge';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import MovieCard from './MovieCard';

const MovieDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [cast, setCast] = useState<CastMember[]>([]);
    const [similar, setSimilar] = useState<Movie[]>([]);
    const [watchProviders, setWatchProviders] = useState<WatchRegion | null>(null);
    const [loading, setLoading] = useState(true);
    const [video, setVideo] = useState<string | null>(null);
    const [seasons, setSeasons] = useState<any[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [episodesLoading, setEpisodesLoading] = useState(false);

    const isTV = location.pathname.includes('/tv/');
    const contentType = isTV ? 'tv' : 'movie';

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const contentId = parseInt(id);
                const [contentData, videoData, creditData, similarData, watchData] = await Promise.all([
                    getContent(contentId, contentType),
                    getContentVideos(contentId, contentType),
                    getContentCredits(contentId, contentType),
                    getSimilarContent(contentId, contentType),
                    getWatchProviders(contentId, contentType)
                ]);

                setMovie(contentData);
                setCast(creditData.cast.slice(0, 8)); // Show top 8 cast members
                setSimilar(similarData.slice(0, 20)); // Show 20 similar content items
                setWatchProviders(watchData);

                // Fetch TV seasons if it's a TV show
                if (contentType === 'tv') {
                    try {
                        const tvData = await getTvDetails(contentId);
                        if (tvData.seasons) {
                            // Filter out specials (season 0) and sort
                            const regularSeasons = tvData.seasons.filter((s: any) => s.season_number > 0);
                            setSeasons(regularSeasons);
                            if (regularSeasons.length > 0) {
                                setSelectedSeason(regularSeasons[0].season_number);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to fetch TV details:', err);
                    }
                }

                const trailer = videoData.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
                if (trailer) {
                    setVideo(trailer.key);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        window.scrollTo(0, 0);
    }, [id]);

    // Fetch episodes when season changes (for TV shows)
    useEffect(() => {
        const fetchEpisodes = async () => {
            if (!isTV || !id || seasons.length === 0) return;
            setEpisodesLoading(true);
            try {
                const eps = await getTvSeasonEpisodes(parseInt(id), selectedSeason);
                setEpisodes(eps);
            } catch (err) {
                console.error(err);
                setEpisodes([]);
            } finally {
                setEpisodesLoading(false);
            }
        };
        fetchEpisodes();
    }, [id, selectedSeason, isTV, seasons]);

    if (loading) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
                />
                <p className="text-muted-foreground animate-pulse">Loading details...</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
                <h2 className="text-2xl font-bold">Movie not found</h2>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Backdrop Header */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
                {movie.backdrop_path ? (
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8 }}
                        src={getImageUrl(movie.backdrop_path, 'original')}
                        alt={movie.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-muted" />
                )}

                <div className="absolute top-6 left-6 z-30">
                    <Button variant="secondary" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border-white/10 transition-all hover:scale-110">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-20 pb-12">
                    <div className="container mx-auto px-6 grid md:grid-cols-[300px_1fr] gap-10">
                        <div className="hidden md:block"></div>
                        <div className="flex flex-col justify-end gap-4">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h1 className="text-4xl font-extrabold md:text-7xl text-white drop-shadow-2xl tracking-tight mb-2">
                                    {movie.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg font-medium">
                                    <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                        {movie.vote_average.toFixed(1)}
                                    </span>
                                    {(movie.release_date || movie.first_air_date) && (
                                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                                            <Calendar className="h-5 w-5" />
                                            {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                                        </span>
                                    )}
                                    {movie.popularity && (
                                        <span className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                                            Popularity: {Math.round(movie.popularity)}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4">
                {/* Details Section */}
                <div className="mb-6">
                    <div className="space-y-2">
                        <h3 className="text-base font-bold border-l-4 border-primary pl-2">Details</h3>
                        <div className="grid gap-0.5 text-xs text-muted-foreground">
                            <div className="flex justify-between border-b border-border/30 py-1">
                                <span>Title:</span>
                                <span className="font-medium text-foreground text-right max-w-[180px] truncate">{movie.title || movie.name}</span>
                            </div>
                            {(() => {
                                const italianTitle = movie.translations?.translations.find(t => t.iso_639_1 === 'it')?.data.title || movie.translations?.translations.find(t => t.iso_639_1 === 'it')?.data.name;
                                const englishTitle = movie.translations?.translations.find(t => t.iso_639_1 === 'en')?.data.title || movie.translations?.translations.find(t => t.iso_639_1 === 'en')?.data.name;
                                const mainTitle = movie.title || movie.name;

                                return (
                                    <>
                                        {italianTitle && italianTitle !== mainTitle && (
                                            <div className="flex justify-between border-b border-border/30 py-1">
                                                <span>IT:</span>
                                                <span className="font-medium text-foreground text-right italic max-w-[180px] truncate">{italianTitle}</span>
                                            </div>
                                        )}
                                        {englishTitle && englishTitle !== mainTitle && englishTitle !== italianTitle && (
                                            <div className="flex justify-between border-b border-border/30 py-1">
                                                <span>EN:</span>
                                                <span className="font-medium text-foreground text-right italic max-w-[180px] truncate">{englishTitle}</span>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                            {(movie.release_date || movie.first_air_date) && (
                                <div className="flex justify-between border-b border-border/30 py-1">
                                    <span>Year:</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-border/30 py-1">
                                <span>Lang:</span>
                                <span className="font-medium text-foreground uppercase">{movie.original_language}</span>
                            </div>
                            {(movie.production_countries?.length || movie.origin_country?.length) ? (
                                <div className="flex justify-between border-b border-border/30 py-1">
                                    <span>Country:</span>
                                    <span className="font-medium text-foreground text-right max-w-[180px] truncate">
                                        {movie.production_countries && movie.production_countries.length > 0
                                            ? movie.production_countries.map(c => c.name).join(', ')
                                            : movie.origin_country?.join(', ')}
                                    </span>
                                </div>
                            ) : null}
                            {(movie.runtime || (movie.episode_run_time && movie.episode_run_time.length > 0)) && (
                                <div className="flex justify-between border-b border-border/30 py-1">
                                    <span>Runtime:</span>
                                    <span className="font-medium text-foreground">
                                        {movie.runtime || movie.episode_run_time?.[0]} min
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between py-1">
                                <span>Votes:</span>
                                <span className="font-medium text-foreground">{movie.vote_count.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Areas */}
                    <div className="space-y-8">
                        {/* Trama */}
                        <motion.section
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-xl font-bold mb-3 tracking-tight">Overview</h2>
                            <p className="text-sm leading-relaxed text-muted-foreground/90 max-w-4xl">{movie.overview || "No overview available."}</p>

                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {movie.genres?.map((g: any) => (
                                    <Badge key={g.id} variant="secondary" className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent/50 border-0 hover:bg-accent transition-colors">
                                        {g.name}
                                    </Badge>
                                ))}
                            </div>
                        </motion.section>

                        {/* Episodes Section (TV Shows only) */}
                        {isTV && seasons.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-bold tracking-tight">Episodes</h2>

                                {/* Season Tabs - Grid Layout */}
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {seasons.map((season: any) => (
                                        <button
                                            key={season.season_number}
                                            onClick={() => setSelectedSeason(season.season_number)}
                                            className={cn(
                                                "px-2 py-1.5 rounded-lg text-xs font-bold transition-all text-center",
                                                selectedSeason === season.season_number
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-zinc-800 text-muted-foreground hover:bg-zinc-700"
                                            )}
                                        >
                                            S{season.season_number}
                                        </button>
                                    ))}
                                </div>

                                {/* Episodes List */}
                                <div className="relative">
                                    {episodesLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
                                            {episodes.map((episode: any) => (
                                                <div
                                                    key={episode.id}
                                                    className="min-w-[280px] w-[280px] flex-shrink-0 snap-start bg-zinc-900/50 rounded-xl overflow-hidden border border-white/5"
                                                >
                                                    <div className="relative aspect-video">
                                                        {episode.still_path ? (
                                                            <img
                                                                src={getImageUrl(episode.still_path, 'w500')}
                                                                alt={episode.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-muted-foreground text-xs">
                                                                No Image
                                                            </div>
                                                        )}
                                                        <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
                                                            E{episode.episode_number}
                                                        </span>
                                                        {episode.vote_average > 0 && (
                                                            <span className="absolute top-2 right-2 bg-black/70 text-yellow-500 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                                {episode.vote_average.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-3 space-y-1">
                                                        <h4 className="font-bold text-sm line-clamp-1">{episode.name}</h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {episode.runtime && `${episode.runtime}min`}{episode.runtime && episode.overview && ' - '}{episode.overview || 'No description available.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.section>
                        )}

                        {/* Streaming Providers */}
                        {watchProviders && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="bg-card/30 backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-2xl"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold tracking-tight">Available on:</h2>
                                        <div className="flex flex-wrap gap-4">
                                            {(() => {
                                                const savedFilters = localStorage.getItem('movieFilters');
                                                const selectedProviderIds = savedFilters ? JSON.parse(savedFilters).selectedProviders || [] : [];

                                                // Combine all providers (flatrate, rent, buy)
                                                const allProviders = [
                                                    ...(watchProviders.flatrate || []),
                                                    ...(watchProviders.rent || []),
                                                    ...(watchProviders.buy || [])
                                                ];

                                                // Deduplicate by provider_id
                                                const uniqueProviders = Array.from(new Map(allProviders.map(p => [p.provider_id, p])).values());

                                                // Separate selected from others
                                                const selected = uniqueProviders.filter(p => selectedProviderIds.includes(p.provider_id));

                                                if (selected.length === 0 && selectedProviderIds.length > 0) {
                                                    return <p className="text-muted-foreground italic text-sm">Not available on your selected services.</p>
                                                }
                                                const italianTitle = movie.translations?.translations.find(t => t.iso_639_1 === 'it')?.data.title || movie.translations?.translations.find(t => t.iso_639_1 === 'it')?.data.name;
                                                const englishTitle = movie.translations?.translations.find(t => t.iso_639_1 === 'en')?.data.title || movie.translations?.translations.find(t => t.iso_639_1 === 'en')?.data.name;
                                                const searchTitle = italianTitle || englishTitle || movie.title || movie.name || '';

                                                return (selected.length > 0 ? selected : uniqueProviders.slice(0, 8)).map((provider) => {
                                                    const isNetflix = provider.provider_name.toLowerCase().includes('netflix');
                                                    const isPrime = provider.provider_name.toLowerCase().includes('amazon') || provider.provider_name.toLowerCase().includes('prime video');

                                                    let href = null;
                                                    if (isNetflix) {
                                                        href = `https://www.netflix.com/search?q=${encodeURIComponent(searchTitle)}`;
                                                    } else if (isPrime) {
                                                        href = `https://www.primevideo.com/-/it/search/ref=atv_nb_sug?ie=UTF8&phrase=${encodeURIComponent(searchTitle)}`;
                                                    }

                                                    const content = (
                                                        <div key={provider.provider_id} className="group relative" title={provider.provider_name}>
                                                            <img
                                                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                                alt={provider.provider_name}
                                                                className={cn(
                                                                    "w-12 h-12 rounded-xl shadow-lg transition-transform group-hover:scale-110 ring-2 ring-white/5",
                                                                    href && "cursor-pointer group-hover:ring-primary/50"
                                                                )}
                                                            />
                                                        </div>
                                                    );

                                                    if (href) {
                                                        return (
                                                            <a key={provider.provider_id} href={href} target="_blank" rel="noopener noreferrer">
                                                                {content}
                                                            </a>
                                                        );
                                                    }

                                                    return content;
                                                });
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <a
                                            href={watchProviders.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 bg-[#FBC02D] hover:bg-[#F9A825] text-black font-black px-6 py-3 rounded-2xl shadow-xl transition-all active:scale-95 text-sm"
                                        >
                                            CHECK ON JUSTWATCH <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">Data provided by JustWatch</p>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Cast */}
                        {cast.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold tracking-tight mb-6">Top Cast</h2>
                                <div className="flex flex-wrap gap-4">
                                    {cast.map((person: CastMember) => (
                                        <Link
                                            key={person.id}
                                            to={`/person/${person.id}`}
                                            className="w-[140px] flex flex-col gap-2 group"
                                        >
                                            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted border border-white/5">
                                                {person.profile_path ? (
                                                    <img
                                                        src={getImageUrl(person.profile_path, 'w500')}
                                                        alt={person.name}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Photo</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm line-clamp-1">{person.name}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Video trailer */}
                        {video && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-3xl font-bold tracking-tight">Trailer</h2>
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-widest text-[10px] px-2">Official</Badge>
                                </div>
                                <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl border border-white/5 ring-1 ring-white/10">
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${video}?autoplay=0&rel=0&modestbranding=1`}
                                        title={`${movie.title} Trailer`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </motion.section>
                        )}

                        {/* Similar Movies */}
                        {similar.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold mb-8 tracking-tight">You might also like</h2>
                                <div className="flex flex-wrap gap-4">
                                    {similar
                                        .filter((m: Movie) => m.poster_path && m.vote_average > 0)
                                        .map((m: Movie) => (
                                            <div key={m.id} className="w-[140px]">
                                                <MovieCard movie={m} />
                                            </div>
                                        ))}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
