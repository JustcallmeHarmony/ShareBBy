import firestore from '@react-native-firebase/firestore';

export const userCollection = firestore().collection('users');

<<<<<<< HEAD
export function createUser({
  id,
  nickname,
  address,
  email,
  checkboxState,
  profileImage,
}) {
  return userCollection.doc(id).set({
    id,
    nickname,
    profileImage,
=======
export function createUser({id, nickname, address, email, checkboxState}) {
  return userCollection.doc(id).set({
    id,
    nickname,
>>>>>>> 0ecd275 (소셜 로그인 연결 테스트)
    email,
    address,
    checkboxState,
  });
}

export async function getUser(id) {
  const doc = await userCollection.doc(id).get();
  return doc.data();
}
