import { request } from '@/utils/request';

class ImageUploader {
  static instance: any;
  post(options: any, props: any) {
    const { file ,url} = options;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_name", file.name);

    return request.post(url, {
      data: formData,
      requestType: 'form',
    });
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new ImageUploader();
    }
    return this.instance;
  }
}

const imageuploader = ImageUploader.getInstance();
export default imageuploader;