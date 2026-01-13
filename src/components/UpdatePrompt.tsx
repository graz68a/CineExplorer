import React, { useEffect, useState } from 'react';
import { checkForUpdate, downloadAndInstallUpdate, type UpdateInfo } from '../services/updater';
import { Button } from './ui/Button';
import { Download, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdatePrompt: React.FC = () => {
    const [update, setUpdate] = useState<UpdateInfo | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const check = async () => {
            // Only check in production/device mode usually, but allowed here for testing
            // if (import.meta.env.DEV) return; 

            const info = await checkForUpdate();
            if (info && info.available) {
                setUpdate(info);
                setShow(true);
            }
        };

        // Check after a short delay to not block startup
        const timer = setTimeout(check, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleUpdate = async () => {
        if (!update) return;
        setDownloading(true);
        try {
            await downloadAndInstallUpdate(update.downloadUrl, (pct) => {
                setProgress(pct);
            });
            // After successful open, we can close (or keep open if user cancels intent)
            setDownloading(false);
            setShow(false);
        } catch (e) {
            console.error(e);
            alert('Update failed. Please try again later.');
            setDownloading(false);
        }
    };

    if (!show || !update) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 relative overflow-hidden"
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Gift className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-3 rounded-full">
                                <Download className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">New Update Available</h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Version {update.version}</p>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-xl p-4 max-h-40 overflow-y-auto text-sm text-muted-foreground border border-white/5 mt-4">
                            <p className="whitespace-pre-wrap">{update.releaseNotes || 'Bug fixes and performance improvements.'}</p>
                        </div>
                    </div>

                    {downloading ? (
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Downloading {progress}%</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => setShow(false)} className="w-full">
                                Later
                            </Button>
                            <Button onClick={handleUpdate} className="w-full gap-2">
                                <Download className="w-4 h-4" /> Update
                            </Button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
