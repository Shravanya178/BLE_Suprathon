import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

export const pickAndConvertFile = async () => {
  const res = await DocumentPicker.pick();
  return await RNFS.readFile(res.uri, 'base64');
};
