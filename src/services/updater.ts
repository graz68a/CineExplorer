import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import axios from 'axios';

const REPO_OWNER = 'graz68a';
const REPO_NAME = 'CineExplorer';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const GITHUB_RELEASES_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

export interface UpdateInfo {
    version: string;
    releaseNotes: string;
    releasesUrl: string;
    available: boolean;
}

export const checkForUpdate = async (): Promise<UpdateInfo | null> => {
    try {
        // 1. Get current version
        const appInfo = await App.getInfo();
        const currentVersion = appInfo.version; // e.g., "1.0.0"

        // 2. Get latest release from GitHub
        const { data } = await axios.get(GITHUB_API_URL);
        const latestVersionTag = data.tag_name; // e.g., "v1.0.1" or "1.0.1"
        const releaseNotes = data.body;

        // 3. Compare versions
        const cleanLatest = latestVersionTag.replace(/^v/, '');

        if (cleanLatest !== currentVersion && isNewer(cleanLatest, currentVersion)) {
            return {
                version: cleanLatest,
                releaseNotes: releaseNotes,
                releasesUrl: GITHUB_RELEASES_URL,
                available: true
            };
        }

        return {
            version: currentVersion,
            releaseNotes: '',
            releasesUrl: '',
            available: false
        };

    } catch (error) {
        console.error('Failed to check for updates:', error);
        return null;
    }
};

const isNewer = (latest: string, current: string): boolean => {
    const lParts = latest.split('.').map(Number);
    const cParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
        const l = lParts[i] || 0;
        const c = cParts[i] || 0;
        if (l > c) return true;
        if (l < c) return false;
    }
    return false;
}

export const openReleasesPage = async (url: string): Promise<void> => {
    try {
        await Browser.open({ url });
    } catch (error) {
        // Fallback: open in same window
        window.open(url, '_blank');
    }
};
