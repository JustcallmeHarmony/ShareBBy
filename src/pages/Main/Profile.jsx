import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import firestore, {
  collection,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

const {width, height} = Dimensions.get('window');
const dummyProfile = [
  {
    nickname: '닉네임',
    address: 'address',
    email: 'abc1234@naver.com',
    profileImage: require('../../assets/images/potato.png'),
  },
];
const rightArrow = require('../../assets/icons/rightArrow.png');
// const getPhotos = async () => {
//   ImagePicker.openPicker({
//     width: 300,
//     height: 400,
//     multiple: false,
//   }).then(images => {
//     console.log(images);
//     Upload(images.sourceURL);
//   });
// };

const Profile = ({navigation, route}) => {
  useEffect(() => {
    callUserUid();
    callApi();
  }, []);
  const [users, setUsers] = useState();
  const [userUid, setUserUid] = useState();
  const usersCollection = firestore().collection('users');
  const callUserUid = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const userUID = user.uid;
        console.log('UUuuuiiiiiiiidddddd', userUID);
        setUserUid(userUID);
      }
    } catch (error) {
      console.error('Error fetching current user: ', error);
    }
  };
  const callApi = async () => {
    try {
      // const usersCollection = collection(firestore, 'users'); // 'users' 컬렉션에 대한 참조를 생성
      //   const q = query(usersCollection, where('uid', '==', userUid)); // 'uid' 필드가 userUid와 같은 문서를 쿼리
      //   const querySnapshot = await getDocs(q);
      //   const userData = [];
      //   querySnapshot.forEach(doc => {
      //     userData.push({id: doc.id, ...doc.data()});
      //   });
      //   const data = await usersCollection.get();
      //   console.log('data', data.docs);
      const querySnapshot = await gusersCollection.doc(userUid).get();
      console.log('콘솔2222222222211', querySnapshot);
      const user = {...querySnapshot._data()};
      setUsers(user);
      console.log('userssss', user);
      //   if (querySnapshot.empty) {
      //     console.log('No matching documents.');
      //     return;
    } catch (error) {
      //   let user;
      //   querySnapshot.forEach(doc => {
      //     user = {id: doc.id, ...doc.data()};
      //   });

      //   setUsers([user]);

      //   console.log('데이터 불러오기');
      console.log(error.message);
    }
  };
  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      {users ? (
        <ScrollView>
          <Text style={styles.title}>마이페이지</Text>
          <View style={styles.profileHeader}>
            {/* onPress 추가 */}
            <TouchableOpacity>
              <Image
                source={{uri: users[0].profileImage}}
                style={styles.profileImageStyle}
              />
            </TouchableOpacity>
            <View style={styles.profileName}>
              <TouchableOpacity style={styles.name}>
                <Text style={styles.nameStyle}>{users[0].nickname}</Text>
                <Image source={rightArrow} style={{width: 40, height: 40}} />
              </TouchableOpacity>
              <Text style={styles.emailStyle}>{users[0].email}</Text>
            </View>
          </View>
          <View style={styles.infoStyle}>
            <Text
              // onPress={() => navigation.navigate('Home')}
              style={styles.editStyle}>
              내가 쓴 글
            </Text>
            <Text
              // onPress={() => navigation.navigate('Home')}
              style={styles.editStyle}>
              찜한 글
            </Text>
            <Text
              // onPress={() => navigation.navigate('Home')}
              style={styles.editStyle}>
              참여한 취미 목록
            </Text>
            <Text
              // onPress={() => navigation.navigate('Home')}
              style={styles.editStyle}>
              취미 수정
            </Text>
          </View>
          <View style={styles.additionalInfo}>
            <Text
              style={{
                color: '#3F3F3F',
                fontWeight: 'bold',
                fontSize: 14,
                margin: 15,
                marginTop: 25,
              }}>
              기타
            </Text>
            <TouchableOpacity
              // onPress={() => navigation.navigate('Home')}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.noticeStyle}>공지사항</Text>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  marginTop: 2,
                }}
                source={rightArrow}
              />
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={() =>
              //     navigation.navigate('Detail', {
              //         phone: users[0].phone,
              //     })
              // }
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.noticeStyle}>로그인 정보</Text>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  marginTop: 2,
                }}
                source={rightArrow}
              />
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={() => getPhotos()}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.noticeStyle}>약관 및 개인정보 처리 방침</Text>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  marginTop: 2,
                }}
                source={rightArrow}
              />
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={() => navigation.navigate('Home')}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                // onPress={() => navigation.navigate('Home')}
                style={styles.noticeStyle}>
                사업자 정보
              </Text>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  marginTop: 2,
                }}
                source={rightArrow}
              />
            </TouchableOpacity>
            <TouchableOpacity
              //   onPress={() => navigation.navigate('Home')}
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={styles.noticeStyle}>앱 정보</Text>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  marginTop: 2,
                }}
                source={rightArrow}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <Text style={styles.title}>마이페이지</Text>

          <Text>not users</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  title: {
    color: '#212529',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 30,
    marginTop: 10,
  },
  profileHeader: {
    // paddingBottom: 15,
    justifyContent: 'flex-start',
    // alignItems: 'center',
    paddingBottom: 10,
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 30,
  },
  profileName: {},
  name: {
    flexDirection: 'row',
  },
  nameStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    paddingBottom: 10,
  },
  emailStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#A7A7A7',
  },
  profileImageStyle: {
    borderRadius: 70,
    width: 70,
    height: 70,

    marginRight: 22,
  },
  profileWrapper: {
    backgroundColor: '#fff',

    // marginTop: -80,

    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  editStyle: {
    fontSize: 16,
    color: '#212529',
    flexDirection: 'row',
    // textAlign: 'center',
    // justifyContent: 'center',
    margin: 10,
    fontWeight: 'bold',
  },
  infoStyle: {
    fontSize: 16,
    // flexDirection: 'row',
    // textAlign: 'center',
    // justifyContent: 'center',
    marginLeft: 30,
    marginRight: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noticeStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3f3f3f',
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 15,
  },
  additionalInfo: {
    marginLeft: 30,
    marginRight: 30,
  },
});
export default Profile;
