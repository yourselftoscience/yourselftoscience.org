/**
 * Generates a shareable URL for a resource on the homepage with highlighting
 * @param {string} slug - The resource slug
 * @returns {string} - Full URL with resource parameter
 */
export function getResourceShareUrl(slug) {
    if (globalThis.window === undefined) {
        return `/?resource=${encodeURIComponent(slug)}`;
    }


    const url = new URL(globalThis.window.location.origin);
    url.searchParams.set('resource', slug);
    return url.toString();
}

/**
 * Copies text to clipboard with fallback for older browsers
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export async function copyToClipboard(text) {
    // Modern clipboard API
    if (globalThis.navigator?.clipboard && globalThis.window?.isSecureContext) {
        try {
            await globalThis.navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy with clipboard API:', err);
        }
    }

    // Fallback for older browsers
    try {
        const textArea = globalThis.document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        globalThis.document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = globalThis.document.execCommand('copy');
        textArea.remove();

        return successful;
    } catch (err) {
        console.error('Failed to copy with fallback:', err);
        return false;
    }
}
