import '@babel/polyfill'; // to polyfill some of the features of javascript
import { login } from './login';
import { logout } from './login';
import { displayMap } from './mapbox';


// dom elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');



// delegation
if(mapBox){
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if(loginForm){
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    // values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  }); 
}

if(logOutBtn) logOutBtn.addEventListener('click', logout); 
