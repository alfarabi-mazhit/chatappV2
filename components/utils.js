import * as ImgPicker from 'react-native-image-picker';
import {nanoid} from 'nanoid';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {auth, storage} from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crypto from 'react-native-quick-crypto';
import RNFS from 'react-native-fs';
import {Alert} from 'react-native';
export async function pickImgg() {
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
export async function pickImg(userId, roomId) {
  return new Promise((resolve, reject) => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
    };
    ImgPicker.launchCamera(options, async response => {
      if (response.error || response.didCancel) {
        reject(
          new Error('User cancelled image picker or encountered an error'),
        );
      } else {
        const {uri} = response.assets[0];
        const userDirectory = `${RNFS.DocumentDirectoryPath}/users/${userId}`;
        const roomDirectory = `${userDirectory}/rooms/${roomId}`;
        if (!(await RNFS.exists(roomDirectory))) {
          await RNFS.mkdir(roomDirectory, {intermediates: true});
        }
        const fileName = nanoid();
        const filePath = `${roomDirectory}/${fileName}.jpeg`;
        resolve({filePath, fileName});
      }
    });
  });
}
export async function uploadImage(uri, path, fName) {
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
  // const fileName = fName || nanoid();
  const imageRef = ref(storage, `${path}/profilePicture.jpeg`);

  const snapshot = await uploadBytes(imageRef, blob, {
    contentType: 'image/jpeg',
  });
  blob.close();
  const url = await getDownloadURL(snapshot.ref);
  return {url};
}
export async function uploadMedia(roomId, uri, path, mediaType, fName) {
  try {
    const Data = await RNFS.readFile(uri, 'base64');
    const ArrayBuffer = Buffer.from(Data, 'base64');
    let key =
      (await AsyncStorage.getItem(
        'AESkey' + roomId.toString() + auth.currentUser.uid,
      )) || null;
    let iv =
      (await AsyncStorage.getItem(
        'AESiv' + roomId.toString() + auth.currentUser.uid,
      )) || null;
    key = Buffer.from(key, 'base64');
    iv = Buffer.from(iv, 'base64');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(ArrayBuffer),
      cipher.final(),
    ]);
    await RNFS.writeFile(
      uri + `${mediaType === 'image' ? '.jpeg' : '.mp4'}`,
      encrypted.toString('base64'),
      'base64',
    );
    const fileName = fName || nanoid();
    const mediaRef = ref(
      storage,
      `${path}/${fileName}${mediaType === 'image' ? '.jpeg' : '.mp4'}`,
    );
    // Создание объекта Blob из зашифрованного
    // const blob = new Blob([encrypted.toString('base64')], {
    //   type: mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
    // });
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
      xhr.open('GET', uri + `${mediaType === 'image' ? '.jpeg' : '.mp4'}`, true);
      xhr.send(null);
    });
    // Загрузка зашифрованного  на сервер
    const snapshot = await uploadBytes(mediaRef, blob, {
      contentType: mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
    });
    blob.close();
    const url = await getDownloadURL(snapshot.ref);
    console.log('firefire', url);
    return {url, fileName};
  } catch (error) {
    Alert.alert('', error);
  }
}
// } else {
//   const blob = await new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     xhr.onload = function () {
//       resolve(xhr.response);
//     };
//     xhr.onerror = function (e) {
//       console.log(e);
//       reject(new TypeError('Network request failed'));
//     };
//     xhr.responseType = 'blob';
//     xhr.open('GET', uri, true);
//     xhr.send(null);
//   });
//   const fileName = nanoid();
//   const mediaRef = ref(
//     storage,
//     `${path}/${fileName}${mediaType === 'image' ? '.jpeg' : '.m4a'}`,
//   );
//   const snapshot = await uploadBytes(mediaRef, blob, {
//     contentType: mediaType === 'image' ? 'image/jpeg' : 'audio/m4a',
//   });
//   blob.close();
//   const url = await getDownloadURL(snapshot.ref);
//   return {url, fileName};
// }
// }
