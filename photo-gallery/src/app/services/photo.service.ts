import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})

export class PhotoService {
  private PHOTO_STORAGE: string = 'photos';

  public photos: UserPhoto[] = [];

  constructor() { }

  public async loadSaved() {
    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];
  
    // more to come...
    // Display the photo by reading into base64 format
for (let photo of this.photos) {
  // Read each saved photo's data from the Filesystem
  const readFile = await Filesystem.readFile({
    path: photo.filepath,
    directory: Directory.Data,
  });

  // Web platform only: Load the photo as base64 data
  photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
}
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data
  });
    return {
    filepath: fileName,
    webviewPath: photo.webPath
  };
    const savedImageFile: UserPhoto = {
      filepath: "soon...",
      webviewPath: photo.webPath!
    };

    return savedImageFile;
  }
  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
  
    return await this.convertBlobToBase64(blob) as string;
  }
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async addNewToGallery() {
    // Tirar uma foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });
    // Salvar a foto e obter o caminho do arquivo
    const savedImageFile = await this.savePicture(capturedPhoto);

    // Adicionar a nova foto à matriz de fotos
    this.photos.unshift(savedImageFile);
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
