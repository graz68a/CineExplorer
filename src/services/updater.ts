import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import axios from 'axios';

const REPO_OWNER = 'graz68a';
const REPO_NAME = 'CineExplorer';
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

export interface UpdateInfo {
    version: string;
    releaseNotes: string;
    downloadUrl: string;
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
        
        // Find APK asset
        const apkAsset = data.assets.find((asset: any) => asset.name.endsWith('.apk'));
        
        if (!apkAsset) {
            console.warn('No APK found in the latest release.');
            return null;
        }

        // 3. Compare versions
        // Simple comparison: if latest tag != current version (ignoring 'v' prefix)
        const cleanLatest = latestVersionTag.replace(/^v/, '');
        
        // You might want a better semver compare here, but strict string inequality works if you increment properly
        if (cleanLatest !== currentVersion && isNewer(cleanLatest, currentVersion)) {
            return {
                version: cleanLatest,
                releaseNotes: releaseNotes,
                downloadUrl: apkAsset.browser_download_url,
                available: true
            };
        }

        return {
            version: currentVersion,
            releaseNotes: '',
            downloadUrl: '',
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

export const downloadAndInstallUpdate = async (url: string, onProgress?: (progress: number) => void): Promise<void> => {
    try {
        // 1. Download File
        // We typically must use the native HTTP or Filesystem download for large files to avoid CORS/memory issues
        // But for simplicity with small APKs, we can try fetching as blob or use Filesystem.downloadFile if available in newer plugins
        // Let's use basic fetch and write for now, hoping the APK isn't massive.
        // Actually, for APKs, 'Filesystem.downloadFile' involves a different plugin in some versions. 
        // Let's fetch as blob and write.
        
        const response = await axios.get(url, {
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (onProgress) onProgress(percent);
                }
            }
        });

        const blob = response.data;
        const base64Data = await blobToBase64(blob);

        const fileName = 'update.apk';
        
        // 2. Write to Cache Directory (no permission needed usually)
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
            recursive: true
        });

        // 3. Open Intent
        await FileOpener.open({
            filePath: savedFile.uri,
            contentType: 'application/vnd.android.package-archive',
            openWithDefault: true,
        });

    } catch (error) {
        console.error('Update failed:', error);
        throw error;
    }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const result = reader.result as string;
            // Remove "data:*/*;base64," prefix
            resolve(result.split(',')[1]); 
        };
        reader.readAsDataURL(blob);
    });
};
