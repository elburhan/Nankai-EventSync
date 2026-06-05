export const imageFileStorage = {
  async toDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('Unable to process the selected image.'));
      };

      reader.onerror = () => {
        reject(new Error('Unable to read the selected image.'));
      };

      reader.readAsDataURL(file);
    });
  },
};
