import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ArrowLeft, Settings as SettingsIcon, Save, RefreshCcw, ShieldCheck, Globe, Database, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [tmdbApiKey, setTmdbApiKey] = useState('');
    const [tmdbAccessToken, setTmdbAccessToken] = useState('');
    const [staticIp, setStaticIp] = useState('');
    const [countryCode, setCountryCode] = useState('IT');
    const [saved, setSaved] = useState(false);

    const [showV3, setShowV3] = useState(false);
    const [showV4, setShowV4] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('cineExplorerSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setTmdbApiKey(parsed.tmdbApiKey || '');
                setTmdbAccessToken(parsed.tmdbAccessToken || '');
                setStaticIp(parsed.staticIp || '');
                setCountryCode(parsed.countryCode || 'IT');
            } catch (e) {
                console.error('Error loading settings', e);
            }
        }
    }, []);

    const handleSave = () => {
        const settings = {
            tmdbApiKey,
            tmdbAccessToken,
            staticIp,
            countryCode
        };
        localStorage.setItem('cineExplorerSettings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset settings to default values?')) {
            setTmdbApiKey('');
            setTmdbAccessToken('');
            setTmdbAccessToken('');
            setStaticIp('');
            setCountryCode('IT');
            localStorage.removeItem('cineExplorerSettings');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-white/10">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1 rounded-md">
                            <SettingsIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-sm tracking-tight uppercase">Settings</span>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            <main className="container mx-auto px-6 pt-24 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Configuration</h1>
                        <p className="text-muted-foreground text-sm">Customize API keys and network settings for CineExplorer.</p>
                    </div>

                    <div className="grid gap-8">
                        {/* TMDB Section */}
                        <section className="bg-muted/30 border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        <Database className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">The Movie Database (TMDB)</h2>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* API Read Access Token (v4) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">API Read Access Token</label>
                                        <a
                                            href="https://www.themoviedb.org/settings/api"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] flex items-center gap-1 text-primary hover:underline font-bold"
                                        >
                                            Get TMDB API key <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            type={showV4 ? "text" : "password"}
                                            placeholder="Enter your Bearer Token (v4)..."
                                            value={tmdbAccessToken}
                                            onChange={(e) => setTmdbAccessToken(e.target.value)}
                                            className="bg-background/50 border-white/10 h-12 rounded-2xl focus:ring-primary focus:border-primary pr-12 font-mono scrollbar-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowV4(!showV4)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showV4 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* API Key (v3) */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">API Key</label>
                                    <div className="relative group">
                                        <Input
                                            type={showV3 ? "text" : "password"}
                                            placeholder="Enter your API Key (v3)..."
                                            value={tmdbApiKey}
                                            onChange={(e) => setTmdbApiKey(e.target.value)}
                                            className="bg-background/50 border-white/10 h-12 rounded-2xl focus:ring-primary focus:border-primary pr-12 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowV3(!showV3)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showV3 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Region Section */}
                        <section className="bg-muted/30 border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Preferenze Regionali</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Nationality (Language & Streaming)</label>
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full bg-background/50 border border-white/10 h-12 rounded-2xl focus:ring-primary focus:border-primary px-4 font-medium appearance-none cursor-pointer outline-none transition-all hover:bg-white/5 [&>option]:bg-zinc-950 [&>option]:text-white"
                                    >
                                        <option className="bg-zinc-950 text-white" value="IT">🇮🇹 Italia (Italiano)</option>
                                        <option className="bg-zinc-950 text-white" value="US">🇺🇸 United States (English)</option>
                                        <option className="bg-zinc-950 text-white" value="GB">🇬🇧 United Kingdom (English)</option>
                                        <option className="bg-zinc-950 text-white" value="FR">🇫🇷 France (Français)</option>
                                        <option className="bg-zinc-950 text-white" value="DE">🇩🇪 Deutschland (Deutsch)</option>
                                        <option className="bg-zinc-950 text-white" value="ES">🇪🇸 España (Español)</option>
                                    </select>
                                    <p className="text-[10px] text-muted-foreground px-1 italic">
                                        Changes the language of plots/titles and displayed streaming providers.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Network Section */}
                        <section className="bg-muted/30 border border-white/5 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Network & Connectivity</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground px-1">Local Interface Address</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            placeholder="192.168.1.129"
                                            value={staticIp || '192.168.1.129'}
                                            onChange={(e) => setStaticIp(e.target.value)}
                                            className="bg-background/50 border-white/10 h-12 rounded-2xl focus:ring-primary focus:border-primary font-mono flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12 rounded-2xl shrink-0 border-white/10 hover:bg-white/5"
                                            onClick={() => {
                                                const ip = staticIp || '192.168.1.129';
                                                const fullIp = ip.startsWith('.') ? `192.168.1${ip}` : ip;
                                                const url = fullIp.startsWith('http') ? `${fullIp}:5173` : `http://${fullIp}:5173`;
                                                window.open(url, '_blank');
                                            }}
                                            title="Open interface on this IP"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground px-1 italic">
                                        Recommended address to access the app on the local network (e.g., tablet or smartphone).
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                            onClick={handleSave}
                            className="flex-1 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {saved ? 'Settings Saved!' : 'Save Settings'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="h-14 rounded-2xl px-6 border-white/10 hover:bg-white/5"
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex gap-4 items-start">
                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm italic">Security Note</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                API keys are stored exclusively in your browser via `localStorage`.
                                No data is sent to external servers except to TMDB for normal search requests.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Settings;
