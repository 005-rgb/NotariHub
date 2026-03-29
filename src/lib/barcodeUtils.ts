import html2canvas from 'html2canvas';

/**
 * Downloads a barcode (or any element) as a PNG image.
 * @param elementId The ID of the HTML element to capture.
 * @param filename The name of the file to be downloaded.
 */
export const downloadBarcode = async (elementId: string, filename: string = 'barcode.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality for better scanning
      logging: false,
      useCORS: true,
    });
    
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to download barcode:', err);
  }
};
