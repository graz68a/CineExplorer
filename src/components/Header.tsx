import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
    search: string;
    onSearchChange: (val: string) => void;
}

const Header: React.FC<HeaderProps> = ({ search, onSearchChange }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 z-50 w-full transition-all duration-300 px-4 py-3",
            scrolled ? "bg-background/90 backdrop-blur-xl shadow-lg" : "bg-background"
        )}>
            <div className="w-full">
                <div className="flex items-center gap-3 bg-zinc-800/80 border border-cyan-500/30 rounded-xl px-4 py-3">
                    <Search className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Cerca film, serie e persone"
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-400 text-base"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
