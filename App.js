
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Image, Alert, ActivityIndicator} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, deleteObject, list } from "firebase/storage";
import { TouchableOpacity } from 'react-native-web';



const Home = () => {
  const [imageUri, setImageUri] = useState("");
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState([null]);
  const [visible, setVisible] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyDqHPm3NdXYHdftVcGMYFfaajoKVSvVSNc",
    authDomain: "aula-app-19734.firebaseapp.com",
    projectId: "aula-app-19734",
    storageBucket: "aula-app-19734.appspot.com",
    messagingSenderId: "1082925922711",
    appId: "1:1082925922711:web:98b2765d913916c1acecd2",
    measurementId: "G-JX9X4JJ6Q8"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);



  //Armazena a imagem para o upload e exibe a imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      console.log(result.assets);
    }
  };

  function getRandom(max) {
    return Math.floor(Math.random() * max + 1)
  }



  //Método para realizar upload para o Firebase
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Selecione uma imagem antes de enviar.');
      return;
    }

    // Create a root reference
    const storage = getStorage();

    var name = getRandom(200);
    // Create a reference to 'mountains.jpg'
    const mountainsRef = ref(storage, name + '.jpg');

    const response = await fetch(imageUri);
    const blob = await response.blob();

    uploadBytes(mountainsRef, blob).then((snapshot) => {
      console.log(snapshot);
      alert('Imagem enviada com sucesso!!');
    });
  };


  //Listar no console as imagens salvas no storage
  async function LinkImage() {
    // Create a reference under which you want to list
    const storage = getStorage();
    const listRef = ref(storage);

    // Fetch the first page of 100.
    const firstPage = await list(listRef, { maxResults: 100 });
    var lista = [];
    firstPage.items.map((item) => {

      var link = ('https://firebasestorage.googleapis.com/v0/b/' +
        item.bucket + '/o/' + item.fullPath + '?alt=media');
      lista.push(link);

    })
    setImage(lista);
    setVisible(true);
    console.log(image);
  }

  async function deleteImage(imagePath) {
    try {
      if (!imagePath.includes('/o/') || !imagePath.includes('?')) {
        throw new Error('URL da imagem malformada');
      }

      const pathSegments = imagePath.split('/o/');
      if (pathSegments.length < 2) {
        throw new Error('URL da imagem malformada');
      }

      const decodedPath = decodeURIComponent(pathSegments[1].split('?')[0]);
      const storage = getStorage();
      const listaRef = ref(storage, decodedPath);

      deleteObject(listaRef).then(() => {
        Alert.alert('Imagem deletada com sucesso!');
        // Atualizar a lista de imagens
        setImage(image.filter(img => img !== imagePath));
      }).catch((error) => {
        console.error('Uh-oh, an error occurred!', error);
      });
    } catch (error) {
      console.error('Erro ao processar a URL da imagem:', error);
    }
  }
  return (
    <View style={{flex: 1, flexDirection: 'column', alignItems:"center", justifyContent:"top", backgroundColor:"#E6DDD7",paddingTop:20}} >
      <View style={{padding: 10,width: 180}} >
      <Button color={'green'}  title="Escolher Imagem" onPress={pickImage} />
      </View>
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200, marginVertical: 20 }} />}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={{padding: 10,width: 180}} > <Button color={'green'}  title="Enviar Imagem" onPress={uploadImage}  disabled={!imageUri} /></View>

      )}
      <View style={{padding: 10,width: 180}} ><Button color={'green'}  title="Ver Imagens" onPress={LinkImage}  /></View>
      <FlatList
        data={image}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20, alignItems: 'center' }}>
          {item && (
           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: item }} style={{ width: 150, height: 150 }} />
            <TouchableOpacity onPress={() => deleteImage(item)}>
        <Image source={require('./assets/trash.png')} style={{ width: 25, height: 25 }}  />
        </TouchableOpacity>
         </View>         
          )}
        </View>
        )}

      />

    </View>
  );
};

export default Home;
