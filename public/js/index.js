import '@babel/polyfill'; // to polyfill some of the features of javascript
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';


// dom elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userSettingsForm = document.querySelector('.form-user-settings');

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

if(userDataForm){
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  })
}


if(userSettingsForm){
  userSettingsForm.addEventListener('submit', async e => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await updateSettings({currentPassword, password, confirmPassword}, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
     
  });
}

