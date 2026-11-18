// js/auth.js
import { supabase } from './supabase.js';

// Login form is present only on login.html.
const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
      if (errorMsg) errorMsg.textContent = 'Please enter your email and password.';
      return;
    }

    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    if (errorMsg) errorMsg.textContent = '';

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (errorMsg) errorMsg.textContent = error.message;
      if (submitButton) submitButton.disabled = false;
      return;
    }

    window.location.href = 'index.html';
  });
}

// Returns true only when a valid session exists.
// index.html relies on this return value before loading protected data.
export async function checkAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      if (!window.location.pathname.toLowerCase().endsWith('/login.html')) {
        window.location.replace('login.html');
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unable to verify the login session:', error);
    if (!window.location.pathname.toLowerCase().endsWith('/login.html')) {
      window.location.replace('login.html');
    }
    return false;
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert('Unable to log out: ' + error.message);
    return;
  }

  window.location.replace('login.html');
}
