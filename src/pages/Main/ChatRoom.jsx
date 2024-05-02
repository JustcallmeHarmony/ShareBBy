import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import ChatRoomNameChangeModal from '../../components/Chat/ChatRoomNameChangeModal';

const ChatRoom = ({route, navigation}) => {
  const {chatRoomId, chatRoomName} = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isHamburgerModalVisible, setIsHamburgerModalVisible] = useState(false);
  const [isPlusModalVisible, setIsPlusModalVisible] = useState(false);
  const [chatRoomNameChangeModalVisible, setChatRoomNameChangeModalVisible] =
    useState(false);
  const [isKeyboardAvoidingPosition, setIsKeyboardAvoidingPosition] =
    useState(false);

  const [chatMembers, setChatMembers] = useState([]);
  const [newChatRoomName, setNewChatRoomName] = useState('');

  const photoList = [
    {
      id: 1,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
    {
      id: 2,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
    {
      id: 3,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
    {
      id: 4,
      imageUrl:
        'https://firebasestorage.googleapis.com/v0/b/sharebby-4d82f.appspot.com/o/dummyprofile.png?alt=media&token=a34d85db-3310-4052-84f0-f0bdfc9e88c8',
    },
  ];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const toggleHamburgerModal = () => {
    setIsHamburgerModalVisible(!isHamburgerModalVisible);
  };

  const togglePlusModal = () => {
    setIsPlusModalVisible(!isPlusModalVisible);
    setIsKeyboardAvoidingPosition(isPlusModalVisible);
  };

  const toggleChatRoomNameChangeModal = () => {
    setChatRoomNameChangeModalVisible(!chatRoomNameChangeModalVisible);
  };

  useEffect(() => {
    const messageListener = firestore()
      .collection('chatRooms')
      .doc(chatRoomId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const newMessages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(newMessages);
        }
      });

    return () => messageListener();
  }, [chatRoomId]);

  const getChatRoomMembers = async () => {
    try {
      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
      const chatRoomSnapshot = await chatRoomRef.get();
      if (chatRoomSnapshot.exists) {
        const {members} = chatRoomSnapshot.data();
        const memberDetails = [];
        for (const memberId of members) {
          const userSnapshot = await firestore()
            .collection('users')
            .doc(memberId)
            .get();
          if (userSnapshot.exists) {
            const userData = userSnapshot.data();
            memberDetails.push(userData);
          }
        }
        console.log('Chat room members:', memberDetails);
        setChatMembers(memberDetails);
        // console.log('chatMembers:', chatMembers);
      } else {
        // console.log('Chat room does not exist.');
      }
    } catch (error) {
      console.error('Error fetching chat room members:', error);
    }
  };

  useEffect(() => {
    getChatRoomMembers();
  }, [chatRoomId]);

  const sendMessage = async () => {
    try {
      if (!inputMessage.trim()) {
        return;
      }

      const currentUser = auth().currentUser;

      let senderName = 'Unknown';
      if (currentUser) {
        const userSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        if (userSnapshot.exists) {
          senderName = userSnapshot.data().nickname;
          senderProfileImg = userSnapshot.data().profileImage;
        }
      }

      const newMessage = {
        text: inputMessage,
        sender: senderName,
        senderId: currentUser ? currentUser.uid : null,
        timestamp: firestore.FieldValue.serverTimestamp(),
        senderProfileImg: senderProfileImg,
      };

      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .collection('messages')
        .add(newMessage);

      setMessages(prevMessages => [newMessage, ...prevMessages]);

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const updateChatRoomName = async newName => {
    try {
      await firestore()
        .collection('chatRooms')
        .doc(chatRoomId)
        .update({name: newName});
      toggleChatRoomNameChangeModal();
      navigation.goBack();
    } catch (error) {
      console.error('Error updating chat room name:', error);
    }
  };

  const deleteChat = async () => {
    try {
      const currentUser = auth().currentUser;

      const currentUserUID = currentUser ? currentUser.uid : null;

      const chatRoomRef = firestore().collection('chatRooms').doc(chatRoomId);
      const chatRoomSnapshot = await chatRoomRef.get();
      const currentMembers = chatRoomSnapshot.data().members;

      const updatedMembers = currentMembers.filter(
        memberUID => memberUID !== currentUserUID,
      );

      await chatRoomRef.update({members: updatedMembers});

      console.log('채팅방 삭제 완료');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renderItem = ({item, index}) => {
    dayjs.locale('ko');
    const isCurrentUser = item.senderId === auth().currentUser?.uid;
    const isFirstMessage = index === messages.length - 1;
    const prevItem = messages[index + 1];
    const isDifferentDay =
      prevItem &&
      !dayjs(item.createdAt).isSame(dayjs(prevItem.createdAt), 'day');

    const showDateSeparator = isFirstMessage || isDifferentDay;

    const showTime =
      index === 0 ||
      item.senderId !== messages[index - 1].senderId ||
      isDifferentDay ||
      (index > 0 &&
        !dayjs(item.createdAt).isSame(
          dayjs(messages[index - 1].createdAt),
          'minute',
        ));

    const showProfileInfo =
      ((showDateSeparator && item.senderId !== auth().currentUser?.uid) ||
        (item.senderId !== prevItem?.senderId && !isCurrentUser)) &&
      item.senderId !== auth().currentUser?.id;

    return (
      <View>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          {showDateSeparator && (
            <View>
              <Text style={{paddingVertical: 22, color: '#aaa', fontSize: 12}}>
                {dayjs(item.createdAt).format('YYYY년 MM월 DD일')}{' '}
              </Text>
            </View>
          )}
        </View>
        {showProfileInfo && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginHorizontal: 12,
              marginBottom: 12,
              alignItems: 'center',
            }}>
            <Image
              style={{width: 30, height: 30, borderRadius: 10}}
              source={{uri: item.senderProfileImg}}
            />
            <Text style={{fontWeight: '700'}}>{item.sender}</Text>
          </View>
        )}
        {isCurrentUser ? (
          <View style={styles.sentByUserWrapper}>
            {showTime && (
              <View style={{marginBottom: 8}}>
                <Text style={{color: '#aaa', fontSize: 10}}>
                  {dayjs(item.createdAt).format('A hh:mm')}
                </Text>
              </View>
            )}
            <View style={styles.sentByUserMessage}>
              <Text>{item.text}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.sentByOtherWrapper}>
            <View style={styles.sentByOtherMessage}>
              <Text>{item.text}</Text>
            </View>
            {showTime && (
              <View style={{marginBottom: 8}}>
                <Text style={{color: '#aaa', fontSize: 10}}>
                  {dayjs(item.createdAt).format('A hh:mm')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            style={{width: 30, height: 30}}
            source={require('../../assets/icons/back.png')}
          />
        </TouchableOpacity>
        <Text style={styles.roomName}>{chatRoomName}</Text>
        <TouchableOpacity onPress={toggleHamburgerModal}>
          <Image
            style={{width: 40, height: 40}}
            source={require('../../assets/icons/HamburgerMenu.png')}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        inverted
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.inputContainer}>
        <TouchableOpacity onPress={togglePlusModal}>
          <Image
            style={{width: 24, height: 24}}
            source={require('../../assets/icons/plus.png')}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          value={inputMessage}
          onChangeText={text => setInputMessage(text)}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          multiline={true}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Image
            style={{width: 25, height: 25}}
            source={require('../../assets/icons/right-arrow.png')}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal
        isVisible={isHamburgerModalVisible}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
        onBackdropPress={toggleHamburgerModal}
        style={{margin: 0, justifyContent: 'flex-end'}}>
        <SafeAreaView style={{flex: 1, alignItems: 'flex-end'}}>
          <View style={styles.modalContent}>
            <View
              style={{
                width: '100%',
                flex: 1,
                paddingHorizontal: 8,
                paddingVertical: 8,
                gap: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
              }}>
              <View
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginHorizontal: 8,
                  paddingTop: 8,
                }}>
                <TouchableOpacity>
                  <Text style={{fontSize: 16, fontWeight: '700'}}>사진</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require('../../assets/icons/right-arrow.png')}
                    style={{width: 16, height: 16}}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  width: '100%',
                  flex: 2,
                  alignItems: 'center',
                }}>
                <FlatList
                  horizontal
                  data={photoList.slice(0, 4)}
                  renderItem={({item}) => (
                    <View style={{marginHorizontal: 4}}>
                      <Image
                        style={{width: 64, height: 64, borderRadius: 8}}
                        source={{uri: item.imageUrl}}
                      />
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </View>

            <View
              style={{
                flex: 2,
                width: '100%',
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                gap: 8,
                paddingHorizontal: 8,
              }}>
              <View style={{marginBottom: 8}}>
                <Text style={{fontSize: 16, fontWeight: '700'}}>참여 멤버</Text>
              </View>
              <FlatList
                data={chatMembers}
                renderItem={({item}) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 16,
                    }}>
                    <Image
                      source={{uri: item.profileImage}}
                      style={{width: 30, height: 30, borderRadius: 8}}
                    />
                    <Text>{item.nickname}</Text>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>

            <View
              style={{
                width: '100%',
                flex: 0.2,
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                paddingHorizontal: 8,
                gap: 8,
              }}>
              <TouchableOpacity>
                <Text
                  style={{fontSize: 16, fontWeight: '700', marginBottom: 8}}>
                  공지 사항
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '100%',
                flex: 1,
                borderBottomWidth: 1,
                borderBottomColor: '#E0E0E0',
                paddingHorizontal: 8,
                gap: 8,
              }}>
              <Text style={{fontSize: 16, fontWeight: '700', marginBottom: 8}}>
                채팅방 설정
              </Text>
              <TouchableOpacity onPress={toggleChatRoomNameChangeModal}>
                <Text>채팅방 이름 변경</Text>
              </TouchableOpacity>
              <ChatRoomNameChangeModal
                isVisible={chatRoomNameChangeModalVisible}
                toggleChatRoomNameChangeModal={toggleChatRoomNameChangeModal}
                updateChatRoomName={updateChatRoomName}
              />
              <TouchableOpacity>
                <Text>채팅방 사진 변경</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: '100%',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 16,
              }}>
              <TouchableOpacity onPress={deleteChat}>
                <Text style={{fontSize: 18, fontWeight: '700'}}>
                  채팅방 나가기
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleHamburgerModal}>
                <Text>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        isVisible={isPlusModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        onBackdropPress={togglePlusModal}
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          margin: 0,
        }}>
        <View
          style={{
            flex: 0.2,
            width: '100%',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              flex: 3,
            }}>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <Image
                style={{width: 32, height: 32}}
                source={require('../../assets/icons/image.png')}
              />
              <Text>사진</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <Image
                style={{width: 32, height: 32}}
                source={require('../../assets/icons/image.png')}
              />
              <Text>카메라</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <Image
                style={{width: 36, height: 36}}
                source={require('../../assets/icons/calender.png')}
              />
              <Text>일정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{alignItems: 'center', justifyContent: 'center', gap: 8}}>
              <Image
                style={{width: 32, height: 32}}
                source={require('../../assets/icons/locationIcon.png')}
              />
              <Text>지도</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{flex: 1}} onPress={togglePlusModal}>
            <Text>취소</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sentByUserWrapper: {
    flexDirection: 'row',
    marginRight: 14,
    marginBottom: 4,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: 6,
  },
  sentByUserMessage: {
    backgroundColor: '#7AD2B9',
    borderRadius: 12,
    padding: 10,
    maxWidth: '50%',
    marginBottom: 8,
  },
  sentByOtherWrapper: {
    flexDirection: 'row',
    marginLeft: 14,
    marginBottom: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    gap: 8,
  },
  sentByOtherMessage: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 10,
    maxWidth: '50%',
    marginBottom: 8,
  },
  modalContent: {
    flex: 1,
    width: 300,
    marginBottom: 0,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
});

export default ChatRoom;
