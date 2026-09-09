// js/auth.js
import { supabase } from './supabase.js';

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('errorMsg');

// Login Logic
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorMsg.textContent = error.message;
    } else {
      window.location.href = 'index.html';
    }
  });
}

// Session Guard Logic (Protect Pages)
export async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

// Logout Logic
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}