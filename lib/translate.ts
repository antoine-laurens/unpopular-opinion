
import { translate } from 'google-translate-api-x';

export async function translateText(text: string, to: string = 'fr'): Promise<string> {
    try {
        const res = await translate(text, { to });
        return res.text;
    } catch (e) {
        console.error("Translation failed", e);
        return text; // Fallback to original
    }
}
