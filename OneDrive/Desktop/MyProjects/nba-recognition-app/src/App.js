import {useState} from 'react';
import './App.css';
const uuid = require('uuid');

function App() {
  const [image, setImage] = useState('');
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate.');
  const [visitorName, setVisitorName] = useState('placeholder2.png');
  const [isAuth,setAuth] = useState(false);

  function sendImage(e) {
    e.preventDefault();
    setVisitorName(image.name);
    const visitorImageName = uuid.v4();
    fetch('https://hvobhke28g.execute-api.us-east-1.amazonaws.com/Dev/nba-visititor-image/${visitorImageName}.png', {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
      },
      body: image 
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      if (response.Message === 'NBA Employee Authorized') {
        setAuth(true);
        setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, you are authorized to enter the NBA!`)
      } else {
        setAuth(false);
        setUploadResultMessage('Thank you for visiting the NBA, you are unfortunatlely bannnnneeeeed LETS GOOO KNICKS!')
      }
    }).catch(error => {
      setAuth(false);
      setUploadResultMessage('There was an error processing your image, please try again.')
      console.error(error);
    })
  }
 
  async function authenticate(visitorImageName) {
    const requestURL = 'https://hvobhke28g.execute-api.us-east-1.amazonaws.com/Dev/employee?' + new URLSearchParams({
      objectKey: '${visitorImageName}.png'
    });   
    return await fetch(requestURL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
    .then((data) => {
      return data;
    }).catch(error => console.error(error));
  } 

  return (
    <div className="App">
      <h2>NBA Facial Recognition App</h2>
      <form onSubmit={sendImage}>
        <input type='file' accept='image' onChange={e => setImage(e.target.files[0])}/>
        <button type='submit'>Upload Image</button>
      </form>
      <div className={isAuth ? 'success' : 'failure' }>{uploadResultMessage}</div>
      <img src={ require(`./visitors/${visitorName}`) } alt="Visitor" height={250} width={250}/>
    </div>
  );
}

export default App;