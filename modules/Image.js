import urls from '../utils/urls.js';
import Is from 'strong-type';

const is = new Is();

class Image {
    constructor(productCode) {
        is.string(productCode);
        
        return this.#fetchImage(productCode);
    }

    async #fetchImage(productCode) {
        const url = urls.images.replace('${productCode}', productCode);

        console.log(`Fetching URL: `, url); // Debugging line to check the URL
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image, status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Check if the blob is an image
        if (!blob.type.startsWith('image/')) {
            throw new Error(`Fetched URL did not return an image. Returned type: ${blob.type}`);
        }
        
        this.base64Image = typeof window !== 'undefined' 
            ? await this.#convertBlobToBase64Browser(blob)
            : await this.#convertBlobToBase64Node(blob);

        return this;
    }

    #convertBlobToBase64Browser(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to convert blob to base64'));
            reader.readAsDataURL(blob);
        });
    }

    async #convertBlobToBase64Node(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = blob.type;
        return `data:${mimeType};base64,${base64}`;
    }
}

export {
    Image as default,
    Image
};