import React, { useRef, useState, useCallback, createRef } from 'react';
import './App.css';
import Webcam from "react-webcam";
import axios from 'axios'
import fileDownload from 'js-file-download'
import { Header, Grid, Button, Icon, Message, Loader } from 'semantic-ui-react'


function App() {

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load, setLoad] = useState(false);
  let fileInputRef = createRef();
  document.title = 'Web OCR' 




  /////////////////////////////////////////////////////--------------------txt--------------------------////////////////////

  const txt = () => {
    let url = 'http://localhost:5000/txt'
    var formData = new FormData()
    formData.append('txt', textOcr)
    var config = {
      headers:
      {'Content-Type': 'text/plain'}
    }
     axios.post(url, formData, config)
     .then((res)=>{
      console.log('dtxt',res.data)
      let handleDownload = (url, filename) => {
        axios.get(url, {
          responseType: 'blob',
        })
        .then((res) => {
          fileDownload(res.data, filename)
        })
      }
      console.log(`imgSrc`,setImgSrc)
      handleDownload(res.data.path,`your_text.txt`)
    })  
    
}



  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  const capture = useCallback(() => {
    setLoad(true)
    const imageSrc = webcamRef.current.getScreenshot();
    // console.log(imageSrc)  
    let url = 'http://localhost:5000/capture'
    let config = {
      headers: {'Content-Type': 'application/json'} 
    }
    let dataBody = {
      img: imageSrc
    }

     axios.post(url, dataBody, config)
    .then((res) => {
        console.log('cap',res.data)
        setTextOcr(res.data.text)
        setImgSrc(imageSrc);
        setLoad(false)
    })
    .catch((err) => {
      console.log(err)
    })
    
  }, [webcamRef, setImgSrc]
  );

  const upload = (file) => {
    setLoad(true)
    var url = 'http://localhost:5000/upload'
    var formData = new FormData()
    formData.append('file', file)
    console.log(file,formData)
    var config = {
      headers:
      {'Content-Type': 'multipart/form-data'}
    }
    return axios.post(url, formData, config)
    .then((res)=>{
      console.log('upload',res.data)
      setTextOcr(res.data.text)
      setImgSrc(res.data.image);
      setLoad(false)
    })
  }
  
  return (
    
    <>
      <center>
      
        
        <Header style={{margin:40, fontSize:50, fontFamily:'roboto'}} size='huge'>
        <img src="logo.png" alt="logo" width="50" height="60"></img>
             Web OCR
        </Header>
      </center>

      <Grid divided>
        <Grid.Column style={{width:"50%"}} key={0}>
          <center>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
            />
            <Grid.Column>
              <Button size='big' onClick={capture} 
              style={{margin:20}} icon labelPosition='left' inverted color='red'>
                <Icon name='camera' />
                Capture
              </Button>
              
              <Button size='big' onClick={() => fileInputRef.current.click()} 
              style={{margin:20}} icon labelPosition='left' inverted color='blue'>
                <Icon name='upload' />
                Upload
                <form encType="multipart/form-data">
                  <input ref={fileInputRef} type='file' hidden name='filename'
                  onChange={(x)=>{upload(x.target.files[0])}}
                  accept="image/*"
                  />
                </form>
              </Button>
            </Grid.Column>
          </center>
        </Grid.Column>
        
        <Grid.Column style={{width:"50%"}} key={1}>
          {
            load
            ?
            <Loader style={{marginTop: 120}} active inline='centered' size='big'>Loading...</Loader>
            :
            (
              imgSrc 
              ?
              <>
                <Header style={{margin:10, fontFamily:'roboto'}} size='large'>
                  Result
                </Header>
                <img style= {{marginLeft:10, height:'50%', width:'70%'}} alt="captured" src={imgSrc}/>
                <Message
                  size='massive'
                  color='orange'
                  header={textOcr}
                  content=""
                  style={{margin:15}}
                />
                 <Button size='big' onClick={txt} 
              style={{margin:20}} icon labelPosition='left' inverted color='orange'>
                <Icon name='file' />
                Save Text in a txt file and Download
              </Button>
              </>
              :
              <Header style={{margin:10, fontFamily:'roboto'}} size='large'>
                Capture or Upload a image file to get the Text from image.
              </Header>
            )
          }
        </Grid.Column>
      </Grid>
    </>
  );
}

export default App;
