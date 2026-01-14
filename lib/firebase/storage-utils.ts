import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './config';
import { STORAGE_PATHS } from './collections';

export const storageHelpers = {
  async uploadProductImage(
    brandId: string,
    divisionId: string,
    referenceCode: string,
    file: File,
    index: number = 0
  ): Promise<string> {
    const path = `${STORAGE_PATHS.PRODUCTS}/${brandId}/${divisionId}/${referenceCode}/${index}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async uploadBrandLogo(brandId: string, file: File): Promise<string> {
    const path = `${STORAGE_PATHS.BRANDS}/${brandId}/logo_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async uploadInvoicePDF(invoiceId: string, pdfBlob: Blob): Promise<string> {
    const path = `${STORAGE_PATHS.INVOICES}/${invoiceId}.pdf`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, pdfBlob);
    return getDownloadURL(storageRef);
  },

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  async listProductImages(
    brandId: string,
    divisionId: string,
    referenceCode: string
  ): Promise<string[]> {
    const path = `${STORAGE_PATHS.PRODUCTS}/${brandId}/${divisionId}/${referenceCode}`;
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    const urls = await Promise.all(
      result.items.map(item => getDownloadURL(item))
    );
    return urls;
  },

  extractReferenceCodeFromFilename(filename: string): string | null {
    const match = filename.match(/([A-Z]{2}\d{3})/);
    return match ? match[1] : null;
  },
};
