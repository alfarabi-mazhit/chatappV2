import * as ImgPicker from 'react-native-image-picker';
import {nanoid} from 'nanoid';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {storage} from '../config/firebase';

export async function pickImg() {
  return new Promise((resolve, reject) => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
    };
    ImgPicker.launchCamera(options, response => {
      if (response.error || response.didCancel) {
        reject(
          new Error('User cancelled image picker or encountered an error'),
        );
      } else {
        resolve(response);
      }
    });
  });
}

export async function uploadMedia(uri, path, mediaType) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
  const fileName = nanoid();
  const mediaRef = ref(
    storage,
    `${path}/${fileName}${mediaType === 'image' ? '.jpeg' : '.m4a'}`,
  );
  const snapshot = await uploadBytes(mediaRef, blob, {
    contentType: mediaType === 'image' ? 'image/jpeg' : 'audio/m4a',
  });
  blob.close();
  const url = await getDownloadURL(snapshot.ref);
  return {url, fileName};
}
